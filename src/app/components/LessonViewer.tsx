import { useState } from 'react';
import { DetailedLesson } from '@/app/types';
import { 
  X, BookOpen, Target, Lightbulb, Menu, ArrowRight, CheckCircle, 
  AlertCircle, Timer, Award, ArrowLeft, Book
} from 'lucide-react';

interface Props {
  lesson: DetailedLesson;
  onClose: () => void;
}

export default function LessonViewer({ lesson, onClose }: Props) {
  const [activeSection, setActiveSection] = useState('introduction');
  const [isNavOpen, setIsNavOpen] = useState(false);
  
  const sections = ['introduction', 'main-points', 'exercises', 'resources', 'quiz', 'next-steps'];
  const currentSectionIndex = sections.indexOf(activeSection);
  const progress = ((currentSectionIndex + 1) / sections.length) * 100;

  const goToNextSection = () => {
    const nextIndex = currentSectionIndex + 1;
    if (nextIndex < sections.length) {
      setActiveSection(sections[nextIndex]);
      setIsNavOpen(false); // Close nav drawer on mobile when changing sections
    }
  };

  const goToPreviousSection = () => {
    const prevIndex = currentSectionIndex - 1;
    if (prevIndex >= 0) {
      setActiveSection(sections[prevIndex]);
      setIsNavOpen(false); // Close nav drawer on mobile when changing sections
    }
  };

  const handleSectionClick = (section: string) => {
    setActiveSection(section);
    setIsNavOpen(false); // Close nav drawer on mobile after selection
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white h-[96vh] w-full max-w-6xl rounded-xl flex flex-col overflow-hidden">
        {/* Progress Bar */}
        <div className="h-1 bg-gray-100">
          <div 
            className="h-full bg-blue-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b bg-white">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsNavOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg sm:hidden"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 line-clamp-1">{lesson.title}</h2>
                <div className="hidden sm:flex items-center gap-4 mt-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Timer className="w-4 h-4" />
                    20 min read
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    {sections.length} sections
                  </span>
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Mobile Navigation Drawer */}
          <div 
            className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 sm:hidden ${
              isNavOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => setIsNavOpen(false)}
          >
            <div 
              className={`absolute top-0 left-0 bottom-0 w-72 bg-white transform transition-transform duration-300 ${
                isNavOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-900">Lesson Sections</h3>
              </div>
              {/* Mobile Navigation Content */}
              {sections.map((section, index) => (
                <button
                  key={section}
                  onClick={() => handleSectionClick(section)}
                  className={`w-full text-left p-4 flex items-center gap-4 border-l-4 ${
                    activeSection === section 
                      ? 'bg-blue-50 border-blue-600 text-blue-600'
                      : index <= currentSectionIndex
                      ? 'bg-white border-green-500'
                      : 'border-transparent'
                  }`}
                >
                  {index <= currentSectionIndex && index !== currentSectionIndex && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {index === currentSectionIndex && (
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                  )}
                  {index > currentSectionIndex && (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                  <div>
                    <div className="font-medium text-gray-900">
                      {section.charAt(0).toUpperCase() + section.slice(1).replace('-', ' ')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {index <= currentSectionIndex ? 'Completed' : 'Not started'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Navigation Sidebar */}
          <nav className="hidden sm:block w-72 border-r bg-gray-50 overflow-y-auto">
            {sections.map((section, index) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`w-full text-left p-4 flex items-center gap-4 border-l-4 ${
                  activeSection === section 
                    ? 'bg-blue-50 border-blue-600 text-blue-600'
                    : index <= currentSectionIndex
                    ? 'bg-white border-green-500'
                    : 'border-transparent hover:bg-gray-100'
                }`}
              >
                {index <= currentSectionIndex && index !== currentSectionIndex && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                {index === currentSectionIndex && (
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                )}
                {index > currentSectionIndex && (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                )}
                <div>
                  <div className="font-medium text-gray-900">
                    {section.charAt(0).toUpperCase() + section.slice(1).replace('-', ' ')}
                  </div>
                  <div className="text-sm text-gray-500">
                    {index <= currentSectionIndex ? 'Completed' : 'Not started'}
                  </div>
                </div>
              </button>
            ))}
          </nav>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {/* Introduction */}
              {activeSection === 'introduction' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-xl p-6">
                    <p className="text-lg text-blue-900 leading-relaxed">
                      {lesson.content.introduction}
                    </p>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-6">
                    <h4 className="flex items-center gap-2 text-lg font-semibold text-yellow-900 mb-3">
                      <Lightbulb className="w-5 h-5" />
                      Key Takeaways
                    </h4>
                    <ul className="space-y-3">
                      {lesson.content.mainPoints.slice(0, 3).map((point, index) => (
                        <li key={index} className="flex items-start gap-3 text-yellow-900">
                          <Award className="w-5 h-5 mt-1 flex-shrink-0" />
                          <span>{point.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Main Points */}
              {activeSection === 'main-points' && (
                <div className="space-y-6">
                  {lesson.content.mainPoints.map((point, index) => (
                    <div key={index} className="bg-white border rounded-xl p-6 hover:border-blue-200 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-semibold">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold text-gray-900 mb-3">{point.title}</h4>
                          <p className="text-gray-600 mb-4 leading-relaxed">{point.content}</p>
                          {point.examples.length > 0 && (
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h5 className="font-medium text-gray-900 mb-2">Examples</h5>
                              <ul className="space-y-2">
                                {point.examples.map((example, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <ArrowRight className="w-4 h-4 mt-1 text-gray-400" />
                                    <span className="text-gray-600">{example}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Exercises */}
              {activeSection === 'exercises' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-xl p-6 mb-6">
                    <h3 className="text-xl font-semibold text-blue-900 mb-2">Practice Exercises</h3>
                    <p className="text-blue-800">Complete these exercises to reinforce your learning.</p>
                  </div>
                  {lesson.content.exercises.map((exercise, index) => (
                    <div key={index} className="bg-white border rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-semibold text-gray-900">{exercise.title}</h4>
                        <div className="flex gap-2">
                          <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">
                            {exercise.difficulty}
                          </span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                            {exercise.estimatedTime}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">{exercise.description}</p>
                      {exercise.sampleSolution && (
                        <details className="group">
                          <summary className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            View Solution
                          </summary>
                          <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-600">{exercise.sampleSolution}</p>
                          </div>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Resources */}
              {activeSection === 'resources' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-xl p-6 mb-6">
                    <h3 className="text-xl font-semibold text-blue-900 mb-2">Additional Resources</h3>
                    <p className="text-blue-800">Explore these materials to deepen your understanding.</p>
                  </div>
                  <div className="grid gap-4">
                    {lesson.resources.map((resource, index) => (
                      <div key={index} className="bg-white border rounded-xl p-6 hover:border-blue-200 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Book className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">{resource.title}</h4>
                            <p className="text-gray-600 mb-3">{resource.description}</p>
                            <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                              {resource.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quiz */}
              {activeSection === 'quiz' && lesson.quiz && (
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-xl p-6 mb-6">
                    <h3 className="text-xl font-semibold text-blue-900 mb-2">Knowledge Check</h3>
                    <p className="text-blue-800">Test your understanding of the key concepts.</p>
                  </div>
                  {lesson.quiz.questions.map((question, index) => (
                    <div key={index} className="bg-white border rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Question {index + 1}: {question.question}
                      </h4>
                      <div className="space-y-3 mb-4">
                        {question.options.map((option, i) => (
                          <label 
                            key={i}
                            className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name={`question-${index}`}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                      <details className="group">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          Show Answer
                        </summary>
                        <div className="mt-3 p-4 bg-green-50 rounded-lg">
                          <p className="font-medium text-green-900">Correct Answer: {question.correctAnswer}</p>
                          <p className="text-green-800 mt-2">{question.explanation}</p>
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              )}

              {/* Next Steps */}
              {activeSection === 'next-steps' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-xl p-6 mb-6">
                    <h3 className="text-xl font-semibold text-blue-900 mb-2">Next Steps</h3>
                    <p className="text-blue-800">Follow these recommendations to continue your learning journey.</p>
                  </div>
                  <div className="bg-white border rounded-xl p-6">
                    <p className="text-gray-600 leading-relaxed">{lesson.nextSteps}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Controls */}
            <div className="p-4 border-t bg-white flex items-center justify-between">
              <button
                onClick={goToPreviousSection}
                disabled={currentSectionIndex === 0}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>
              <div className="text-sm text-gray-500">
                {currentSectionIndex + 1} / {sections.length}
              </div>
              <button
                onClick={currentSectionIndex === sections.length - 1 ? onClose : goToNextSection}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {currentSectionIndex === sections.length - 1 ? (
                  <>
                    <span className="hidden sm:inline">Complete</span>
                    <span className="sm:hidden">Done</span>
                    <CheckCircle className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}