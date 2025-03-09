import { useState, useMemo, lazy, Suspense } from 'react';
import { Loader2, BookOpen, Clock, Target, GraduationCap, CheckCircle, ArrowRight, AlertCircle, ChevronLeft, Share2, Sparkles, Lock } from 'lucide-react';
import { Syllabus } from '../types';
import Image from 'next/image';
import CourseDownloader from './CourseDownloader';
// Lazy load the LessonViewer component
const LessonViewer = lazy(() => import('./LessonViewer'));
import { useRouter } from 'next/navigation';

type Props = {
  syllabus: Syllabus;
};

export default function SyllabusDisplay({ syllabus }: Props) {
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  // Memoize computationally expensive operations
  const allLessonsGenerated = useMemo(() => syllabus.chapters.every(chapter =>
    chapter.lessons.every(lesson => lesson.isGenerated)
  ), [syllabus.chapters]);

  const isCurrentlyGeneratingLesson = useMemo(() => (chapterTitle: string, lessonTitle: string) => {
    return false; // Assuming no generation is happening
  }, []);

  const totalLessons = useMemo(() => syllabus.chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0), [syllabus.chapters]);
  const completedLessons = useMemo(() => Object.keys(lesson.isGenerated).length, [lesson.isGenerated]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{syllabus.title}</h1>
          <p className="text-gray-600">{syllabus.description}</p>
          
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">Difficulty:</span>
              <span className="text-sm text-gray-900">{syllabus.difficulty_level}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">Duration:</span>
              <span className="text-sm text-gray-900">{syllabus.estimated_duration}</span>
            </div>
          </div>
        </div>

        {/* Chapters */}
        <div className="divide-y divide-gray-100">
          {syllabus.chapters.map((chapter, index) => (
            <div key={index} className="p-6 md:p-8">
              <div className="flex items-start gap-4">
                {chapter.emoji && (
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-xl">{chapter.emoji}</span>
                  </div>
                )}
                <div className="flex-grow">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {chapter.title}
                  </h2>
                  {chapter.description && (
                    <p className="text-gray-600 mb-4">{chapter.description}</p>
                  )}
                  
                  {/* Lessons */}
                  <div className="space-y-3">
                    {chapter.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lessonIndex}
                        className={`p-4 rounded-lg border ${
                          lesson.isLocked
                            ? 'bg-gray-50 border-gray-200'
                            : 'bg-white border-gray-200 hover:border-purple-200 hover:bg-purple-50'
                        } transition-colors`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {lesson.title}
                            </h3>
                            {lesson.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {lesson.description}
                              </p>
                            )}
                          </div>
                          {lesson.isLocked && (
                            <span className="text-sm text-gray-500">
                              Sign in to unlock
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}