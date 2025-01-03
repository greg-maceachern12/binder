'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase/client';
import { Syllabus, DetailedLesson, Chapter, SyllabusLesson } from '@/app/types';
import { DbSyllabus, DbChapter, DbLesson } from '@/app/types/database';
import SyllabusDisplay from '@/app/components/SyllabusDisplay';
import Head from 'next/head';

export default function SyllabusPage() {
    const params = useParams();
    const router = useRouter();
    const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
    const [generatingLessons, setGeneratingLessons] = useState(false);
    const [generatedLessons, setGeneratedLessons] = useState<{ [key: string]: DetailedLesson }>({});
    const [currentGeneratingLesson, setCurrentGeneratingLesson] = useState<string>('');

    useEffect(() => {
        const fetchSyllabus = async () => {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!params.slug || !uuidRegex.test(params.slug as string)) {
                router.push('/');
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
                router.push('/');
                return;
            }

            const dbSyllabus = syllabusData as DbSyllabus;

            const transformedSyllabus: Syllabus = {
                title: dbSyllabus.title,
                description: dbSyllabus.description,
                difficultyLevel: dbSyllabus.difficulty_level,
                estimatedDuration: dbSyllabus.estimated_duration,
                prerequisites: dbSyllabus.prerequisites || [],
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

            // Set page title
            document.title = `${transformedSyllabus.title} | Learning Journey`;

            const generatedLessonsMap = dbSyllabus.chapters.reduce((acc: { [key: string]: DetailedLesson }, chapter) => {
                chapter.lessons.forEach((lesson: DbLesson) => {
                    if (lesson.content) {
                        acc[lesson.id] = lesson.content;
                    }
                });
                return acc;
            }, {});

            setGeneratedLessons(generatedLessonsMap);
        };

        fetchSyllabus();
    }, [params.slug, router]);

    const generateLesson = async (chapter: Chapter, lesson: SyllabusLesson) => {
        const response = await fetch('/api/generate-lesson', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                lessonId: lesson.id,
                lessonTitle: lesson.title,
                chapterTitle: chapter.title,
                courseTitle: syllabus?.title
            })
        });

        if (!response.ok) {
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
    };

    if (!syllabus) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>{syllabus.title} - Primer AI</title>
            </Head>
            <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
                    <SyllabusDisplay
                        syllabus={syllabus}
                        onGenerateFullCourse={async () => {
                            setGeneratingLessons(true);

                            try {
                                const newGeneratedLessons = { ...generatedLessons };

                                for (const chapter of syllabus.chapters) {
                                    for (const lesson of chapter.lessons) {
                                        if (newGeneratedLessons[lesson.id]) {
                                            continue;
                                        }

                                        setCurrentGeneratingLesson(`${chapter.title} - ${lesson.title}`);
                                        const response = await generateLesson(chapter, lesson);
                                        newGeneratedLessons[lesson.id] = response;
                                        setGeneratedLessons({ ...newGeneratedLessons });
                                    }
                                }
                            } catch (error) {
                                console.error('Failed to generate lessons:', error);
                            }

                            setGeneratingLessons(false);
                            setCurrentGeneratingLesson('');
                        }}
                        generatingLessons={generatingLessons}
                        currentGeneratingLesson={currentGeneratingLesson}
                        generatedLessons={generatedLessons}
                    />
                </div>
            </main>
        </>
    );
}