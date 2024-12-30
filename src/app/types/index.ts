// src/types/index.ts
// Syllabus types
export interface SyllabusLesson {
  id: string;
  title: string;
  description: string;
}

export interface Chapter {
  emoji: string;
  title: string;
  description: string;
  estimatedDuration: string;
  lessons: SyllabusLesson[];
}

export interface Syllabus {
  title: string;
  description: string;
  difficultyLevel: string;
  estimatedDuration: string;
  prerequisites: string[];
  chapters: Chapter[];
}

// Detailed lesson types
export interface MainPoint {
  title: string;
  content: string;
  examples: string[];
}

export interface Exercise {
  title: string;
  description: string;
  difficulty: string;
  estimatedTime: string;
  sampleSolution: string;
}

export interface Resource {
  title: string;
  type: string;
  url?: string;
  description: string;
}

export interface PracticalApplication {
  scenario: string;
  application: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface LessonContent {
  introduction: string;
  mainPoints: MainPoint[];
  exercises: Exercise[];
}

export interface DetailedLesson {
  id: string;
  title: string;
  duration: string;
  content: LessonContent;
  resources: Resource[];
  practicalApplications: PracticalApplication[];
  quiz: {
    questions: QuizQuestion[];
  };
  nextSteps: string;
}