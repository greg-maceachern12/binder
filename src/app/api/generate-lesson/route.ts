import { NextResponse } from "next/server";
import { openai, aiModel } from "@/app/lib/openai";
import { supabase } from '@/app/lib/supabase/client';

export async function POST(request: Request) {
  try {
    const { lessonId, lessonTitle, chapterTitle, courseTitle } = await request.json();

    if (!lessonId || !lessonTitle || !chapterTitle || !courseTitle) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: aiModel,
      messages: [
        {
          role: "system",
          content: `You are an expert educator tasked with creating a detailed, print-friendly lesson on a given topic. Your goal is to produce high-quality, practical content that is directly applicable to learners' needs.
          
Return a JSON object without any markdown formatting. The response should start the {. Follow this exact structure:

{
  "id": "lesson-id",
  "title": "Lesson title",
  "metadata": {
    "duration": "Estimated completion time",
    "difficulty": "Beginner/Intermediate/Advanced",
    "prerequisites": ["Required knowledge"],
    "learningObjectives": ["What students will learn. Clear and concise"]
  },
  "content": {
    "summary": "Brief overview of key concepts, focusing on clarity",
    "sections": [
      {
        "title": "Section heading",
        "content": "Main content text with formatting",
        "keyPoints": ["Important points to remember that many students might forget or overlook"],
        "examples": [
          {
            "scenario": "Example context",
            "explanation": "Detailed walkthrough"
          }
        ]
      }
    ],
    "practicalExercises": [
      {
        "title": "Exercise name",
        "type": "Individual/Group/Discussion",
        "instructions": "Step-by-step guide",
        "tips": ["Helpful suggestions"],
        "solution": "Sample solution or approach"
      }
    ]
  },
  "assessment": {
    "reviewQuestions": [
      {
        "question": "Open-ended question",
        "hints": ["Guiding points"],
        "sampleAnswer": "Model response"
      }
    ],
    "practiceProblems": [
      {
        "problem": "Scenario or question",
        "approach": "How to solve it",
        "solution": "Complete answer"
      }
    ]
  },
  "resources": {
    "required": [{
      "title": "Resource name",
      "type": "Book/Article/Video",
      "description": "Why it's important",
      "url": "Link to resource"
    }],
    "supplementary": [{
      "title": "Additional resource",
      "type": "Resource type",
      "description": "How it helps",
      "url": "Link to resource"
    }]
  },
  "nextSteps": {
    "summary": "Key takeaways",
    "furtherLearning": ["Suggested topics"],
    "applications": ["Real-world uses"]
  }
}`
        },
        {
          role: "user",
          content: `Create print-friendly lesson content focusing on clarity and ease of learning for "${lessonTitle}" from "${chapterTitle}" in "${courseTitle}". ID: ${lessonId}.`
        }
      ],
      temperature: 1,
      max_tokens: 5000
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      return NextResponse.json({ error: "No content received" }, { status: 500 });
    }

    const lesson = JSON.parse(content);

    // Save the generated lesson content to Supabase
    const { error: updateError } = await supabase
      .from('lessons')
      .update({ content: lesson })
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