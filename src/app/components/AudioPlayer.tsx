import React, { useState, useRef } from 'react';
import { Play, Pause, Loader2 } from 'lucide-react';

interface AudioPlayerProps {
  lessonTitle: string;
  lessonContent: string;
}

export default function AudioPlayer({ lessonTitle, lessonContent }: AudioPlayerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const formatContent = (content: string) => {
    // Clean up and format the content for natural speech
    return content
      .replace(/\n+/g, ' ')  // Replace multiple newlines with space
      .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
      .trim();
  };

  const generateAndPlayAudio = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/generate-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: lessonTitle,
          content: formatContent(lessonContent)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      if (audioRef.current) {
        audioRef.current.src = url;
        await audioRef.current.play();
        setIsPlaying(true);
      }
      
      setAudioUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate audio');
      console.error('Error generating audio:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      await generateAndPlayAudio();
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={togglePlay}
        disabled={isLoading}
        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-sm hover:shadow transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating Audio...
          </>
        ) : (
          <>
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isPlaying ? 'Pause Lesson' : 'Play Lesson'}
          </>
        )}
      </button>

      <audio
        ref={audioRef}
        onEnded={handleAudioEnded}
        className="hidden"
      />

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}