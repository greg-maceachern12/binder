import { supabase } from '@/app/lib/supabase/client';
import { NextResponse } from 'next/server';
import { polarClient, verifySubscription } from '@/app/lib/polar/client';
import crypto from 'crypto';

// Verify the webhook signature from Polar
function verifySignature(payload: string, signature: string, secret: string) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return signature === digest;
}

export async function POST(req: Request) {
  try {
    // Get the raw body
    const payload = await req.text();
    
    // Get the signature from headers
    const signature = req.headers.get('polar-signature') || '';
    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET || '';
    
    // Skip verification if in development or explicitly disabled
    const skipVerification = process.env.SKIP_WEBHOOK_VERIFICATION === 'true';
    
    // Verify webhook signature except when explicitly skipped
    if (!skipVerification && webhookSecret) {
      const isValid = verifySignature(payload, signature, webhookSecret);
      if (!isValid) {
        console.error('Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }
    
    // Parse the event payload
    const data = JSON.parse(payload);
    console.log("Polar event received:", data.type);
    
    // Check for subscription events
    const supportedEvents = [
      'subscription.created',
      'subscription.updated',
      'subscription.active',
      'subscription.canceled',
      'subscription.uncanceled',
      'subscription.revoked'
    ];
    
    if (!supportedEvents.includes(data.type)) {
      return NextResponse.json({ message: 'Ignored event' }, { status: 200 });
    }

    // Ensure we have customer email
    if (!data.data?.customer?.email) {
      console.error('No customer email found in webhook payload');
      return NextResponse.json({ error: 'No email found' }, { status: 400 });
    }

    // Determine whether this is an active subscription event
    const isActiveSubscriptionEvent = ['subscription.created', 'subscription.updated', 'subscription.active', 'subscription.uncanceled'].includes(data.type);
    
    // Extract subscription ID and customer ID from the payload
    const subscriptionId = data.data.id || null;
    const polarId = data.data.customer?.id || null;
    
    // For active subscription events, verify the subscription with the API
    let isActive = false;
    if (isActiveSubscriptionEvent && subscriptionId) {
      try {
        // Verify subscription with Polar API
        isActive = await verifySubscription(subscriptionId);
        console.log(`Subscription ${subscriptionId} verified with API: ${isActive ? 'active' : 'inactive'}`);
      } catch (error) {
        console.error('Error verifying subscription with API:', error);
        // Continue processing even if verification fails
        // We'll use the event data as fallback
        isActive = isActiveSubscriptionEvent; 
      }
    }

    // Prepare update data matching your schema
    const updateData = {
      polar_id: polarId,
      subscription_id: isActive ? subscriptionId : null,
      // Set trial_active to true for new active subscriptions to ensure they have full access
      trial_active: isActive ? true : false,
      updated_at: new Date().toISOString()
    };

    console.log('Updating user subscription data:', {
      email: data.data.customer.email,
      subscription_id: updateData.subscription_id || 'null',
      polar_id: updateData.polar_id || 'null',
      isActive
    });

    // First try to find the user by email
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', data.data.customer.email)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }

    if (!existingUser) {
      console.log('User not found with email:', data.data.customer.email);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update the user's subscription status
    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', existingUser.id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Success',
      event: data.type,
      email: data.data.customer.email,
      subscription_id: updateData.subscription_id,
      polar_id: updateData.polar_id,
      isActive
    }, { status: 200 });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
