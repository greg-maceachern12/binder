// src/app/api/generate-syllabus/route.ts
import { NextResponse } from 'next/server';
import { openai, aiModel } from '@/app/lib/openai';

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
          
Return a JSON object without any markdown formatting, with as many chapters and lessons that you deem necessary for the cirriculum, following this structure:

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
          content: `Create a course outline for: ${topic}. Include sufficient chapters to cover the topic thoroughly, with 3-5 lessons per chapter.`
        }
      ],
      temperature: 1,
      max_tokens: 2000
    });

    const content = completion.choices[0].message.content;
    try {

      if (content === null) {
        return NextResponse.json(
          { error: 'No content received from OpenAI' },
          { status: 500 }
        );
      }
    

      const syllabus = JSON.parse(content);
      return NextResponse.json({ syllabus });
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse syllabus JSON' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error generating syllabus:', error);
    return NextResponse.json(
      { error: 'Failed to generate syllabus' },
      { status: 500 }
    );
  }
}