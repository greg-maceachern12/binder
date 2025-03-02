import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase/client";

export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json();
    
    // Verify the webhook signature if needed
    // This would involve checking headers and validating the request
    
    // Check if this is a successful order event
    if (body.meta.event_name === 'order_created') {
      // Extract the syllabus_id from custom data
      const syllabusId = body.data.attributes.custom_data?.syllabus_id;
      
      if (syllabusId) {
        // Update the purchased status in Supabase
        const { error } = await supabase
          .from('syllabi')
          .update({ purchased: true })
          .eq('id', syllabusId);
          
        if (error) {
          console.error('Error updating purchase status:', error);
          return NextResponse.json({ error: "Failed to update purchase status" }, { status: 500 });
        }
        
        return NextResponse.json({ success: true });
      }
    }
    
    // For other events or if no syllabus_id, just acknowledge receipt
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
  }
} 