import React from 'react';
import { Book, Clock, Target, Printer, X, ChevronRight } from 'lucide-react';

interface Example {
  scenario: string;
  explanation: string;
}

interface Section {
  title: string;
  content: string;
  keyPoints: string[];
  examples: Example[];
}

interface PracticalExercise {
  title: string;
  instructions: string;
  solution: string;
}

interface Resource {
  title: string;
  description: string;
}

interface Lesson {
  title: string;
  metadata: {
    duration: string;
    difficulty: string;
    learningObjectives: string[];
  };
  content: {
    sections: Section[];
    practicalExercises: PracticalExercise[];
  };
  resources: {
    required: Resource[];
  };
}

interface LessonViewerProps {
  lesson: Lesson;
  onClose: () => void;
}

export default function LessonViewer({ lesson, onClose }: LessonViewerProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center print:static print:bg-white print:p-0">
      <div className="w-full h-[96vh] max-w-6xl bg-white rounded-2xl shadow-2xl flex print:shadow-none print:h-auto print:block print:max-w-none print:rounded-none">
        {/* Sidebar - hidden in print */}
        <div className="w-72 border-r bg-gray-50/50 backdrop-blur overflow-y-auto print:hidden">
          <nav className="p-6">
            <h2 className="text-xl text-gray-900 mb-6">Lesson Contents</h2>
            {lesson.content.sections.map((section, i) => (
              <a
                key={i}
                href={`#section-${i}`}
                className="group flex items-center gap-2 py-3 px-4 text-gray-600 hover:text-blue-600 rounded-xl hover:bg-blue-50/50 transition-all duration-200"
              >
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {i + 1}
                </div>
                <span className="font-medium text-sm">{section.title}</span>
                <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-white">
          {/* Header - hidden in print */}
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b print:hidden">
            <div className="px-6 py-4 flex justify-between items-center">
              <button 
                onClick={() => window.print()} 
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-sm hover:shadow transition-all duration-200"
              >
                <Printer className="w-4 h-4" />
                Print Lesson
              </button>
              <button 
                onClick={onClose} 
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-4xl mx-auto p-8 pb-16 print:p-0 print:max-w-none">
            {/* Title Section */}
            <div className="mb-12 print:mb-8 print:page-break-before-always">
              <h1 className="text-4xl text-gray-900 mb-4 print:text-3xl">{lesson.title}</h1>
              <div className="flex flex-wrap gap-4 text-gray-600">
                <span className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full print:bg-transparent print:p-0 print:text-black">
                  <Clock className="w-4 h-4" />
                  {lesson.metadata.duration}
                </span>
                <span className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full print:bg-transparent print:p-0 print:text-black">
                  <Target className="w-4 h-4" />
                  {lesson.metadata.difficulty}
                </span>
              </div>
            </div>

            {/* Learning Objectives */}
            <div className="mb-12 print:mb-8">
              <h2 className="text-2xl text-gray-900 mb-6 print:text-xl print:mb-4">Learning Objectives</h2>
              <div className="bg-blue-50 rounded-2xl p-6 print:bg-transparent print:p-0">
                <ul className="space-y-4">
                  {lesson.metadata.learningObjectives.map((objective, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 print:bg-transparent print:text-black">
                        {i + 1}
                      </div>
                      <span className="text-blue-900 print:text-black">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Main Content Sections */}
            {lesson.content.sections.map((section, i) => (
              <div key={i} id={`section-${i}`} className="mb-12 print:mb-8 print:page-break-before-always">
                <h2 className="text-2xl text-gray-900 mb-6 print:text-xl print:mb-4">{section.title}</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-600 leading-relaxed mb-6">{section.content}</p>
                  
                  {/* Key Points */}
                  {section.keyPoints.length > 0 && (
                    <div className="bg-amber-50 rounded-2xl p-6 my-6 print:bg-transparent print:p-0 print:border print:border-gray-200">
                      <h3 className="text-xl text-amber-900 mb-4 print:text-black">Key Points</h3>
                      <ul className="space-y-3">
                        {section.keyPoints.map((point, j) => (
                          <li key={j} className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2.5 print:bg-black" />
                            <span className="text-amber-900 print:text-black">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Examples */}
                  {section.examples.length > 0 && (
                    <div className="space-y-4 my-6 print:page-break-inside-avoid">
                      {section.examples.map((example, j) => (
                        <div key={j} className="bg-gray-50 rounded-2xl p-6 print:bg-transparent print:p-0 print:border print:border-gray-200">
                          <h4 className="text-gray-900 text-lg mb-3">{example.scenario}</h4>
                          <p className="text-gray-600 text-md print:text-black">{example.explanation}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Exercises */}
            <div className="mb-12 print:mb-8 print:page-break-before-always">
              <h2 className="text-2xl text-gray-900 mb-6 print:text-xl print:mb-4">Practice Exercises</h2>
              <div className="space-y-6">
                {lesson.content.practicalExercises.map((exercise, i) => (
                  <div key={i} className="border border-gray-200 rounded-2xl p-6 print:border-none print:p-0 print:page-break-inside-avoid">
                    <h3 className="text-xl text-gray-900 mb-4">{exercise.title}</h3>
                    <p className="text-gray-600 mb-6">{exercise.instructions}</p>
                    <div className="print:mt-4">
                      <h4 className="font-medium text-lg mb-2">Solution:</h4>
                      <div className="bg-blue-50 rounded-xl p-6 print:bg-transparent print:p-0 print:border print:border-gray-200">
                        <p className="text-gray-600 print:text-black">{exercise.solution}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div className="mb-12 print:mb-8 print:page-break-before-always">
              <h2 className="text-2xl text-gray-900 mb-6 print:text-xl print:mb-4">Additional Resources</h2>
              <div className="grid gap-4">
                {lesson.resources.required.map((resource, i) => (
                  <div key={i} className="flex items-start gap-4 p-6 bg-gray-50 rounded-2xl print:bg-transparent print:p-0 print:border-b print:border-gray-200 last:print:border-none">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 print:hidden">
                      <Book className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 text-lg mb-1">{resource.title}</h3>
                      <p className="text-gray-600 print:text-black">{resource.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes Section - print only */}
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