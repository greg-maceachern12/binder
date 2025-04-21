import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Loader2, BookOpen, Clock, Target, GraduationCap, CheckCircle, ArrowRight, AlertCircle, ChevronLeft, Share2, Lock, FileText, Play, Ruler, Brain } from 'lucide-react';
import { Syllabus, DetailedLesson } from '@/app/types';
import CourseDownloader from './CourseDownloader';
import LessonViewer from './LessonViewer';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

interface Props {
  syllabus: Syllabus;
  onGenerateFullCourse?: () => Promise<void>;
  generatingLessons?: boolean;
  currentGeneratingLesson?: string;
  generatedLessons?: { [key: string]: DetailedLesson };
}

export default function SyllabusDisplay({
  syllabus,
  onGenerateFullCourse,
  generatingLessons = false,
  currentGeneratingLesson = '',
  generatedLessons = {}
}: Props) {
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  
  // Simplify to a direct check - user id matches syllabus user_id
  const isOwner = user?.id === syllabus.user_id;
  
  const allLessonsGenerated = useMemo(() => syllabus.chapters.every(chapter =>
    chapter.lessons.every(lesson => generatedLessons[lesson.id])
  ), [syllabus.chapters, generatedLessons]);

  const isCurrentlyGeneratingLesson = useMemo(() => (chapterTitle: string, lessonTitle: string) => {
    return generatingLessons && currentGeneratingLesson === `${chapterTitle} - ${lessonTitle}`;
  }, [generatingLessons, currentGeneratingLesson]);

  const totalLessons = useMemo(() => syllabus.chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0), [syllabus.chapters]);
  const completedLessons = useMemo(() => Object.keys(generatedLessons).length, [generatedLessons]);
  console.log(syllabus)
  return (
    <div className="max-w-5xl mx-auto px-4 md:px-0">
      {/* Back Button */}
      <button
        onClick={() => router.push('/dashboard')}
        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors mb-4 md:mb-6"
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Back to Dashboard</span>
      </button>

      {/* Course Header Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 md:mb-8">
        {/* Header Image with Content Overlay */}
        <div className="relative">
          {syllabus.image_url ? (
            <div className="relative w-full h-64 md:h-80 lg:h-96">
              <Image
                src={syllabus.image_url}
                alt={syllabus.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent mix-blend-multiply" />
            </div>
          ) : (
            <div className="w-full h-64 md:h-80 lg:h-96 bg-gradient-to-br from-indigo-600 to-purple-700"></div>
          )}

          {/* Redesigned Minimalist Overlay */}
          <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-8">
            {/* Top Row with Glass Effect - Improved Layout */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              {/* Share Button Only */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="p-2 bg-white/10 backdrop-blur-md rounded-md border border-white/20 text-white hover:bg-white/20 transition-all shadow-sm group"
                aria-label={copied ? 'Link Copied' : 'Share course'}
                title={copied ? 'Link Copied' : 'Share course'}
              >
                {copied ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium hidden group-hover:inline">Copied!</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium hidden group-hover:inline">Share</span>
                  </div>
                )}
              </button>
            </div>

            {/* Bottom Content Block with Modern Layout */}
            <div className="space-y-5">
              {/* Title with Gradient Text */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                {syllabus.title}
              </h1>
              
              {/* Description with Frosted Glass */}
              <div className="bg-black/25 backdrop-blur-sm rounded-xl p-4 max-w-3xl">
                <p className="text-base md:text-lg text-white/90 leading-relaxed line-clamp-2 md:line-clamp-3">
                  {syllabus.description}
                </p>
              </div>
              
              {/* Pill Stats with Subtle Separator */}
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-sm text-white" title="Estimated Duration">
                  <Ruler className="w-4 h-4" />
                  <span className="font-medium">{syllabus.course_type === 'fullCourse' ? (
                    <>
                      Full Course
                    </>
                  ) : syllabus.course_type === 'primer' ? (
                    <>
                      Primer
                    </>
                  ) : (
                    syllabus.course_type
                  )}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-sm text-white" title="Estimated Duration">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">{syllabus.estimated_duration}</span>
                </div>
                {/* Lessons */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-sm text-white" title="Total Lessons">
                  <GraduationCap className="w-4 h-4" />
                  <span className="font-medium">{totalLessons} Lessons</span>
                </div>
                {/* Chapters */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-sm text-white" title="Total Chapters">
                  <BookOpen className="w-4 h-4" />
                  <span className="font-medium">{syllabus.chapters.length} Chapters</span>
                </div>
                {/* Difficulty */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-sm text-white" title="Difficulty Level">
                  <Target className="w-4 h-4" />
                  <span className="font-medium">{syllabus.difficulty_level}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-sm text-white" title="Difficulty Level">
                  <Brain className="w-4 h-4" />
                  <span className="font-medium">{syllabus.ai_model}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Course Button - More prominent for owners */}
        {isOwner && onGenerateFullCourse && !allLessonsGenerated && !generatingLessons && (
          <div className="p-4 bg-indigo-50 border-t border-indigo-100">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <h3 className="text-lg font-medium text-indigo-700 mb-1">Course Generation</h3>
                <p className="text-sm text-indigo-600">
                  {completedLessons === 0 
                    ? "Generate detailed lessons for this course" 
                    : `Continue generating lessons (${completedLessons}/${totalLessons} complete)`}
                </p>
              </div>
              <button
                onClick={onGenerateFullCourse}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Play className="w-4 h-4" />
                {completedLessons === 0 ? 'Generate Full Course' : 'Resume Generation'}
              </button>
            </div>
          </div>
        )}

        {/* Progress and Prerequisites */}
        <div className="grid gap-6 md:gap-6 p-6 md:p-8 bg-white">
          {/* Progress Section */}
          <div>
            <h2 className="text-base md:text-lg text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" />
              Course Progress
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 md:p-4">
              <div className="flex justify-between text-xs md:text-sm text-gray-600 mb-2">
                <span>Lessons Generated</span>
                <span className="font-medium">{completedLessons} / {totalLessons}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3 md:mb-4">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-500"
                  style={{ width: `${(completedLessons / totalLessons) * 100}%` }}
                />
              </div>
              
              {!isOwner && !allLessonsGenerated && !generatingLessons && (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 px-6 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm">
                    <Lock className="w-4 h-4" />
                    <span>Only the course owner can generate lessons</span>
                  </div>
                </div>
              )}
              
              {allLessonsGenerated && !generatingLessons && (
                <CourseDownloader
                  syllabus={syllabus}
                  generatedLessons={generatedLessons}
                />
              )}
              
              {generatingLessons && (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-3 text-indigo-600">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm font-medium">
                      Generating {completedLessons}/{totalLessons} • ~{(totalLessons - completedLessons) * 10}s
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    Please don&apos;t close this page
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Prerequisites */}
          {syllabus.prerequisites && syllabus.prerequisites.length > 0 && (
            <div>
              <h2 className="text-base md:text-lg text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" />
                Prerequisites
              </h2>
              <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                <ul className="space-y-3 md:space-y-3">
                  {syllabus.prerequisites.map((prerequisite, index) => (
                    <li key={index} className="flex items-start gap-2 md:gap-3 text-xs md:text-sm">
                      <AlertCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{prerequisite}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Course Content */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 md:p-8">
          <h2 className="text-xl md:text-2xl text-gray-900 mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
            Course Content
          </h2>

          <div className="space-y-6 md:space-y-8">
            {syllabus.chapters.map((chapter, chapterIndex) => (
              <div key={chapterIndex} className="relative pl-6 md:pl-8 border-l-2 border-gray-100">
                {/* Chapter Icon */}
                <div className="absolute left-0 -translate-x-1/2 bg-white p-1.5 md:p-2 rounded-full border-2 border-gray-100">
                  <span className="text-lg md:text-xl">{chapter.emoji}</span>
                </div>

                <div className="mb-3 md:mb-4">
                  <h3 className="text-lg md:text-xl text-gray-900">
                    Chapter {chapterIndex + 1}: {chapter.title}
                  </h3>
                  <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-gray-500 mt-1">
                    <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span>{chapter.estimated_duration || 'To be determined'}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{chapter.description}</p>
                </div>

                {/* Lessons */}
                <div className="space-y-2 md:space-y-3">
                  {chapter.lessons.map((lesson, lessonIndex) => {
                    const isGenerated = !!generatedLessons[lesson.id];
                    const isGenerating = isCurrentlyGeneratingLesson(chapter.title, lesson.title);
                    
                    return (
                      <div
                        key={lessonIndex}
                        className={`flex items-center justify-between p-3 md:p-4 rounded-lg ${
                          isGenerated 
                            ? 'bg-white border border-green-200 hover:border-green-300 shadow-sm' 
                            : 'bg-gray-50 border border-gray-100'
                        } transition-colors`}
                      >
                        <div className="flex items-center gap-2 md:gap-3 min-w-0">
                          {isGenerated ? (
                            <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500 flex-shrink-0" />
                          ) : isGenerating ? (
                            <Loader2 className="w-4 h-4 md:w-5 md:h-5 text-indigo-600 animate-spin flex-shrink-0" />
                          ) : (
                            <div className="w-4 h-4 md:w-5 md:h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                          )}
                          <div>
                            <h4 className="text-sm md:text-base font-medium text-gray-900 truncate">
                              {lesson.title}
                            </h4>
                            {isGenerated && (
                              <p className="text-xs text-green-600 mt-0.5">
                                Lesson generated
                              </p>
                            )}
                            {isGenerating && (
                              <p className="text-xs text-indigo-600 mt-0.5">
                                Generating...
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="ml-2 flex-shrink-0">
                          {isGenerated && (
                            <button
                              onClick={() => setSelectedLessonId(lesson.id)}
                              className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors text-xs md:text-sm font-medium whitespace-nowrap"
                            >
                              View Lesson
                              <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lesson Viewer Modal */}
      {selectedLessonId && generatedLessons[selectedLessonId] && (
        <LessonViewer
          lesson={generatedLessons[selectedLessonId]}
          onClose={() => setSelectedLessonId(null)}
        />
      )}
    </div>
  );
}