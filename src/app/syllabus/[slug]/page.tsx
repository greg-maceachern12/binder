'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase/client';
import { Syllabus, Chapter, SyllabusLesson, DetailedLesson } from '@/app/types';
import { DbSyllabus, DbChapter, DbLesson } from '@/app/types/database';
import SyllabusDisplay from '@/app/components/SyllabusDisplay';
import { useAuth } from '@/app/context/AuthContext';
import { Loader2, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function SyllabusPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    // Public fetch syllabus function - works without authentication
    const fetchSyllabus = useCallback(async () => {
        setIsLoading(true);
        try {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!params.slug || !uuidRegex.test(params.slug as string)) {
                setNotFound(true);
                return;
            }

            const { data: syllabusData, error: syllabusError } = await supabase
                .from('syllabi')
                .select(`
                    *,
                    chapters:chapters (
                        *,
                        lessons:lessons (*)
                    )
                `)
                .eq('id', params.slug)
                .single();

            if (syllabusError || !syllabusData) {
                console.error('Error fetching syllabus:', syllabusError);
                setNotFound(true);
                return;
            }

            // Set page title
            document.title = `${syllabusData.title} | PrimerAI`;

            // Transform data for the component
            const transformedSyllabus: Syllabus = {
                ...syllabusData,
                chapters: (syllabusData.chapters || []).map((chapter: DbChapter) => ({
                    ...chapter,
                    lessons: (chapter.lessons || []).map((lesson: DbLesson) => ({
                        ...lesson,
                        isLocked: !user && lesson.requires_auth // Lock lessons that require auth for non-authenticated users
                    }))
                }))
            };

            setSyllabus(transformedSyllabus);
        } catch (error) {
            console.error('Error fetching syllabus:', error);
            setNotFound(true);
        } finally {
            setIsLoading(false);
        }
    }, [params.slug, user]);

    useEffect(() => {
        fetchSyllabus();
    }, [fetchSyllabus]);

    if (notFound) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Syllabus Not Found</h1>
                    <p className="text-gray-600 mb-8">The syllabus you're looking for doesn't exist.</p>
                    <Link href="/dashboard" className="text-purple-600 hover:text-purple-700">
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
        );
    }

    if (!syllabus) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <SyllabusDisplay syllabus={syllabus} />
            
            {!user && (
                <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-sm text-gray-600">
                            Sign in to access all lessons and features
                        </p>
                        <Link
                            href={`/login?redirectTo=${encodeURIComponent(window.location.pathname)}`}
                            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                        >
                            <LogIn className="w-4 h-4" />
                            <span>Sign In</span>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}