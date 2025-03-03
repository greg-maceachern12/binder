import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase/client";
import * as crypto from 'crypto';

// Verify webhook signature from Polar
function verifyPolarSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(digest, 'hex'),
    Buffer.from(signature, 'hex')
  );
}

export async function POST(request: NextRequest) {
  try {
    // Get the raw request body for signature verification
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);
    
    // Get the Polar signature from headers
    const signature = request.headers.get('polar-signature');
    
    // Verify the signature
    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error('Missing POLAR_WEBHOOK_SECRET environment variable');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    if (!signature || !verifyPolarSignature(rawBody, signature, webhookSecret)) {
      console.error('Invalid signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }
    
    // Now that we've verified the webhook, process the event
    const eventType = body.type;
    
    // Only process order.created events
    if (eventType === 'order.created') {
      // Extract the syllabus_id from the metadata
      const syllabusId = body.data.metadata?.syllabus_id;
      
      if (!syllabusId) {
        console.error('No syllabus_id found in order metadata');
        return NextResponse.json(
          { error: 'Missing syllabus_id in order metadata' },
          { status: 400 }
        );
      }
      
      // Update the syllabi table to mark the syllabus as purchased
      const { error } = await supabase
        .from('syllabi')
        .update({ purchased: true })
        .eq('id', syllabusId);
      
      if (error) {
        console.error('Error updating syllabus purchase status:', error);
        return NextResponse.json(
          { error: 'Database update failed' },
          { status: 500 }
        );
      }
      
      console.log(`Successfully marked syllabus ${syllabusId} as purchased`);
      return NextResponse.json({ success: true });
    }
    
    // For other event types, just acknowledge receipt
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}