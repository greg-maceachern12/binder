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
export interface LessonExample {
  scenario: string;
  explanation: string;
}

export interface LessonSection {
  title: string;
  content: string;
  keyPoints: string[];
  examples: LessonExample[];
}

export interface PracticalExercise {
  title: string;
  type: string;
  instructions: string;
  tips: string[];
  solution: string;
}

export interface ReviewQuestion {
  question: string;
  hints: string[];
  sampleAnswer: string;
}

export interface PracticeProblem {
  problem: string;
  approach: string;
  solution: string;
}

export interface Resource {
  title: string;
  type: string;
  description: string;
}

export interface LessonMetadata {
  duration: string;
  difficulty: string;
  prerequisites: string[];
  learningObjectives: string[];
}

export interface LessonContent {
  summary: string;
  sections: LessonSection[];
  practicalExercises: PracticalExercise[];
}

export interface LessonAssessment {
  reviewQuestions: ReviewQuestion[];
  practiceProblems: PracticeProblem[];
}

export interface LessonResources {
  required: Resource[];
  supplementary: Resource[];
}

export interface LessonNextSteps {
  summary: string;
  furtherLearning: string[];
  applications: string[];
}

export interface DetailedLesson {
  id: string;
  title: string;
  metadata: LessonMetadata;
  content: LessonContent;
  assessment: LessonAssessment;
  resources: LessonResources;
  nextSteps: LessonNextSteps;
}