import { supabase } from '@/app/lib/supabase/client';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // Get the raw body
    const payload = await req.text();
    
    // Parse the event payload immediately - we'll skip signature verification
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
