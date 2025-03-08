'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase/client';
import { Syllabus, Chapter, SyllabusLesson, DetailedLesson } from '@/app/types';
import { DbSyllabus, DbChapter, DbLesson } from '@/app/types/database';
import SyllabusDisplay from '@/app/components/SyllabusDisplay';
import { useAuth } from '@/app/context/AuthContext';

export default function SyllabusPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
    const [generatingLessons, setGeneratingLessons] = useState(false);
    const [generatedLessons, setGeneratedLessons] = useState<{ [key: string]: DetailedLesson }>({});
    const [currentGeneratingLesson, setCurrentGeneratingLesson] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // More efficient fetch syllabus function with error handling
    const fetchSyllabus = useCallback(async () => {
        setIsLoading(true);
        try {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!params.slug || !uuidRegex.test(params.slug as string)) {
                router.push('/');
                return;
            }

            // Fetch just syllabus metadata first for faster initial load
            const { data: syllabusData, error: syllabusError } = await supabase
                .from('syllabi')
                .select('id, title, description, difficulty_level, estimated_duration, prerequisites, image_url')
                .eq('id', params.slug)
                .single();

            if (syllabusError || !syllabusData) {
                console.error('Error fetching syllabus:', syllabusError);
                router.push('/');
                return;
            }

            // Set page title early
            document.title = `${syllabusData.title} | PrimerAI`;

            // Now fetch the complete syllabus with chapters and lessons
            const { data: fullSyllabusData, error: fullSyllabusError } = await supabase
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

            if (fullSyllabusError || !fullSyllabusData) {
                console.error('Error fetching full syllabus:', fullSyllabusError);
                router.push('/');
                return;
            }

            const dbSyllabus = fullSyllabusData as DbSyllabus;

            const transformedSyllabus: Syllabus = {
                id: dbSyllabus.id,
                title: dbSyllabus.title,
                description: dbSyllabus.description,
                difficultyLevel: dbSyllabus.difficulty_level,
                estimatedDuration: dbSyllabus.estimated_duration,
                prerequisites: dbSyllabus.prerequisites || [],
                image_url: dbSyllabus.image_url || undefined,
                chapters: (dbSyllabus.chapters as DbChapter[])
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((chapter) => ({
                        title: chapter.title,
                        description: chapter.description,
                        estimatedDuration: chapter.estimated_duration,
                        emoji: chapter.emoji,
                        lessons: (chapter.lessons as DbLesson[])
                            .sort((a, b) => a.order_index - b.order_index)
                            .map((lesson) => ({
                                id: lesson.id,
                                title: lesson.title,
                                description: lesson.description || ''
                            }))
                    }))
            };

            setSyllabus(transformedSyllabus);

            const generatedLessonsMap = dbSyllabus.chapters.reduce((acc: { [key: string]: DetailedLesson }, chapter) => {
                chapter.lessons.forEach((lesson: DbLesson) => {
                    if (lesson.content) {
                        acc[lesson.id] = lesson.content;
                    }
                });
                return acc;
            }, {});

            setGeneratedLessons(generatedLessonsMap);
        } catch (error) {
            console.error('Error in fetchSyllabus:', error);
            setError('Failed to load the syllabus. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, [params.slug, router]);

    useEffect(() => {
        fetchSyllabus();
    }, [fetchSyllabus]);

    const generateLesson = useCallback(async (chapter: Chapter, lesson: SyllabusLesson) => {
        try {
            const response = await fetch('/api/generate-lesson', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lessonId: lesson.id,
                    lessonTitle: lesson.title,
                    chapterTitle: chapter.title,
                    courseTitle: syllabus?.title,
                    userId: user?.id
                })
            });

            if (!response.ok) {
                if (response.status === 403) {
                    setError("You need an active subscription to generate lessons");
                    return null;
                }
                throw new Error('Failed to generate lesson');
            }

            const data = await response.json();

            const { error: updateError } = await supabase
                .from('lessons')
                .update({ content: data.lesson })
                .eq('id', lesson.id);

            if (updateError) {
                throw new Error('Failed to save lesson content');
            }

            return data.lesson;
        } catch (error) {
            console.error('Error in generateLesson:', error);
            setError('Failed to generate lesson. Please try again later.');
            return null;
        }
    }, [syllabus?.title, user?.id]);

    const generateAllLessons = useCallback(async () => {
        setGeneratingLessons(true);
        setError(null);

        try {
            const newGeneratedLessons = { ...generatedLessons };

            // Process chapters in sequence but batch lessons for each chapter
            for (const chapter of syllabus!.chapters) {
                const lessonsToGenerate = chapter.lessons.filter(lesson => !newGeneratedLessons[lesson.id]);
                
                // Process 2 lessons at a time to balance performance and resource usage
                for (let i = 0; i < lessonsToGenerate.length; i += 2) {
                    const batchPromises = lessonsToGenerate.slice(i, i + 2).map(async (lesson) => {
                        setCurrentGeneratingLesson(`${chapter.title} - ${lesson.title}`);
                        const response = await generateLesson(chapter, lesson);
                        if (response) {
                            newGeneratedLessons[lesson.id] = response;
                        }
                    });
                    
                    await Promise.all(batchPromises);
                    setGeneratedLessons({ ...newGeneratedLessons });
                }
            }
        } catch (error) {
            console.error('Failed to generate lessons:', error);
            setError('There was an error generating the course. Please try again later.');
        } finally {
            setGeneratingLessons(false);
            setCurrentGeneratingLesson('');
        }
    }, [syllabus, generatedLessons, generateLesson]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                    <p className="text-lg text-gray-600">Loading syllabus...</p>
                </div>
            </div>
        );
    }

    if (!syllabus) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-lg max-w-md">
                    <h2 className="text-xl font-semibold mb-2">Syllabus not found</h2>
                    <p className="mb-4">We couldn't find the syllabus you're looking for.</p>
                    <button 
                        onClick={() => router.push('/')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-center">
                        <span className="flex-grow">{error}</span>
                        <button 
                            onClick={() => setError(null)}
                            className="text-red-600 hover:text-red-800"
                        >
                            ✕
                        </button>
                    </div>
                )}
                
                <SyllabusDisplay
                    syllabus={syllabus}
                    onGenerateFullCourse={generateAllLessons}
                    generatingLessons={generatingLessons}
                    currentGeneratingLesson={currentGeneratingLesson}
                    generatedLessons={generatedLessons}
                />
            </div>
        </main>
    );
}