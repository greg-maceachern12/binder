// src/app/page.tsx
'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Syllabus, DetailedLesson, Chapter, SyllabusLesson } from '@/app/types';
import SyllabusDisplay from '@/app/components/SyllabusDisplay';

export default function Home() {
  const [topic, setTopic] = useState('');
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatingLessons, setGeneratingLessons] = useState(false);
  const [generatedLessons, setGeneratedLessons] = useState<{ [key: string]: DetailedLesson }>({});
  const [currentGeneratingLesson, setCurrentGeneratingLesson] = useState<string>('');

  const handleGenerateSyllabus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/generate-syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate syllabus');
      }
      console.log(data.syllabus);
      setSyllabus(data.syllabus);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

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

    // Test mode configuration
    const TEST_MODE = true
    const MAX_CHAPTERS = TEST_MODE ? 1 : syllabus.chapters.length;
    const MAX_LESSONS = TEST_MODE ? 3 : undefined;

    try {
      const chaptersToProcess = syllabus.chapters.slice(0, MAX_CHAPTERS);

      for (const chapter of chaptersToProcess) {
        const lessonsToProcess = MAX_LESSONS 
          ? chapter.lessons.slice(0, MAX_LESSONS)
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
      setError('Failed to generate some lessons');
    }

    setGeneratingLessons(false);
    setCurrentGeneratingLesson('');
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      {!syllabus && (
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-8 text-gray-800">
            What do you want to learn today?
          </h1>
          <div className="flex gap-4 justify-center">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic (e.g., Wealth Management)"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={handleGenerateSyllabus}
              disabled={!topic || isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate'}
            </button>
          </div>
          {error && <p className="mt-4 text-red-600">{error}</p>}
        </div>
      )}

      {syllabus && (
        <SyllabusDisplay
          syllabus={syllabus}
          onGenerateFullCourse={handleGenerateFullCourse}
          generatingLessons={generatingLessons}
          currentGeneratingLesson={currentGeneratingLesson}
          generatedLessons={generatedLessons}
        />
      )}
    </main>
  );
}