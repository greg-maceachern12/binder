'use client'

import React, { useState } from 'react';
import { Syllabus, DetailedLesson, Chapter, SyllabusLesson } from '@/app/types';
import SyllabusDisplay from '@/app/components/SyllabusDisplay';
import SyllabusForm from '@/app/components/SyllabusForm';

export default function EnhancedHome() {
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
  const [generatingLessons, setGeneratingLessons] = useState(false);
  const [generatedLessons, setGeneratedLessons] = useState<{ [key: string]: DetailedLesson }>({});
  const [currentGeneratingLesson, setCurrentGeneratingLesson] = useState<string>('');

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
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate lesson');
    }

    return data.lesson;
  };

  const handleGenerateFullCourse = async () => {
    if (!syllabus) return;

    setGeneratingLessons(true);
    const newGeneratedLessons: { [key: string]: DetailedLesson } = { ...generatedLessons };
    const testMode = true;
    
    try {
      const chaptersToProcess = testMode 
        ? syllabus.chapters.slice(0, 1) 
        : syllabus.chapters;

      for (const chapter of chaptersToProcess) {
        const lessonsToProcess = testMode 
          ? chapter.lessons.slice(0, 2) 
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {!syllabus ? (
          <SyllabusForm onSyllabusGenerated={setSyllabus} />
        ) : (
          <SyllabusDisplay
            syllabus={syllabus}
            onGenerateFullCourse={handleGenerateFullCourse}
            generatingLessons={generatingLessons}
            currentGeneratingLesson={currentGeneratingLesson}
            generatedLessons={generatedLessons}
          />
        )}
      </div>
    </main>
  );
}