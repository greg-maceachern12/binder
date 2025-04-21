// import { DetailedLesson } from '@/app/types';

export type DbLesson = {
    id: string;
    title: string;
    description: string | null;
    order_index: number;
    content?: Record<string, unknown>;
    requires_auth?: boolean;
    created_at: string;
    updated_at: string;
    ai_model?: string | null;
};

export type DbChapter = {
    id: string;
    title: string;
    description: string | null;
    order_index: number;
    emoji: string | null;
    estimated_duration: string | null;
    lessons: DbLesson[];
    created_at: string;
    updated_at: string;
};

export type DbSyllabus = {
    id: string;
    title: string;
    description: string;
    difficulty_level: string;
    estimated_duration: string;
    prerequisites: string[] | null;
    image_url: string | null;
    user_id?: string;
    chapters: DbChapter[];
    created_at: string;
    updated_at: string;
    course_type?: string;
    ai_model?: string | null;
};