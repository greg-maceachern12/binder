import { supabase } from '@/app/lib/supabase/client';
import { NextResponse } from 'next/server';
// import crypto from 'crypto';

// // Verify the webhook signature from Polar
// function verifySignature(payload: string, signature: string, secret: string) {
//   const hmac = crypto.createHmac('sha256', secret);
//   const digest = hmac.update(payload).digest('hex');
//   return signature === digest;
// }

export async function POST(req: Request) {
  try {
    // Get the raw body
    const payload = await req.text();
    
    // Get the signature and timestamp from the correct headers
    // const signatureHeader = req.headers.get('webhook-signature');
    
    // // Extract the actual signature from the header (format: v1,signature)
    // let signature = null;
    // if (signatureHeader && signatureHeader.includes(',')) {
    //   signature = signatureHeader.split(',')[1];
    // }
    
    // // Verify the webhook signature if configured
    // const WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET;
    
    // // Skip verification in development if needed
    // const skipVerification = process.env.SKIP_WEBHOOK_VERIFICATION === 'true';
    
    // if (!skipVerification && WEBHOOK_SECRET) {
    //   if (!signature) {
    //     console.error('No valid signature found in webhook-signature header');
    //     return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    //   }
      
    //   if (!verifySignature(payload, signature, WEBHOOK_SECRET)) {
    //     console.error('Signature verification failed');
    //     return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    //   }
    // }
    
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

    // Determine whether to clear the subscription ID
    // - For cancellations and revocations, clear the subscription
    const clearSubscription = ['subscription.canceled', 'subscription.revoked'].includes(data.type);
    
    // Prepare update data matching your schema
    const updateData = {
      subscription_status: data.data.status,
      subscription: clearSubscription ? null : data.data.id,
      polar_id: data.data.user_id || data.data.customer.id,
      updated_at: new Date().toISOString()
    };

    console.log('Updating user subscription data:', {
      email: data.data.customer.email,
      status: updateData.subscription_status,
      subscription: updateData.subscription || 'null'
    });

    // Update the user's subscription status
    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('email', data.data.customer.email);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Success',
      event: data.type,
      email: data.data.customer.email,
      status: updateData.subscription_status,
      subscription: updateData.subscription
    }, { status: 200 });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
