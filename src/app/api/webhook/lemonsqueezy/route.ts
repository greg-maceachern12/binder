import { supabase } from '@/app/lib/supabase/client';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Verify the webhook signature from Lemon Squeezy
function verifySignature(payload: string, signature: string, secret: string) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

export async function POST(req: Request) {
  try {
    // Get the raw body and signature
    const payload = await req.text();
    const signature = req.headers.get('X-Signature');
    console.log("Webhook received");
    // Verify the webhook signature
    const WEBHOOK_SECRET = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET || !signature || !verifySignature(payload, signature, WEBHOOK_SECRET)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const data = JSON.parse(payload);
    console.log(data);
    // Check if this is an order_created event
    if (data.meta.event_name !== 'order_created') {
      return NextResponse.json({ message: 'Ignored event' }, { status: 200 });
    }

    // Get the syllabus_id from the order metadata
    const syllabusId = data.meta.custom_data?.syllabus_id;
    if (!syllabusId) {
      return NextResponse.json({ error: 'No syllabus ID found' }, { status: 400 });
    }

    // Update the Supabase table using the existing client
    const { error } = await supabase
      .from('syllabi')
      .update({ purchased: true })
      .eq('id', syllabusId);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Success' }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 