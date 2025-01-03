import { NextResponse } from 'next/server';
import { openai, aiModel } from '@/app/lib/openai';
import { supabase } from '@/app/lib/supabase/client';
import { SyllabusLesson } from '@/app/types';

export async function POST(request: Request) {
  try {
    const { topic } = await request.json();
    
    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: aiModel,
      messages: [
        {
          role: "system",
          content: `You are an expert curriculum designer tasked with creating a high-quality, practical course outline. Your goal is to provide a clear overview of the learning path that is both comprehensive and focused on real-world applications.
          
Return a JSON object without any markdown formatting, following this structure:

{
  "title": "{ {Relevent Emoji} Course title",
  "description": "Brief course overview",
  "difficultyLevel": "Beginner/Intermediate/Advanced",
  "estimatedDuration": "Total course duration",
  "prerequisites": ["prerequisite 1", "prerequisite 2"],
  "chapters": [
    {
      "emoji": "📚",
      "title": "Chapter title",
      "description": "Brief chapter description",
      "estimatedDuration": "2 hours",
      "lessons": [
        {
          "id": "unique-lesson-id",
          "title": "Lesson title",
          "description": "Brief lesson overview"
        }
      ]
    }
  ]
}`
        },
        {
          role: "user",
          content: `Create a course outline for: ${topic}. Include sufficient chapters (between 1-5 depending on complexity) with 3-5 lessons per chapter.`
        }
      ],
      temperature: 1,
      max_tokens: 2000
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      return NextResponse.json(
        { error: 'No content received from OpenAI' },
        { status: 500 }
      );
    }

    const syllabus = JSON.parse(content);

    // Save syllabus to Supabase
    const { data: syllabusData, error: syllabusError } = await supabase
      .from('syllabi')
      .insert({
        title: syllabus.title,
        description: syllabus.description,
        difficulty_level: syllabus.difficultyLevel,
        estimated_duration: syllabus.estimatedDuration,
        prerequisites: syllabus.prerequisites
      })
      .select()
      .single();

    if (syllabusError) throw syllabusError;

    // Save chapters
    for (let i = 0; i < syllabus.chapters.length; i++) {
      const chapter = syllabus.chapters[i];
      
      const { data: chapterData, error: chapterError } = await supabase
        .from('chapters')
        .insert({
          syllabus_id: syllabusData.id,
          title: chapter.title,
          description: chapter.description,
          estimated_duration: chapter.estimatedDuration,
          emoji: chapter.emoji,
          order_index: i
        })
        .select()
        .single();

      if (chapterError) throw chapterError;

      // Save lessons
      const lessonInserts = chapter.lessons.map((lesson: SyllabusLesson, lessonIndex: number) => ({
        chapter_id: chapterData.id,
        title: lesson.title,
        order_index: lessonIndex
      }));

      const { error: lessonsError } = await supabase
        .from('lessons')
        .insert(lessonInserts);

      if (lessonsError) throw lessonsError;
    }

    // Return the syllabus ID as the slug
    return NextResponse.json({ 
      success: true,
      slug: syllabusData.id
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate syllabus' },
      { status: 500 }
    );
  }
}