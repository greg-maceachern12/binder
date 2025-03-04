import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase/client';
import { headers } from 'next/headers';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    // Get payload and headers
    const payload = await request.text();
    const headersList = await headers();
    const signatureHeader = headersList.get('webhook-signature');
    const timestamp = headersList.get('webhook-timestamp');
    const WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET;
    
    // Basic validation
    if (!WEBHOOK_SECRET || !signatureHeader) {
      console.error('Missing webhook secret or signature');
      return NextResponse.json({ error: 'Configuration error' }, { status: 401 });
    }
    
    // Verify signature
    try {
      // Parse signature format: v1,signature
      const [version, signature] = signatureHeader.split(',');
      if (version !== 'v1') {
        return NextResponse.json({ error: 'Invalid signature version' }, { status: 401 });
      }
      
      // Create signature using timestamp+payload (common webhook pattern)
      const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
      const data = timestamp ? `${timestamp}.${payload}` : payload;
      const computedSignature = hmac.update(data).digest('base64');
      
      console.log('Computed:', computedSignature);
      console.log('Received:', signature);
      
      if (computedSignature !== signature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    } catch (error) {
      console.error('Signature verification error:', error);
      return NextResponse.json({ error: 'Signature error' }, { status: 401 });
    }

    // Parse and process the event
    const event = JSON.parse(payload);
    if (!event.type?.startsWith('subscription.') || !event.data?.user_id) {
      return NextResponse.json({ status: 'ignored' });
    }

    // Update user subscription in database
    const { data: userData, error: updateError } = await supabase
      .from('users')
      .update({ 
        subscription_status: event.data.status,
        subscription: ['subscription.cancelled', 'subscription.revoked'].includes(event.type) 
          ? null 
          : event.data.id
      })
      .eq('id', event.data.user_id);

    if (updateError) {
      console.error('Database error:', updateError);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}