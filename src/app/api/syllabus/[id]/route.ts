// app/api/syllabus/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Syllabus } from '@/app/types';

// Properly typed syllabus store
const syllabusStore: { [key: string]: Syllabus } = {};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const syllabus = syllabusStore[id];
  
  if (!syllabus) {
    return NextResponse.json(
      { error: 'Syllabus not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ syllabus });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json();
  syllabusStore[id] = body.syllabus;
  
  return NextResponse.json({ success: true });
}