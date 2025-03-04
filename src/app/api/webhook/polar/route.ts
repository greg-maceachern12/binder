import { supabase } from '@/app/lib/supabase/client';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Verify the webhook signature from Polar
function verifySignature(payload: string, signature: string, secret: string) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return signature === digest;
}

export async function POST(req: Request) {
  try {
    // Get the raw body and signature
    const payload = await req.text();
    const signature = req.headers.get('polar-signature')?.split(',')[1]; // Extract actual signature from 'v1,signature'
    
    console.log("Polar webhook received", { 
      signaturePresent: !!signature, 
      payloadLength: payload.length 
    });
    
    // Verify the webhook signature
    const WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET;
    
    // Skip verification in development if needed
    const skipVerification = process.env.NODE_ENV === 'development' && process.env.SKIP_WEBHOOK_VERIFICATION === 'true';
    
    if (!skipVerification && (!WEBHOOK_SECRET || !signature || !verifySignature(payload, signature, WEBHOOK_SECRET))) {
      console.error('Signature verification failed', { 
        secretPresent: !!WEBHOOK_SECRET,
        signaturePresent: !!signature
      });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

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

    // Ensure we have user_id
    if (!data.data?.user_id) {
      console.error('No user_id found in webhook payload');
      return NextResponse.json({ error: 'No user_id found' }, { status: 400 });
    }

    // Update the user's subscription status
    const { error } = await supabase
      .from('users')
      .update({ 
        subscription_status: data.data.status,
        subscription: ['subscription.canceled', 'subscription.revoked'].includes(data.type) 
          ? null 
          : data.data.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', data.data.user_id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Success',
      event: data.type,
      user_id: data.data.user_id
    }, { status: 200 });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
