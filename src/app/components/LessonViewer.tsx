// src/components/LessonViewer.tsx
import { DetailedLesson } from '@/app/types';

interface Props {
  lesson: DetailedLesson;
  onClose: () => void;
}

export default function LessonViewer({ lesson, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">{lesson.title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Introduction */}
          <section>
            <h3 className="text-xl font-semibold mb-3">Introduction</h3>
            <p className="text-gray-600">{lesson.content.introduction}</p>
          </section>

          {/* Main Points */}
          <section>
            <h3 className="text-xl font-semibold mb-3">Main Points</h3>
            <div className="space-y-4">
              {lesson.content.mainPoints.map((point, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">{point.title}</h4>
                  <p className="text-gray-600 mb-3">{point.content}</p>
                  {point.examples.length > 0 && (
                    <div className="pl-4 border-l-2 border-blue-200">
                      <p className="text-sm font-medium text-gray-700 mb-1">Examples:</p>
                      <ul className="list-disc pl-4 text-sm text-gray-600">
                        {point.examples.map((example, i) => (
                          <li key={i}>{example}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Exercises */}
          <section>
            <h3 className="text-xl font-semibold mb-3">Exercises</h3>
            <div className="space-y-4">
              {lesson.content.exercises.map((exercise, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">{exercise.title}</h4>
                  <p className="text-gray-600 mb-2">{exercise.description}</p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>Difficulty: {exercise.difficulty}</span>
                    <span>Time: {exercise.estimatedTime}</span>
                  </div>
                  {exercise.sampleSolution && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-sm font-medium">Sample Solution:</p>
                      <p className="text-sm text-gray-600">{exercise.sampleSolution}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Resources */}
          <section>
            <h3 className="text-xl font-semibold mb-3">Additional Resources</h3>
            <div className="grid gap-3">
              {lesson.resources.map((resource, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded">
                  <h4 className="font-medium">{resource.title}</h4>
                  <p className="text-sm text-gray-600">{resource.description}</p>
                  <span className="text-xs text-gray-500">Type: {resource.type}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Quiz Section */}
          {lesson.quiz && (
            <section>
              <h3 className="text-xl font-semibold mb-3">Knowledge Check</h3>
              <div className="space-y-4">
                {lesson.quiz.questions.map((question, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <p className="font-medium mb-2">{question.question}</p>
                    <div className="space-y-2 mb-3">
                      {question.options.map((option, i) => (
                        <div key={i} className="flex items-center">
                          <input
                            type="radio"
                            name={`question-${index}`}
                            id={`question-${index}-option-${i}`}
                            className="mr-2"
                          />
                          <label htmlFor={`question-${index}-option-${i}`}>{option}</label>
                        </div>
                      ))}
                    </div>
                    <details className="text-sm">
                      <summary className="cursor-pointer text-blue-600">Show Answer</summary>
                      <div className="mt-2 p-2 bg-blue-50 rounded">
                        <p className="font-medium">Answer: {question.correctAnswer}</p>
                        <p className="text-gray-600 mt-1">{question.explanation}</p>
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Next Steps */}
          <section>
            <h3 className="text-xl font-semibold mb-3">Next Steps</h3>
            <p className="text-gray-600">{lesson.nextSteps}</p>
          </section>
        </div>
      </div>
    </div>
  );
}