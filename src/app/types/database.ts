import { DetailedLesson } from '@/app/types';

export type DbLesson = {
    id: string;
    title: string;
    description: string | null;
    order_index: number;
    content?: any;
    requires_auth?: boolean;
    created_at: string;
    updated_at: string;
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
    chapters: DbChapter[];
    created_at: string;
    updated_at: string;
};