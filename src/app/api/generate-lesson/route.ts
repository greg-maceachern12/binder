import { NextResponse } from "next/server";
import { openai, aiModelLesson } from "@/app/lib/openai";
import { authenticateRequest } from '@/app/lib/supabase/admin';
// PAYMENT FUNCTIONALITY DISABLED - Uncomment to restore
// import { verifySubscription } from '@/app/lib/polar/client';
import { lessonJsonSchema } from '@/app/lib/schemas';

type OwnerRecord = { user_id: string | null };
type ChapterRecord = { syllabi: OwnerRecord | OwnerRecord[] | null };
type LessonOwnerRow = {
  id: string;
  content: unknown;
  chapters: ChapterRecord | ChapterRecord[] | null;
};

function first<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.message }, { status: auth.status });
    }
    const { user, admin } = auth;

    const { lessonId, lessonTitle, chapterTitle, courseTitle } = await request.json();

    if (!lessonId || !lessonTitle || !chapterTitle || !courseTitle) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data: lessonRow, error: lessonLookupError } = await admin
      .from('lessons')
      .select('id, content, chapters!lessons_chapter_id_fkey!inner(syllabi!chapters_syllabus_id_fkey!inner(user_id))')
      .eq('id', lessonId)
      .maybeSingle();

    if (lessonLookupError) {
      console.error('Error loading lesson:', lessonLookupError);
      return NextResponse.json({ error: "Failed to load lesson" }, { status: 500 });
    }

    if (!lessonRow) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const lessonOwner = lessonRow as LessonOwnerRow;
    const syllabus = first(first(lessonOwner.chapters)?.syllabi);
    if (!syllabus?.user_id || syllabus.user_id !== user.id) {
      return NextResponse.json(
        { error: "You can only generate lessons for your own courses" },
        { status: 403 }
      );
    }

    if (lessonOwner.content != null) {
      return NextResponse.json(
        { error: "This lesson already has content" },
        { status: 409 }
      );
    }

    // ==========================================
    // PAYMENT FUNCTIONALITY DISABLED - FREE SITE
    // Uncomment this block to restore subscription verification
    // ==========================================
    /*
    // Check subscription status for the signed-in user
    if (user.id) {
      const { data: userData, error: userError } = await admin
        .from('users')
        .select('subscription_id, trial_active')
        .eq('id', user.id)
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
    */

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

    // Save only while the lesson is still empty, so a second request cannot overwrite it.
    const { data: updatedRows, error: updateError } = await admin
      .from('lessons')
      .update({
        content: lesson,
        ai_model: aiModelLesson
      })
      .eq('id', lessonId)
      .is('content', null)
      .select('id');

    if (updateError) {
      console.error('Error saving lesson:', updateError);
      return NextResponse.json({ error: "Failed to save lesson" }, { status: 500 });
    }

    if (!updatedRows?.length) {
      return NextResponse.json(
        { error: "This lesson already has content" },
        { status: 409 }
      );
    }

    return NextResponse.json({ lesson });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}