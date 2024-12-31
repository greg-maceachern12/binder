import { useState } from 'react';
import { Loader2, BookOpen, Clock, Target, GraduationCap, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';
import { Syllabus, DetailedLesson } from '@/app/types';
import LessonViewer from './LessonViewer';

interface Props {
  syllabus: Syllabus;
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
  
  const allLessonsGenerated = syllabus.chapters.every(chapter =>
    chapter.lessons.every(lesson => generatedLessons[lesson.id])
  );

  const isCurrentlyGeneratingLesson = (chapterTitle: string, lessonTitle: string) => {
    return generatingLessons && currentGeneratingLesson === `${chapterTitle} - ${lessonTitle}`;
  };

  const totalLessons = syllabus.chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0);
  const completedLessons = Object.keys(generatedLessons).length;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Course Header - Key Information */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-8 text-white">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 flex items-center gap-3">
              <BookOpen className="w-8 h-8 sm:w-10 sm:h-10" />
              {syllabus.title}
            </h1>
            <p className="text-lg text-blue-50 mb-6 leading-relaxed">{syllabus.description}</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-white/90">
              <div>
                <div className="text-sm uppercase tracking-wider mb-1">Duration</div>
                <div className="text-2xl font-bold">{syllabus.estimatedDuration}</div>
              </div>
              <div>
                <div className="text-sm uppercase tracking-wider mb-1">Level</div>
                <div className="text-2xl font-bold">{syllabus.difficultyLevel}</div>
              </div>
              <div>
                <div className="text-sm uppercase tracking-wider mb-1">Chapters</div>
                <div className="text-2xl font-bold">{syllabus.chapters.length}</div>
              </div>
              <div>
                <div className="text-sm uppercase tracking-wider mb-1">Lessons</div>
                <div className="text-2xl font-bold">{totalLessons}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Progress and Prerequisites */}
        <div className="grid sm:grid-cols-2 gap-6 p-8 bg-gray-50">
          {/* Progress Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Course Progress
            </h2>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Lessons Generated</span>
                <span className="font-medium">{completedLessons} / {totalLessons}</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${(completedLessons / totalLessons) * 100}%` }}
                />
              </div>
              {!allLessonsGenerated && !generatingLessons && (
                <button
                  onClick={onGenerateFullCourse}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Target className="w-4 h-4" />
                  Generate All Lessons
                </button>
              )}
              {generatingLessons && (
                <div className="flex items-center justify-center gap-3 text-blue-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Generating lessons...</span>
                </div>
              )}
            </div>
          </div>

          {/* Prerequisites Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              Prerequisites
            </h2>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <ul className="space-y-3">
                {syllabus.prerequisites.map((prerequisite, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
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
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>
          
          <div className="space-y-8">
            {syllabus.chapters.map((chapter, chapterIndex) => (
              <div key={chapterIndex} className="relative pl-8 border-l-2 border-gray-100">
                {/* Chapter Header */}
                <div className="absolute left-0 -translate-x-1/2 bg-white p-2 rounded-full border-2 border-gray-100">
                  <span className="text-xl">{chapter.emoji}</span>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Chapter {chapterIndex + 1}: {chapter.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Clock className="w-4 h-4" />
                    <span>{chapter.estimatedDuration}</span>
                  </div>
                  <p className="text-gray-600 mt-2">{chapter.description}</p>
                </div>

                {/* Lessons */}
                <div className="space-y-3">
                  {chapter.lessons.map((lesson, lessonIndex) => (
                    <div 
                      key={lessonIndex}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-100 hover:border-blue-200 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {generatedLessons[lesson.id] ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                        )}
                        <span className="text-gray-900">{lesson.title}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {isCurrentlyGeneratingLesson(chapter.title, lesson.title) && (
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        )}
                        {generatedLessons[lesson.id] && (
                          <button
                            onClick={() => setSelectedLessonId(lesson.id)}
                            className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors text-sm font-medium"
                          >
                            View Lesson
                            <ArrowRight className="w-4 h-4" />
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
      {selectedLessonId && generatedLessons[selectedLessonId] && (
        <LessonViewer
          lesson={generatedLessons[selectedLessonId]}
          onClose={() => setSelectedLessonId(null)}
        />
      )}
    </div>
  );
}