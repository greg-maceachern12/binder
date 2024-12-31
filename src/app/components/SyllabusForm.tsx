'use client';

import React, { useState, useRef } from 'react';
import { Loader2, BookOpen, Search, TrendingUp, BookType, ArrowRight } from 'lucide-react';
import { Syllabus } from '@/app/types';

// Define type for topic categories
type TopicCategoryKey = 'Finance' | 'Modern Business' | 'Urban Living' | 'Mind & Body' | 'Creative Writing' | 'Future Skills';

const TOPIC_CATEGORIES: Record<TopicCategoryKey, string[]> = {
  "Finance": [
    "Investment Basics",
    "Personal Budgeting",
    "Retirement Planning",
    "Tax Strategies"
  ],
  "Modern Business": [
    "Product Management",
    "Growth Strategy",
    "Remote Leadership",
    "Business Analytics"
  ],
  "Urban Living": [
    "Urban Gardening",
    "Home Organization",
    "City Photography",
    "Sustainable Living"
  ],
  "Mind & Body": [
    "Sleep Science",
    "Mindfulness Practice",
    "Nutrition Science",
    "Exercise Psychology"
  ],
  "Creative Writing": [
    "Story Structure",
    "Character Development",
    "World Building",
    "Dialogue Writing"
  ],
  "Future Skills": [
    "AI Applications",
    "Data Literacy",
    "Digital Communication",
    "Design Thinking"
  ]
};

interface Props {
  onSyllabusGenerated: (syllabus: Syllabus) => void;
}

export default function SyllabusForm({ onSyllabusGenerated }: Props) {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<TopicCategoryKey>('Finance');
  const topicInputRef = useRef<HTMLInputElement>(null);

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
          <div className="relative p-3 rounded-full mb-6">
            <img 
              src="logo_trans.png" 
              alt="Logo" 
              className="w-16 h-16 md:w-24 md:h-24"
            />
          </div>
        </div>
        <h1 className="text-3xl md:text-5xl text-gray-900 mb-4 leading-tight">
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
                className="w-full pl-12 pr-4 py-4 text-base md:text-md rounded-xl sm:rounded-r-none border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
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
<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-8 md:mb-12">
  <div className="flex items-center gap-2 mb-4 md:mb-6">
    <TrendingUp className="w-5 h-5 text-blue-600" />
    <h2 className="text-lg md:text-xl text-gray-900">Popular Topics</h2>
  </div>
  
  {/* Category Tabs - Horizontal Scrollable on Mobile */}
  <div className="-mx-4 px-4 md:mx-0 md:px-0">
    <div className="flex gap-2 overflow-x-auto pb-4 md:pb-6 no-scrollbar">
      {(Object.keys(TOPIC_CATEGORIES) as TopicCategoryKey[]).map((category) => (
        <button
          key={category}
          onClick={() => setActiveCategory(category)}
          className={`flex-shrink-0 px-3.5 py-1.5 md:px-4 md:py-2 rounded-full text-sm whitespace-nowrap transition-all duration-300 ${
            activeCategory === category
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  </div>

  {/* Topic Grid - Responsive Layout */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
    {TOPIC_CATEGORIES[activeCategory].map((topicItem) => (
      <button
        key={topicItem}
        onClick={() => handleTopicSelect(topicItem)}
        className="group p-3 md:p-4 text-left rounded-lg md:rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-md md:rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <BookType className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm md:text-base text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {topicItem}
            </h3>
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
            <h3 className="text-xl text-gray-900 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600 text-sm">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}