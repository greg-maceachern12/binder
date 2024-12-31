// app/syllabus/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react';
import { Syllabus, DetailedLesson, Chapter, SyllabusLesson } from '@/types';
import SyllabusDisplay from '@/app/components/SyllabusDisplay';

// Test mode configuration
const TEST_MODE = true;
const TEST_CHAPTER_LIMIT = 1;
const TEST_LESSON_LIMIT = 1;

export default function SyllabusPage({
  params: { id }
}: {
  params: { id: string }
}) {
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
  const [generatingLessons, setGeneratingLessons] = useState(false);
  const [generatedLessons, setGeneratedLessons] = useState<{ [key: string]: DetailedLesson }>({});
  const [currentGeneratingLesson, setCurrentGeneratingLesson] = useState<string>('');

  useEffect(() => {
    const fetchSyllabus = async () => {
      try {
        const response = await fetch(`/api/syllabus/${id}`);
        if (!response.ok) throw new Error('Failed to fetch syllabus');
        const data = await response.json();
        setSyllabus(data.syllabus);
      } catch (error) {
        console.error('Error fetching syllabus:', error);
      }
    };

    fetchSyllabus();
  }, [id]);

  const generateLesson = async (chapter: Chapter, lesson: SyllabusLesson) => {
    const response = await fetch('/api/generate-lesson', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        chapterTitle: chapter.title,
        courseTitle: syllabus?.title
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to generate lesson');
    return data.lesson as DetailedLesson;
  };

  const handleGenerateFullCourse = async () => {
    if (!syllabus) return;

    setGeneratingLessons(true);
    const newGeneratedLessons: { [key: string]: DetailedLesson } = { ...generatedLessons };
    
    try {
      const chaptersToProcess = TEST_MODE 
        ? syllabus.chapters.slice(0, TEST_CHAPTER_LIMIT)
        : syllabus.chapters;

      for (const chapter of chaptersToProcess) {
        const lessonsToProcess = TEST_MODE
          ? chapter.lessons.slice(0, TEST_LESSON_LIMIT)
          : chapter.lessons;
        
        for (const lesson of lessonsToProcess) {
          setCurrentGeneratingLesson(`${chapter.title} - ${lesson.title}`);
          const response = await generateLesson(chapter, lesson);
          newGeneratedLessons[lesson.id] = response;
          setGeneratedLessons({ ...newGeneratedLessons });
        }
      }
    } catch (error) {
      console.error('Failed to generate lessons:', error);
    }

    setGeneratingLessons(false);
    setCurrentGeneratingLesson('');
  };

  if (!syllabus) return <div className="p-8">Loading...</div>;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <SyllabusDisplay
          syllabus={syllabus}
          onGenerateFullCourse={handleGenerateFullCourse}
          generatingLessons={generatingLessons}
          currentGeneratingLesson={currentGeneratingLesson}
          generatedLessons={generatedLessons}
        />
      </div>
    </main>
  );
}