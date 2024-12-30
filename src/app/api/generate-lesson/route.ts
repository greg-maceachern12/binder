// src/app/api/generate-lesson/route.ts
import { NextResponse } from "next/server";
import { openai } from "@/app/lib/openai";

export async function POST(request: Request) {
  try {
    const { lessonId, lessonTitle, chapterTitle, courseTitle } =
      await request.json();

    if (!lessonId || !lessonTitle || !chapterTitle || !courseTitle) {
      return NextResponse.json(
        {
          error:
            "Lesson ID, lesson title, chapter title, and course title are required",
        },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert educator. Create detailed content for a single lesson.
          
Return a JSON object without any markdown formatting, following this structure:

{
  "id": "lesson-id",
  "title": "Lesson title",
  "duration": "Estimated time to complete",
  "content": {
    "introduction": "Engaging introduction to the topic",
    "mainPoints": [
      {
        "title": "Main point title",
        "content": "Detailed explanation",
        "examples": ["Example 1", "Example 2"]
      }
    ],
    "exercises": [
      {
        "title": "Exercise title",
        "description": "Exercise instructions",
        "difficulty": "Basic/Intermediate/Advanced",
        "estimatedTime": "Time to complete",
        "sampleSolution": "Example solution or approach"
      }
    ]
  },
  "resources": [
    {
      "title": "Resource title",
      "type": "Book/Video/Article/Tool",
      "url": "Optional URL",
      "description": "Why this resource is valuable"
    }
  ],
  "practicalApplications": [
    {
      "scenario": "Real-world scenario",
      "application": "How to apply the learned concepts"
    }
  ],
  "quiz": {
    "questions": [
      {
        "question": "Quiz question",
        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
        "correctAnswer": "Correct option",
        "explanation": "Why this is the correct answer"
      }
    ]
  },
  "nextSteps": "Suggestions for what to learn next"
}`,
        },
        {
          role: "user",
          content: `Create detailed lesson content for the lesson "${lessonTitle}" from the chapter "${chapterTitle}" in the course "${courseTitle}". The lesson ID is ${lessonId}.`,
        },
      ],
      temperature: 1,
      max_tokens: 5000,
    });

    const content = completion.choices[0].message.content;
    try {
      if (content === null) {
        return NextResponse.json(
          { error: "No content received from OpenAI" },
          { status: 500 }
        );
      }

      const lesson = JSON.parse(content);
      return NextResponse.json({ lesson });
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      return NextResponse.json(
        { error: "Failed to parse lesson JSON" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error generating lesson:", error);
    return NextResponse.json(
      { error: "Failed to generate lesson" },
      { status: 500 }
    );
  }
}
