import { Metadata } from 'next'
import { supabase } from '@/app/lib/supabase/client'

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const resolvedParams = await params;
    const { data: syllabusData } = await supabase
        .from('syllabi')
        .select('title, description')
        .eq('id', resolvedParams.slug)
        .single();

    if (!syllabusData) {
        return {
            title: 'Syllabus',
            description: 'View course syllabus'
        }
    }

    return {
        title: `${syllabusData.title} | Primer AI`,
        description: syllabusData.description,
        openGraph: {
            title: syllabusData.title,
            description: syllabusData.description,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: syllabusData.title,
            description: syllabusData.description,
        },
    }
}

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}