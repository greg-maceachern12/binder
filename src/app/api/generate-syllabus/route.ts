import { NextResponse } from "next/server";
import { openai, aiModelSyllabus } from "@/app/lib/openai";
import { authenticateRequest } from "@/app/lib/supabase/admin";
import { SyllabusLesson } from "@/app/types";
import { COURSE_TEMPLATES } from "@/app/lib/templates";
import { syllabusJsonSchema } from '@/app/lib/schemas';

async function getUnsplashImage(query: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(
        query
      )}&orientation=landscape&content_filter=high`,
      {
        headers: {
          Authorization: `Client-ID ${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`,
        },
      }
    );
    const photo = await response.json();
    return photo?.urls?.regular || null;
  } catch (error) {
    console.error("Error fetching Unsplash image:", error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.message }, { status: auth.status });
    }
    const { user, admin } = auth;

    const {
      topic,
      courseType = "primer",
    }: { topic: string; courseType: keyof typeof COURSE_TEMPLATES } =
      await request.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    // Extract the core instructions from the template
    const templateContent = COURSE_TEMPLATES[courseType];
    // Get just the instructions portion (before the JSON structure part)
    const instructionsPart = templateContent.split("Return a JSON object")[0].trim();

    const completion = await openai.chat.completions.create({
      model: aiModelSyllabus,
      messages: [
        {
          role: "system",
          content: instructionsPart,
        },
        {
          role: "user",
          content: `Create a ${courseType === "primer"
              ? "focused quick-start guide"
              : "comprehensive course outline"
            } for: ${topic}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: syllabusJsonSchema
      },
      temperature: 1,
      max_tokens: courseType === "primer" ? 1500 : 3500,
    });

    const content = completion.choices[0].message.content;

    if (!content) {
      return NextResponse.json(
        { error: "No content received from OpenAI" },
        { status: 500 }
      );
    }
    console.log(content);

    const syllabus = JSON.parse(content);
    const imageUrl = await getUnsplashImage(`${syllabus.title} background`);

    // Before the supabase insert, get location data
    const response = await fetch("https://ipapi.co/json/");
    const locationData = await response.json();
    const userLoc = locationData.city + "," + locationData.country_code;
    console.log(courseType)

    // Then use it in your existing supabase insert
    const { data: syllabusData, error: syllabusError } = await admin
      .from("syllabi")
      .insert({
        title: syllabus.title,
        description: syllabus.description,
        difficulty_level: syllabus.difficultyLevel,
        estimated_duration: syllabus.estimatedDuration,
        prerequisites: syllabus.prerequisites,
        image_url: imageUrl,
        location: userLoc, // Using the IP column to store city instead
        isp: locationData.org || null,
        user_id: user.id,
        course_type: courseType,
        ai_model: aiModelSyllabus
      })
      .select()
      .single();

    if (syllabusError) throw syllabusError;

    // Save chapters
    for (let i = 0; i < syllabus.chapters.length; i++) {
      const chapter = syllabus.chapters[i];

      const { data: chapterData, error: chapterError } = await admin
        .from("chapters")
        .insert({
          syllabus_id: syllabusData.id,
          title: chapter.title,
          description: chapter.description,
          estimated_duration: chapter.estimatedDuration,
          emoji: chapter.emoji,
          order_index: i,
        })
        .select()
        .single();

      if (chapterError) throw chapterError;

      // Save lessons
      const lessonInserts = chapter.lessons.map(
        (lesson: SyllabusLesson, lessonIndex: number) => ({
          chapter_id: chapterData.id,
          title: lesson.title,
          order_index: lessonIndex,
        })
      );

      const { error: lessonsError } = await admin
        .from("lessons")
        .insert(lessonInserts);

      if (lessonsError) throw lessonsError;
    }

    // Return the syllabus ID as the slug
    return NextResponse.json({
      success: true,
      slug: syllabusData.id,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to generate syllabus" },
      { status: 500 }
    );
  }
}
