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
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-3xl font-bold mb-4">{syllabus.title}</h2>
        <p className="text-gray-600 mb-4">{syllabus.description}</p>
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <span className="font-semibold">Estimated Duration:</span> {syllabus.estimatedDuration}
          </div>
          <div>
            <span className="font-semibold">Difficulty Level:</span> {syllabus.difficultyLevel}
          </div>
        </div>
        
        {/* Prerequisites */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Prerequisites:</h3>
          <ul className="list-disc pl-5 text-gray-600">
            {syllabus.prerequisites.map((prerequisite, index) => (
              <li key={index}>{prerequisite}</li>
            ))}
          </ul>
        </div>

        {/* Chapters and Lessons */}
        <div className="space-y-6">
          {syllabus.chapters.map((chapter, chapterIndex) => (
            <div key={chapterIndex} className="border-t pt-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{chapter.emoji}</span>
                <h3 className="text-xl font-semibold">{chapter.title}</h3>
              </div>
              <p className="text-gray-600 mb-2">{chapter.description}</p>
              <p className="text-sm text-gray-500 mb-3">Duration: {chapter.estimatedDuration}</p>
              <ul className="list-disc pl-5 space-y-2">
                {chapter.lessons.map((lesson, lessonIndex) => (
                  <li key={lessonIndex} className="text-gray-700 flex items-center justify-between group">
                    <span>{lesson.title}</span>
                    <div className="flex items-center">
                      {isCurrentlyGeneratingLesson(chapter.title, lesson.title) && (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      )}
                      {generatedLessons[lesson.id] && (
                        <button
                          onClick={() => setSelectedLessonId(lesson.id)}
                          className="text-sm px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                        >
                          View Lesson
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
        <div className="mt-8 pt-6 border-t">
          {generatingLessons ? (
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p className="text-gray-600">
                Generating lesson: {currentGeneratingLesson}
              </p>
            </div>
          ) : !allLessonsGenerated ? (
            <div className="text-center">
              <button
                onClick={onGenerateFullCourse}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                Generate All Lessons
              </button>
            </div>
          ) : (
            <p className="text-center text-green-600 font-medium">
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