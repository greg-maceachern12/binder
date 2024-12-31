'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, SparklesIcon, BookOpen, Search, TrendingUp, BookType, ArrowRight } from 'lucide-react';

// Define type for topic categories
type TopicCategoryKey = 'Technology' | 'Business' | 'Personal Development';

const TOPIC_CATEGORIES: Record<TopicCategoryKey, string[]> = {
  "Technology": [
    "Machine Learning Fundamentals",
    "Blockchain Technology",
    "Modern Web Development",
    "Cloud Computing Architecture"
  ],
  "Business": [
    "Digital Marketing Strategies",
    "Wealth Management",
    "Sustainable Business Practices",
    "Entrepreneurship Masterclass"
  ],
  "Personal Development": [
    "Personal Finance Planning",
    "Mental Health and Wellness",
    "Leadership Skills",
    "Time Management"
  ]
};

export default function SyllabusForm() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<TopicCategoryKey>('Technology');
  const topicInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Generate syllabus
      const syllabusResponse = await fetch('/api/generate-syllabus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });

      const syllabusData = await syllabusResponse.json();

      if (!syllabusResponse.ok) {
        throw new Error(syllabusData.error || 'Failed to generate syllabus');
      }

      // Generate unique ID for the syllabus
      const syllabusId = crypto.randomUUID();

      // Store the syllabus data
      await fetch(`/api/syllabus/${syllabusId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ syllabus: syllabusData.syllabus }),
      });

      // Redirect to the syllabus page
      router.push(`/syllabus/${syllabusId}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicSelect = (suggestedTopic: string) => {
    setTopic(suggestedTopic);
    topicInputRef.current?.focus();
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Hero Section */}
      <div className="text-center mb-8 md:mb-12">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-blue-200 rounded-full blur-2xl opacity-30"></div>
          <div className="relative p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-6">
            <SparklesIcon className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          Discover Your Next <br className="md:hidden" />
          <span className="text-blue-600">Learning Journey</span>
        </h1>
        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
          Generate personalized learning paths for any topic with our AI-powered syllabus creator
        </p>
      </div>

      {/* Search Form */}
      <div className="max-w-3xl mx-auto mb-8 md:mb-12">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex flex-col sm:flex-row gap-2 sm:gap-0">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={topicInputRef}
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What would you like to learn?"
                className="w-full pl-12 pr-4 py-4 text-base text-black md:text-lg rounded-xl sm:rounded-r-none border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                disabled={isLoading}
              />
              {topic && !isLoading && (
                <button
                  type="button"
                  onClick={() => setTopic('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={!topic || isLoading}
              className="w-full sm:w-auto px-6 py-4 bg-blue-600 text-white rounded-xl sm:rounded-l-none hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 min-w-[140px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-5 h-5" />
                  <span>Generate</span>
                </>
              )}
            </button>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm flex items-start gap-2">
              <div className="w-5 h-5 rounded-full border-2 border-red-600 flex items-center justify-center flex-shrink-0 mt-0.5">!</div>
              <p>{error}</p>
            </div>
          )}
        </form>
      </div>

      {/* Topic Categories */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-8 md:mb-12 overflow-hidden">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">Popular Topics</h2>
        </div>
        
        {/* Category Tabs - Horizontal Scrollable on Mobile */}
        <div className="flex gap-2 md:gap-4 mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
          {(Object.keys(TOPIC_CATEGORIES) as TopicCategoryKey[]).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                activeCategory === category
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Topic Grid - Responsive Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {TOPIC_CATEGORIES[activeCategory].map((topicItem) => (
            <button
              key={topicItem}
              onClick={() => handleTopicSelect(topicItem)}
              className="group p-4 text-left rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <BookType className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{topicItem}</h3>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Features Grid - Responsive Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {[
          {
            icon: "✨",
            title: "AI-Powered Learning",
            description: "Customized syllabi created by advanced AI"
          },
          {
            icon: "📚",
            title: "Comprehensive Modules",
            description: "Structured chapters with detailed lessons"
          },
          {
            icon: "📈",
            title: "Track Progress",
            description: "Monitor your learning journey"
          }
        ].map((feature) => (
          <div key={feature.title} 
               className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all duration-300">
            <div className="mb-4 text-2xl">{feature.icon}</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600 text-sm">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}