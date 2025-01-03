import { DetailedLesson } from '@/app/types';

export interface DbSyllabus {
    id: string;
    title: string;
    description: string;
    difficulty_level: string;
    estimated_duration: string;
    prerequisites: string[];
    created_at: string;
    updated_at: string;
    chapters: DbChapter[];
  }
  
  export interface DbChapter {
    id: string;
    syllabus_id: string;
    title: string;
    description: string;
    estimated_duration: string;
    emoji: string;
    order_index: number;
    created_at: string;
    updated_at: string;
    lessons: DbLesson[];
  }
  
  export interface DbLesson {
    id: string;
    chapter_id: string;
    title: string;
    description: string | null;
    order_index: number;
    content: DetailedLesson | null; // This can be typed more specifically if needed
    created_at: string;
    updated_at: string;
  }