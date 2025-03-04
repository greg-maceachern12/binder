import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase/client';
import { headers } from 'next/headers';
import crypto from 'crypto';

// Verify the webhook signature from Polar
function verifySignature(payload: string, signatureHeader: string, secret: string) {
  try {
    // Parse the signature header which has format: v1,signature
    const [version, signature] = signatureHeader.split(',');
    
    if (version !== 'v1') {
      console.error(`Unsupported signature version: ${version}`);
      return false;
    }
    
    // Create HMAC using webhook secret
    const hmac = crypto.createHmac('sha256', secret);
    const computedSignature = hmac.update(payload).digest('base64');
    
    console.log('Computed signature:', computedSignature);
    console.log('Received signature:', signature);
    
    // Compare the signatures
    return computedSignature === signature;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    // Get the raw body and signature
    const payload = await request.text();
    
    // Use Next.js headers() API to get all headers
    const headersList = await headers();
    console.log("Polar webhook received");
    
    // Get the signature from the correct header
    const signatureHeader = headersList.get('webhook-signature');
    
    // Verify the webhook secret is configured
    const WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
      console.error('POLAR_WEBHOOK_SECRET is not set');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }
    
    // Check if we found a signature
    if (!signatureHeader) {
      console.error('No webhook-signature header found');
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }
    
    // Verify the signature
    if (!verifySignature(payload, signatureHeader, WEBHOOK_SECRET)) {
      console.error('Signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    console.log('Signature verified successfully');
    
    const event = JSON.parse(payload);
    const eventType = event.type;
    
    console.log(`Processing event type: ${eventType}`);

    // Handle subscription events
    switch (eventType) {
      case 'subscription.created': {
        console.log('Handling subscription.created event');
        // Extract user details from the event
        const user_id = event.data.user_id;
        const status = event.data.status;
        const subscription_id = event.data.id;
        
        if (!user_id) {
          console.error('No user_id found in subscription.created payload');
          return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        // Update user's subscription status in database
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            subscription: subscription_id,
            subscription_status: status
          })
          .eq('id', user_id);

        if (updateError) {
          console.error('Error updating subscription:', updateError);
          return NextResponse.json(
            { error: 'Failed to update subscription' },
            { status: 500 }
          );
        }

        return NextResponse.json({ status: 'success' });
      }

      case 'subscription.updated': {
        console.log('Handling subscription.updated event');
        // Extract details from the event
        const subscription_id = event.data.id;
        const user_id = event.data.user_id;
        const status = event.data.status;
        
        if (!user_id) {
          console.error('No user_id found in subscription.updated payload');
          return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        // Update user's subscription details
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            subscription: subscription_id,
            subscription_status: status
          })
          .eq('id', user_id);

        if (updateError) {
          console.error('Error updating subscription:', updateError);
          return NextResponse.json(
            { error: 'Failed to update subscription' },
            { status: 500 }
          );
        }

        return NextResponse.json({ status: 'success' });
      }

      case 'subscription.active': {
        console.log('Handling subscription.active event');
        // Extract details from the event
        const subscription_id = event.data.id;
        const user_id = event.data.user_id;
        const status = event.data.status;
        
        if (!user_id) {
          console.error('No user_id found in subscription.active payload');
          return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        // Update user's subscription to active status
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            subscription: subscription_id,
            subscription_status: status
          })
          .eq('id', user_id);

        if (updateError) {
          console.error('Error activating subscription:', updateError);
          return NextResponse.json(
            { error: 'Failed to activate subscription' },
            { status: 500 }
          );
        }

        return NextResponse.json({ status: 'success' });
      }

      case 'subscription.cancelled':
      case 'subscription.revoked': {
        console.log(`Handling ${eventType} event`);
        // Extract details from the event
        const user_id = event.data.user_id;
        const status = event.data.status;
        
        if (!user_id) {
          console.error(`No user_id found in ${eventType} payload`);
          return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        // Update user's subscription status to cancelled/revoked
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            subscription_status: status,
            subscription: null
          })
          .eq('id', user_id);

        if (updateError) {
          console.error(`Error ${eventType} subscription:`, updateError);
          return NextResponse.json(
            { error: `Failed to process ${eventType}` },
            { status: 500 }
          );
        }

        return NextResponse.json({ status: 'success' });
      }

      case 'subscription.uncanceled': {
        console.log('Handling subscription.uncanceled event');
        // Extract details from the event
        const subscription_id = event.data.id;
        const user_id = event.data.user_id;
        const status = event.data.status;
        
        if (!user_id) {
          console.error('No user_id found in subscription.uncanceled payload');
          return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        // Update user's subscription status back to active
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            subscription: subscription_id,
            subscription_status: status
          })
          .eq('id', user_id);

        if (updateError) {
          console.error('Error uncancelling subscription:', updateError);
          return NextResponse.json(
            { error: 'Failed to uncancelled subscription' },
            { status: 500 }
          );
        }

        return NextResponse.json({ status: 'success' });
      }

      default:
        // Handle other webhook events or ignore them
        console.log(`Received unhandled event type: ${eventType}`);
        return NextResponse.json({ status: 'ignored' });
    }

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}