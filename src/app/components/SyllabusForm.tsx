'use client';

import { useState } from 'react';
import { Syllabus } from '@/app/types';
import { SparklesIcon } from 'lucide-react';

interface Props {
  onSyllabusGenerated: (syllabus: Syllabus) => void;
}

export default function SyllabusForm({ onSyllabusGenerated }: Props) {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-syllabus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate syllabus');
      }

      onSyllabusGenerated(data.syllabus);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="max-w-2xl mx-auto text-center p-4 sm:p-6"
    >
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 flex items-center justify-center gap-3">
        <SparklesIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
        What do you want to learn today?
      </h1>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a topic (e.g., Wealth Management)"
          className="w-full sm:flex-1 px-3 py-2 sm:px-4 sm:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!topic || isLoading}
          className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base transition-all duration-300"
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
      </div>
      {error && (
        <p className="mt-4 text-red-600 text-sm sm:text-base">{error}</p>
      )}
    </form>
  );
}