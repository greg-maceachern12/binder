import { useState } from 'react';
import { Loader2, BookOpen, Clock, Target, GraduationCap, CheckCircle, ArrowRight, AlertCircle, ChevronLeft, Share2, Sparkles } from 'lucide-react';
import { Syllabus, DetailedLesson } from '@/app/types';
import CourseDownloader from './CourseDownloader';
import LessonViewer from './LessonViewer';
import { useRouter } from 'next/navigation';

interface Props {
  syllabus: Syllabus; // Removed purchased property
  onGenerateFullCourse: () => Promise<void>;
  generatingLessons: boolean;
  currentGeneratingLesson: string;
  generatedLessons: { [key: string]: DetailedLesson };
}

export default function SyllabusDisplay({
  syllabus,
  onGenerateFullCourse,
  generatingLessons,
  currentGeneratingLesson,
  generatedLessons
}: Props) {
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const allLessonsGenerated = syllabus.chapters.every(chapter =>
    chapter.lessons.every(lesson => generatedLessons[lesson.id])
  );

  const isCurrentlyGeneratingLesson = (chapterTitle: string, lessonTitle: string) => {
    return generatingLessons && currentGeneratingLesson === `${chapterTitle} - ${lessonTitle}`;
  };

  const totalLessons = syllabus.chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0);
  const completedLessons = Object.keys(generatedLessons).length;


  return (
    <div className="max-w-5xl mx-auto px-4 md:px-0">
      {/* Back Button */}
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors mb-4 md:mb-6"
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Back to Home</span>
      </button>

      {/* Course Header Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 md:mb-8">
        {/* Main Header Section */}
        <div className={`relative px-6 md:px-8 py-8 md:py-10 ${!syllabus.image_url ? "bg-gradient-to-br from-orange-50 via-rose-50 to-purple-100" : ''}`}>
          {syllabus.image_url && (
            <>
              <img
                src={syllabus.image_url}
                alt={syllabus.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50" />
            </>
          )}
          <div className={`relative ${syllabus.image_url ? 'text-white' : 'text-black'}`}>
            <div className="flex flex-col mb-6 md:mb-8">
              <div className="flex justify-between items-start">
                <h1 className="text-2xl md:text-4xl mb-2 md:mb-3">
                  {syllabus.title}
                </h1>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-all text-sm border border-white/30"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
              <p className="text-sm leading-relaxed">
                {syllabus.description}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 md:gap-4">
              {[
                { label: 'Duration', value: syllabus.estimatedDuration, icon: Clock },
                { label: 'Level', value: syllabus.difficultyLevel, icon: Target },
                { label: 'Chapters', value: syllabus.chapters.length, icon: BookOpen },
                { label: 'Lessons', value: totalLessons, icon: GraduationCap }
              ].map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-lg px-4 md:px-4 py-3 md:py-3 border border-white/30"
                >
                  <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                    <stat.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="text-xs md:text-sm font-medium">
                      {stat.label}
                    </span>
                  </div>
                  <div className="text-base md:text-xl font-bold">
                    {typeof stat.value === 'number' ? stat.value.toString() : stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

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
              {!allLessonsGenerated && !generatingLessons && (
                <div className="space-y-3">
                  <button
                    onClick={onGenerateFullCourse}
                    className="w-full px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate Course
                  </button>
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
        </div>
      </div>

      {/* Course Content */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 md:p-8">
          <h2 className="text-xl md:text-2xl text-gray-900 mb-6">Course Content</h2>

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
                    <span>{chapter.estimatedDuration}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{chapter.description}</p>
                </div>

                {/* Lessons */}
                <div className="space-y-2 md:space-y-3">
                  {chapter.lessons.map((lesson, lessonIndex) => (
                    <div
                      key={lessonIndex}
                      className="flex items-center justify-between p-3 md:p-4 rounded-lg bg-gray-50 border border-gray-100 hover:border-indigo-200 transition-colors"
                    >
                      <div className="flex items-center gap-2 md:gap-3 min-w-0">
                        {generatedLessons[lesson.id] ? (
                          <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <div className="w-4 h-4 md:w-5 md:h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                        )}
                        <span className="text-sm md:text-base text-gray-900 truncate">{lesson.title}</span>
                      </div>

                      <div className="flex items-center gap-2 md:gap-3 ml-2 flex-shrink-0">
                        {isCurrentlyGeneratingLesson(chapter.title, lesson.title) && (
                          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                        )}
                        {generatedLessons[lesson.id] && (
                          <button
                            onClick={() => setSelectedLessonId(lesson.id)}
                            className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors text-xs md:text-sm font-medium whitespace-nowrap"
                          >
                            View
                            <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lesson Viewer Modal */}
      {
        selectedLessonId && generatedLessons[selectedLessonId] && (
          <LessonViewer
            lesson={generatedLessons[selectedLessonId]}
            onClose={() => setSelectedLessonId(null)}
          />
        )
      }
    </div>
  );
}