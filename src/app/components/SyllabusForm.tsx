'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Loader2, BookOpen, Search, TrendingUp, BookType, ArrowRight, ExternalLink } from 'lucide-react';

type CourseType = 'primer' | 'fullCourse';

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

export default function SyllabusForm() {
  const [topic, setTopic] = useState('');
  const [courseType, setCourseType] = useState<CourseType>('primer');
  const [successTopic, setSuccessTopic] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syllabusUrl, setSyllabusUrl] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<TopicCategoryKey>('Finance');
  const topicInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    // Clear success message when starting new generation
    setSyllabusUrl(null);
    setSuccessTopic('');

    try {
      const response = await fetch('/api/generate-syllabus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          courseType
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate syllabus');
      }

      setSyllabusUrl(`/syllabus/${data.slug}`);
      setSuccessTopic(topic);
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
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap bg-green-50 px-2 py-1 rounded-full">
            Now using Sonar Pro by Perplexity AI
          </div>
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-blue-200 rounded-full blur-2xl opacity-30"></div>
          <div className="relative p-3 rounded-full">
            <Image
              src="/logo_trans.png"
              alt="Logo"
              width={96}
              height={96}
              className="w-16 h-16 md:w-24 md:h-24"
              priority
            />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl text-gray-900 mb-4 leading-tight">
          Discover Your Next <br className="md:hidden" />
          <span className="animate-gradient bg-gradient-to-r from-blue-600 via-yellow-600 to-pink-500 bg-clip-text text-transparent bg-300%">
            Learning Journey
          </span>
        </h1>
        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
          Generate personalized learning paths for any topic with our AI-powered course creator
        </p>
      </div>

      {/* Search Form */}
      <div className="max-w-3xl mx-auto mb-8 md:mb-12">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex flex-col gap-4">
            {/* Course Type Selection with Description */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => setCourseType('primer')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium ${courseType === 'primer'
                    ? 'bg-white text-gray-900 border border-gray-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  🚀 Quick Primer
                </button>

                <button
                  type="button"
                  onClick={() => setCourseType('fullCourse')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium ${courseType === 'fullCourse'
                    ? 'bg-black text-white border border-gray-900'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                >
                  🎓 Full Course
                </button>
              </div>
              <p className="text-sm text-gray-600 text-center transition-all duration-300">
                {courseType === 'primer'
                  ? "A high-level crash course covering key concepts and fundamentals"
                  : "A comprehensive curriculum with detailed lessons and exercises"
                }
              </p>
            </div>

            {/* Search Input and Submit */}
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
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm flex items-start gap-2">
              <div className="w-5 h-5 rounded-full border-2 border-red-600 flex items-center justify-center flex-shrink-0 mt-0.5">!</div>
              <p>{error}</p>
            </div>
          )}

          {/* Success Message */}
          {syllabusUrl && (
            <div className="mt-4 p-4 bg-green-50 border border-green-100 text-green-600 rounded-lg text-sm flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-medium">Your {courseType === 'primer' ? 'quick primer' : 'full course'} on {successTopic} is ready!</p>
              </div>
              <a
                href={syllabusUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>View Course</span>
              </a>
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
                className={`flex-shrink-0 px-3.5 py-1.5 md:px-4 md:py-2 rounded-full text-sm whitespace-nowrap transition-all duration-300 ${activeCategory === category
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
                  <h3 className="text-xs font-inter text-gray-900 truncate group-hover:text-blue-600 transition-colors">
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
      <div>
        <div className="mb-6 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg md:text-xl text-gray-900">Featured Courses</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {[
            {
              title: "🏠 DIY A-Frame Constructions",
              description: "Learn how to design and build your own A-frame structure, from planning and materials selection to construction techniques and finishing touches.",
              href: "/syllabus/142da292-c1b8-4f18-84cd-e0fe9790793b"
            },
            {
              title: "💰 Wealth Management - Primer",
              description: "A focused introduction to get you started quickly with wealth management",
              href: "/syllabus/d333a703-87a9-4387-83a5-a1a82c1b168c"
            },
            {
              title: "🌱 Starting a Microgreens Garden",
              description: "A comprehensive course covering everything from fundamentals to advanced applications of growing microgreens",
              href: "/syllabus/eb470a51-d8db-45fd-baa4-252214750b29"
            }
          ].map((feature) => (
            <a
              key={feature.title}
              href={feature.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all duration-300 block relative"
            >
              <div className="absolute top-4 right-4">
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <h3 className="text-xl text-gray-900 mb-2 pr-8">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </a>
          ))}
        </div>
      </div>

    </div>
  );
}