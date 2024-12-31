import React, { useState } from 'react';
import { Book, Clock, Target, X, Menu } from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import { DetailedLesson } from '@/app/types';

interface LessonViewerProps {
  lesson: DetailedLesson;
  onClose: () => void;
}

const formatLessonContent = (lesson: DetailedLesson) => {
  let content = `${lesson.title}. `;
  content += "In this lesson, we'll cover the following objectives: ";
  lesson.metadata.learningObjectives.forEach((obj, i) => {
    if (i > 0) content += "; ";
    content += obj;
  });
  if (lesson.content.summary) {
    content += ` ${lesson.content.summary} `;
  }
  lesson.content.sections.forEach(section => {
    content += ` ${section.title}. ${section.content} `;
    if (section.keyPoints.length > 0) {
      content += "Key points to remember: ";
      section.keyPoints.forEach((point, i) => {
        if (i > 0) content += "; ";
        content += point;
      });
    }
  });
  return content;
};

export default function LessonViewer({ lesson, onClose }: LessonViewerProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="w-full h-full md:h-[96vh] max-w-6xl bg-white md:rounded-2xl shadow-2xl flex">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 md:hidden z-30"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Hidden on mobile by default */}
        <div className={`fixed md:relative w-72 h-full bg-gray-50 border-r z-40 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0`}>
          {/* Sidebar Header */}
          <div className="sticky top-0 bg-gray-50 border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-700">Contents</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1 text-gray-400 hover:text-gray-600 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="px-3 py-4">
            {lesson.content.sections.map((section, i) => (
              <a
                key={i}
                href={`#section-${i}`}
                onClick={() => setIsSidebarOpen(false)}
                className="block py-2 px-3 mb-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
              >
                {section.title}
              </a>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-white">
          {/* Header */}
          <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b">
            {/* Close button container */}
            <div className="absolute right-4 md:right-6 top-4">
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Menu and Audio player container */}
            <div className="px-4 md:px-6 py-4 flex items-center gap-2">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>
              <AudioPlayer
                lessonTitle={lesson.title}
                lessonContent={formatLessonContent(lesson)}
              />
            </div>
          </div>

          {/* Content */}
          <div className="max-w-4xl mx-auto p-4 md:p-8 pb-16">
            {/* Title Section */}
            <div className="mb-8 md:mb-12">
              <h1 className="text-2xl md:text-4xl text-gray-900 mb-4">{lesson.title}</h1>
              <div className="flex flex-wrap gap-2 md:gap-4 text-sm md:text-base text-gray-600">
                <span className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-gray-100 rounded-full">
                  <Clock className="w-4 h-4" />
                  {lesson.metadata.duration}
                </span>
                <span className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-gray-100 rounded-full">
                  <Target className="w-4 h-4" />
                  {lesson.metadata.difficulty}
                </span>
              </div>
            </div>

            {/* Learning Objectives */}
            <div className="mb-8 md:mb-12">
              <h2 className="text-xl md:text-2xl text-gray-900 mb-4 md:mb-6">Learning Objectives</h2>
              <div className="bg-blue-50 rounded-xl md:rounded-2xl p-4 md:p-6">
                <ul className="space-y-3 md:space-y-4">
                  {lesson.metadata.learningObjectives.map((objective, i) => (
                    <li key={i} className="flex items-start gap-3 md:gap-4">
                      <div className="w-5 h-5 md:w-6 md:h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <span className="text-sm md:text-base text-blue-900">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Main Content Sections */}
            {lesson.content.sections.map((section, i) => (
              <div key={i} id={`section-${i}`} className="mb-8 md:mb-12">
                <h2 className="text-xl md:text-2xl text-gray-900 mb-4 md:mb-6">{section.title}</h2>
                <div className="prose prose-sm md:prose-lg max-w-none">
                  <p className="text-gray-600 leading-relaxed mb-4 md:mb-6">{section.content}</p>

                  {/* Key Points */}
                  {section.keyPoints.length > 0 && (
                    <div className="bg-amber-50 rounded-xl md:rounded-2xl p-4 md:p-6 my-4 md:my-6">
                      <h3 className="text-lg md:text-xl text-amber-900 mb-3 md:mb-4">Key Points</h3>
                      <ul className="space-y-2 md:space-y-3">
                        {section.keyPoints.map((point, j) => (
                          <li key={j} className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2.5" />
                            <span className="text-sm md:text-base text-amber-900">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Examples */}
                  {section.examples.length > 0 && (
                    <div className="space-y-3 md:space-y-4 my-4 md:my-6">
                      {section.examples.map((example, j) => (
                        <div key={j} className="bg-gray-50 rounded-xl md:rounded-2xl p-4 md:p-6">
                          <h4 className="text-base md:text-lg text-gray-900 mb-2 md:mb-3">{example.scenario}</h4>
                          <p className="text-sm md:text-base text-gray-600">{example.explanation}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Practical Exercises */}
            {lesson.content.practicalExercises.length > 0 && (
              <div className="mb-8 md:mb-12">
                <h2 className="text-xl md:text-2xl text-gray-900 mb-4 md:mb-6">Practice Exercises</h2>
                <div className="space-y-4 md:space-y-6">
                  {lesson.content.practicalExercises.map((exercise, i) => (
                    <div key={i} className="border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6">
                      <h3 className="text-lg md:text-xl text-gray-900 mb-3 md:mb-4">{exercise.title}</h3>
                      <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">{exercise.instructions}</p>

                      {exercise.tips.length > 0 && (
                        <div className="mb-4 md:mb-6">
                          <h4 className="font-medium text-base md:text-lg mb-2">Tips:</h4>
                          <ul className="list-disc pl-4 md:pl-5 space-y-1 md:space-y-2">
                            {exercise.tips.map((tip, j) => (
                              <li key={j} className="text-sm md:text-base text-gray-600">{tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div>
                        <h4 className="font-medium text-base md:text-lg mb-2">Solution:</h4>
                        <div className="bg-blue-50 rounded-lg md:rounded-xl p-4 md:p-6">
                          <p className="text-sm md:text-base text-gray-600">{exercise.solution}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assessment Section */}
            {(lesson.assessment.reviewQuestions.length > 0 || lesson.assessment.practiceProblems.length > 0) && (
              <div className="mb-8 md:mb-12">
                <h2 className="text-xl md:text-2xl text-gray-900 mb-4 md:mb-6">Assessment</h2>

                {/* Review Questions */}
                {lesson.assessment.reviewQuestions.length > 0 && (
                  <div className="mb-6 md:mb-8">
                    <h3 className="text-lg md:text-xl text-gray-900 mb-3 md:mb-4">Review Questions</h3>
                    <div className="space-y-4 md:space-y-6">
                      {lesson.assessment.reviewQuestions.map((question, i) => (
                        <div key={i} className="bg-gray-50 rounded-xl md:rounded-2xl p-4 md:p-6">
                          <h4 className="text-base md:text-lg text-gray-900 mb-3">{question.question}</h4>
                          {question.hints.length > 0 && (
                            <div className="mb-3 md:mb-4">
                              <h5 className="font-medium text-sm md:text-base mb-2">Hints:</h5>
                              <ul className="list-disc pl-4 md:pl-5 space-y-1 md:space-y-2">
                                {question.hints.map((hint, j) => (
                                  <li key={j} className="text-sm md:text-base text-gray-600">{hint}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <div>
                            <h5 className="font-medium text-sm md:text-base mb-2">Sample Answer:</h5>
                            <p className="text-sm md:text-base text-gray-600">{question.sampleAnswer}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Practice Problems */}
                {lesson.assessment.practiceProblems.length > 0 && (
                  <div>
                    <h3 className="text-lg md:text-xl text-gray-900 mb-3 md:mb-4">Practice Problems</h3>
                    <div className="space-y-4 md:space-y-6">
                      {lesson.assessment.practiceProblems.map((problem, i) => (
                        <div key={i} className="bg-gray-50 rounded-xl md:rounded-2xl p-4 md:p-6">
                          <h4 className="text-base md:text-lg text-gray-900 mb-3">{problem.problem}</h4>
                          <div className="mb-3 md:mb-4">
                            <h5 className="font-medium text-sm md:text-base mb-2">Approach:</h5>
                            <p className="text-sm md:text-base text-gray-600">{problem.approach}</p>
                          </div>
                          <div>
                            <h5 className="font-medium text-sm md:text-base mb-2">Solution:</h5>
                            <p className="text-sm md:text-base text-gray-600">{problem.solution}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Resources */}
            <div className="mb-8 md:mb-12">
              <h2 className="text-xl md:text-2xl text-gray-900 mb-4 md:mb-6">Resources</h2>
              <div className="grid gap-3 md:gap-4">
                {lesson.resources.required.map((resource, i) => (
                  <div key={i} className="flex items-start gap-3 md:gap-4 p-4 md:p-6 bg-gray-50 rounded-xl md:rounded-2xl">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                      <Book className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg text-gray-900 mb-1">{resource.title}</h3>
                      <p className="text-xs md:text-sm text-gray-500 mb-2">{resource.type}</p>
                      <p className="text-sm md:text-base text-gray-600">{resource.description}</p>
                    </div>
                  </div>
                ))}
                {/* Supplementary Resources */}
                {lesson.resources.supplementary && lesson.resources.supplementary.length > 0 && (
                  <div className="mt-6 md:mt-8">
                    <h3 className="text-lg md:text-xl text-gray-900 mb-3 md:mb-4">Supplementary Resources</h3>
                    <div className="grid gap-3 md:gap-4">
                      {lesson.resources.supplementary.map((resource, i) => (
                        <div key={i} className="flex items-start gap-3 md:gap-4 p-4 md:p-6 bg-gray-50 rounded-xl md:rounded-2xl">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                            <Book className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-base md:text-lg text-gray-900 mb-1">{resource.title}</h3>
                            <p className="text-xs md:text-sm text-gray-500 mb-2">{resource.type}</p>
                            <p className="text-sm md:text-base text-gray-600">{resource.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Next Steps */}
            <div className="mb-8 md:mb-12">
              <h2 className="text-xl md:text-2xl text-gray-900 mb-4 md:mb-6">Next Steps</h2>
              <div className="bg-gray-50 rounded-xl md:rounded-2xl p-4 md:p-6">
                <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">{lesson.nextSteps.summary}</p>

                {lesson.nextSteps.furtherLearning.length > 0 && (
                  <div className="mb-4 md:mb-6">
                    <h3 className="text-base md:text-lg font-medium mb-2 md:mb-3">Further Learning</h3>
                    <ul className="list-disc pl-4 md:pl-5 space-y-1 md:space-y-2">
                      {lesson.nextSteps.furtherLearning.map((item, i) => (
                        <li key={i} className="text-sm md:text-base text-gray-600">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {lesson.nextSteps.applications.length > 0 && (
                  <div>
                    <h3 className="text-base md:text-lg font-medium mb-2 md:mb-3">Practical Applications</h3>
                    <ul className="list-disc pl-4 md:pl-5 space-y-1 md:space-y-2">
                      {lesson.nextSteps.applications.map((item, i) => (
                        <li key={i} className="text-sm md:text-base text-gray-600">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Notes Section - Only visible in print */}
            <div className="hidden print:block print:page-break-before-always">
              <h2 className="text-xl mb-4">Notes</h2>
              <div className="border-t border-dashed pt-4">
                <div className="h-96"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}