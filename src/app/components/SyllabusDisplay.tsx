// src/components/SyllabusDisplay.tsx
'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
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

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">{syllabus.title}</h2>
        <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">{syllabus.description}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm">
          <div>
            <span className="font-semibold">Estimated Duration:</span> {syllabus.estimatedDuration}
          </div>
          <div>
            <span className="font-semibold">Difficulty Level:</span> {syllabus.difficultyLevel}
          </div>
        </div>
        
        {/* Prerequisites */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2 text-sm sm:text-base">Prerequisites:</h3>
          <ul className="list-disc pl-4 sm:pl-5 text-xs sm:text-sm text-gray-600">
            {syllabus.prerequisites.map((prerequisite, index) => (
              <li key={index}>{prerequisite}</li>
            ))}
          </ul>
        </div>

        {/* Chapters and Lessons */}
        <div className="space-y-4 sm:space-y-6">
          {syllabus.chapters.map((chapter, chapterIndex) => (
            <div key={chapterIndex} className="border-t pt-3 sm:pt-4">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <span className="text-lg sm:text-2xl">{chapter.emoji}</span>
                <h3 className="text-base sm:text-xl font-semibold">{chapter.title}</h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">{chapter.description}</p>
              <p className="text-xs text-gray-500 mb-2">Duration: {chapter.estimatedDuration}</p>
              <ul className="list-disc pl-4 space-y-1 sm:space-y-2">
                {chapter.lessons.map((lesson, lessonIndex) => (
                  <li key={lessonIndex} className="text-xs sm:text-sm text-gray-700 flex items-center justify-between group">
                    <span className="truncate pr-2">{lesson.title}</span>
                    <div className="flex items-center">
                      {isCurrentlyGeneratingLesson(chapter.title, lesson.title) && (
                        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin mr-1 sm:mr-2" />
                      )}
                      {generatedLessons[lesson.id] && (
                        <button
                          onClick={() => setSelectedLessonId(lesson.id)}
                          className="text-xs px-2 py-1 sm:px-3 sm:py-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                        >
                          View
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Generation Controls */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t">
          {generatingLessons ? (
            <div className="text-center">
              <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin mx-auto mb-2" />
              <p className="text-xs sm:text-sm text-gray-600">
                Generating lesson: {currentGeneratingLesson}
              </p>
            </div>
          ) : !allLessonsGenerated ? (
            <div className="text-center">
              <button
                onClick={onGenerateFullCourse}
                className="px-6 py-2 sm:px-8 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm sm:text-base"
              >
                Generate All Lessons
              </button>
            </div>
          ) : (
            <p className="text-center text-green-600 font-medium text-sm sm:text-base">
              All lessons have been generated successfully!
            </p>
          )}
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