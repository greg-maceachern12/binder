/**
 * @deprecated This API route is deprecated and will be removed in a future version.
 * The play lesson audio functionality is no longer supported.
 */
// src/app/api/generate-speech/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI();

/**
 * @deprecated This endpoint is deprecated. Audio generation functionality is no longer supported.
 */
export async function POST(request: Request) {
  try {
    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Generate speech using OpenAI's TTS
    const speechResponse = await openai.audio.speech.create({
      model: 'tts-1',  // or 'tts-1-hd' for higher quality
      voice: 'shimmer',  // Options: alloy, echo, fable, onyx, nova, shimmer
      input: content,
    });

    // Get the audio data as a buffer
    const buffer = Buffer.from(await speechResponse.arrayBuffer());

    // Return the audio file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error generating speech:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
}

