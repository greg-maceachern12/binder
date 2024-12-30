'use client';

import { useState, useRef } from 'react';
import { Loader2, SparklesIcon } from 'lucide-react';
import { Syllabus, DetailedLesson, Chapter, SyllabusLesson } from '@/app/types';
import SyllabusDisplay from '@/app/components/SyllabusDisplay';

// Predefined topic suggestions
const TOPIC_SUGGESTIONS = [
  'Wealth Management',
  'Machine Learning Fundamentals',
  'Digital Marketing Strategies',
  'Blockchain Technology',
  'Modern Web Development',
  'Data Science Essentials',
  'Sustainable Business Practices',
  'Artificial Intelligence Ethics',
  'Personal Finance Planning',
  'Cloud Computing Architecture',
  'Cybersecurity Fundamentals',
  'UX/UI Design Principles',
  'Entrepreneurship Masterclass',
  'Advanced Python Programming',
  'Mental Health and Wellness'
];

export default function Home() {
  const [topic, setTopic] = useState('');
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatingLessons, setGeneratingLessons] = useState(false);
  const [generatedLessons, setGeneratedLessons] = useState<{ [key: string]: DetailedLesson }>({});
  const [currentGeneratingLesson, setCurrentGeneratingLesson] = useState<string>('');
  const topicInputRef = useRef<HTMLInputElement>(null);

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

  const handleTopicSuggestionClick = (suggestedTopic: string) => {
    setTopic(suggestedTopic);
    topicInputRef.current?.focus();
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
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6">
      <div className="w-full max-w-5xl mx-auto">
        {!syllabus && (
          <div className="bg-white shadow-xl rounded-xl p-6 sm:p-8 md:p-12 border border-gray-100">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-center text-gray-800 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
              <SparklesIcon className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500 mb-2 sm:mb-0" />
              What do you want to learn today?
            </h1>
            
            <div className="mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
                <input
                  ref={topicInputRef}
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter a topic (e.g., Wealth Management)"
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  disabled={isLoading}
                />
                <button
                  onClick={handleGenerateSyllabus}
                  disabled={!topic || isLoading}
                  className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> : 'Generate'}
                </button>
              </div>
              {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
            </div>

            {/* Topic Suggestions */}
            <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
              <h3 className="text-base sm:text-lg font-semibold mb-3 text-gray-700">Popular Topics</h3>
              <div className="flex flex-wrap gap-2">
                {TOPIC_SUGGESTIONS.map((suggestedTopic) => (
                  <button
                    key={suggestedTopic}
                    onClick={() => handleTopicSuggestionClick(suggestedTopic)}
                    className="px-2 py-1 sm:px-3 sm:py-1 bg-white text-gray-700 rounded-full border border-gray-200 hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 text-xs sm:text-sm"
                  >
                    {suggestedTopic}
                  </button>
                ))}
              </div>
            </div>
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
      </div>
    </main>
  );
}