import { NextResponse } from "next/server";
import { openai, aiModelLesson } from "@/app/lib/openai";
import { supabase } from '@/app/lib/supabase/client';
import { verifySubscription } from '@/app/lib/polar/client';
import { lessonJsonSchema } from '@/app/lib/schemas';

export async function POST(request: Request) {
  try {
    const { lessonId, lessonTitle, chapterTitle, courseTitle, userId } = await request.json();

    if (!lessonId || !lessonTitle || !chapterTitle || !courseTitle) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check subscription status if userId is provided
    if (userId) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('subscription_id, trial_active')
        .eq('id', userId)
        .single();
        
      if (userError) {
        console.error('Error fetching user data:', userError);
        return NextResponse.json(
          { error: 'Failed to verify subscription status' },
          { status: 500 }
        );
      }
      
      // Check if user has an active subscription or trial
      let hasAccess = false;
      
      if (userData.subscription_id) {
        // Verify subscription with API
        hasAccess = await verifySubscription(userData.subscription_id);
      } else if (userData.trial_active) {
        hasAccess = true;
      }
      
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Subscription required to generate lessons' },
          { status: 403 }
        );
      }
    }

    const completion = await openai.chat.completions.create({
      model: aiModelLesson,
      messages: [
        {
          role: "system",
          content: `You are an expert educator tasked with creating a detailed, print-friendly lesson on ${chapterTitle} as part of a ${courseTitle} course. Your goal is to produce high-quality, practical content that is directly applicable to learners' needs.`
        },
        {
          role: "user",
          content: `Create print-friendly lesson content focusing on clarity and ease of learning for "${lessonTitle}" from "${chapterTitle}" in "${courseTitle}". ID: ${lessonId}.`
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: lessonJsonSchema
      },
      temperature: 1,
      max_tokens: 5000
    });

    const content = completion.choices[0].message.content;
    console.log(content)
    if (!content) {
      return NextResponse.json({ error: "No content received" }, { status: 500 });
    }

    const lesson = JSON.parse(content);

    // Save the generated lesson content to Supabase
    const { error: updateError } = await supabase
      .from('lessons')
      .update({ 
        content: lesson, 
        ai_model: aiModelLesson
      })
      .eq('id', lessonId);

    if (updateError) {
      console.error('Error saving lesson:', updateError);
      return NextResponse.json({ error: "Failed to save lesson" }, { status: 500 });
    }

    return NextResponse.json({ lesson });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}