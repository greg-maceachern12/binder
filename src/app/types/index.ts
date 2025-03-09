// src/types/index.ts

// Syllabus types
export type SyllabusLesson = {
  id: string;
  title: string;
  description: string | null;
  isLocked?: boolean;
};

export type Chapter = {
  id: string;
  title: string;
  description: string | null;
  emoji: string | null;
  estimated_duration: string | null;
  lessons: SyllabusLesson[];
};

export type Syllabus = {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  estimated_duration: string;
  prerequisites: string[] | null;
  image_url: string | null;
  user_id?: string;
  chapters: Chapter[];
};

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
  url: string;
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
