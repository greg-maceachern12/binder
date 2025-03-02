import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    
    // Verify the webhook payload
    // Note: In production, you should verify the webhook signature
    // using a shared secret to ensure the request is coming from Polar
    
    // Check if this is a successful payment event
    if (payload.event === 'checkout.completed') {
      // Extract the syllabus_id from the metadata
      const syllabus_id = payload.metadata?.syllabus_id;
      
      if (!syllabus_id) {
        return NextResponse.json(
          { success: false, error: 'No syllabus_id in metadata' },
          { status: 400 }
        );
      }
      
      // Update the syllabus in Supabase
      const { error } = await supabase
        .from('syllabi')
        .update({ purchased: true })
        .eq('id', syllabus_id);
        
      if (error) {
        console.error('Error updating syllabus:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to update syllabus' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({ success: true });
    }
    
    // Handle other events or return success for events we don't care about
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 