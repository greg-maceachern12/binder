import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase/client';
import { headers } from 'next/headers';
import crypto from 'crypto';

// Webhook secret should be stored in environment variable
const POLAR_WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET;

// Verify the webhook signature from Polar
function verifyPolarSignature(payload: string, signature: string) {
  if (!POLAR_WEBHOOK_SECRET) {
    console.error('POLAR_WEBHOOK_SECRET is not set');
    return false;
  }

  const hmac = crypto
    .createHmac('sha256', POLAR_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(hmac)
  );
}

export async function POST(request: Request) {
  try {
    const payload = await request.text();
    const headersList = await headers();
    const signature = headersList.get('polar-signature');

    // Verify webhook signature
    if (!signature || !verifyPolarSignature(payload, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(payload);
    const eventType = event.type;

    // Handle subscription events
    switch (eventType) {
      case 'subscription.created': {
        const { 
          subscription: { 
            user_id,
            status,
            subscription_id 
          }
        } = event.data;

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
        const { 
          id: subscription_id,
          user_id,
          status 
        } = event.data;

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
        const { 
          id: subscription_id,
          user_id,
          status 
        } = event.data;

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
        const { 
          user_id,
          status 
        } = event.data;

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
        const { 
          id: subscription_id,
          user_id,
          status 
        } = event.data;

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