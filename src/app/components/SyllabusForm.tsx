'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Loader2, BookOpen, Search, TrendingUp, BookType, Zap, CheckCircle, AlertCircle, Sparkles, Award } from 'lucide-react';
import { supabase } from "@/app/lib/supabase/client";
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import UpsellDialog from './UpsellDialog';

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
  // Use the enhanced auth context with subscription status
  const { user, hasAccess, hasPremium, subscriptionStatus } = useAuth();
  const [topic, setTopic] = useState('');
  const [courseType, setCourseType] = useState<CourseType>('primer');
  const [successTopic, setSuccessTopic] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syllabusUrl, setSyllabusUrl] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<TopicCategoryKey>('Finance');
  const [coursesGenerated, setCoursesGenerated] = useState<number | null>(null);
  const [showTopics, setShowTopics] = useState(false);
  const topicInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  // Upsell dialog state
  const [showUpsell, setShowUpsell] = useState(false);
  // const [lastTypedTime, setLastTypedTime] = useState<number>(0);

  // Polar subscription URL
  const POLAR_SUBSCRIPTION_URL = 'https://buy.polar.sh/polar_cl_fDrvRuLYXy3EkHVwSktBlPzLCCEPeFqr4ai5D0sdvVo';

  // Check if user is on trial
  const isOnTrial = subscriptionStatus === 'trial';

  // Show upsell dialog after 4 seconds for eligible users (logged in but no subscription or trial)
  useEffect(() => {
    // User is eligible if they're logged in but don't have access
    const isEligible = user && !hasAccess;
    
    if (isEligible) {
      const timer = setTimeout(() => {
        setShowUpsell(true);
      }, 4000); // Show after 4 seconds
      
      return () => clearTimeout(timer);
    }
  }, [user, hasAccess]);

  // Fetch total courses generated
  useEffect(() => {
    const fetchSyllabiCount = async () => {
      try {
        const { count, error } = await supabase
          .from('syllabi')
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.error('Error fetching syllabi count:', error);
          return;
        }
        
        // Add a bit of social proof by increasing the displayed number
        setCoursesGenerated(count ? count + 12548 : 12548);
      } catch (error) {
        console.error('Error in fetchSyllabiCount:', error);
      }
    };
    
    fetchSyllabiCount();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If user is not logged in, redirect to login page
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Check if user can generate the selected course type
    if (!hasAccess) {
      // If they can't generate the selected course, direct them to upgrade
      window.open(POLAR_SUBSCRIPTION_URL, '_blank');
      return;
    }
    
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
          courseType,
          userId: user.id
        }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          setError("You need an active subscription to generate more courses");
          return;
        }
        throw new Error('Failed to generate syllabus');
      }

      const data = await response.json();
      setSyllabusUrl(`/syllabus/${data.syllabusId}`);
      setSuccessTopic(topic);
    } catch (error: unknown) {
      console.error('Error in handleSubmit:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate syllabus');
    } finally {
      setIsLoading(false);
    }
  };

  // Update the topic input handler to track typing activity
  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTopic(e.target.value);
    setShowTopics(true);
    // setLastTypedTime(new Date().getTime());
  };

  // Re-add the handleTopicSelect function
  const handleTopicSelect = (suggestedTopic: string) => {
    setTopic(suggestedTopic);
    setShowTopics(false);
    // setLastTypedTime(new Date().getTime());
    // Focus on input after selection for a better UX
    if (topicInputRef.current) {
      topicInputRef.current.focus();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      {/* Hero Section - Simplified and cleaner */}
      <div className="text-center mb-8 md:mb-12">
        <div className="inline-flex items-center justify-center mb-6">
          <div className="relative p-3 rounded-full">
            <div className="absolute inset-0 bg-indigo-200 rounded-full blur-2xl opacity-30"></div>
            <Image
              src="/logo_trans.png"
              alt="Logo"
              width={96}
              height={96}
              className="w-16 h-16 md:w-20 md:h-20 relative"
              priority
            />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl text-gray-900 mb-4 leading-tight">
          <span className="animate-gradient bg-gradient-to-r from-blue-600 via-yellow-600 to-pink-500 bg-clip-text text-transparent bg-300%">
            Learn anything
          </span>
          <span className="block text-3xl md:text-4xl mt-1 text-gray-800">with Primer AI</span>
        </h1>
        
        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-6">
          Generate personalized learning paths tailored to your interests and needs
        </p>
        
        {/* Social proof banner */}
        {coursesGenerated && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">{coursesGenerated.toLocaleString()} courses created</span>
          </div>
        )}
      </div>

      {/* Course Creator Card - Main focus - MAKING IT MORE COMPACT */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 md:p-6 mb-8 relative overflow-hidden">
        {/* Premium badge for subscribers */}
        {hasPremium && (
          <div className="absolute top-4 right-4 z-10">
            <div className="flex items-center gap-1.5 py-1 px-2.5 bg-emerald-100 text-emerald-800 rounded-full shadow-sm border border-emerald-200">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-semibold tracking-wide">PRO</span>
            </div>
          </div>
        )}

        <h2 className="text-lg md:text-xl font-medium text-gray-900 mb-4">Create your personalized course</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Topic Input - Centered, focused, clean */}
          <div className="relative">
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1.5">What would you like to learn?</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="topic"
                ref={topicInputRef}
                type="text"
                value={topic}
                onChange={handleTopicChange}
                placeholder="Enter any topic or skill..."
                className="w-full pl-9 pr-3 py-3 text-base rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                disabled={isLoading}
                onFocus={() => setShowTopics(true)}
              />
              {topic && !isLoading && (
                <button
                  type="button"
                  onClick={() => setTopic('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
            
            {/* Topic suggestions panel - Keep the same structure, just adjusting sizes */}
            {showTopics && (
              <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-2 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">Suggested topics</span>
                  <button 
                    type="button" 
                    onClick={() => setShowTopics(false)} 
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {TOPIC_CATEGORIES[activeCategory].map((topicItem) => (
                    <button
                      key={topicItem}
                      type="button"
                      onClick={() => handleTopicSelect(topicItem)}
                      className="w-full px-3 py-1.5 text-left hover:bg-indigo-50 text-gray-700 flex items-center gap-2 transition-colors text-sm"
                    >
                      <BookType className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{topicItem}</span>
                    </button>
                  ))}
                </div>
                <div className="p-1.5 border-t border-gray-100 bg-gray-50">
                  <div className="flex gap-1.5 overflow-x-auto">
                    {(Object.keys(TOPIC_CATEGORIES) as TopicCategoryKey[]).map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setActiveCategory(category)}
                        className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs whitespace-nowrap ${
                          activeCategory === category
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Course Type Selection - More compact version */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Choose your learning experience</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCourseType('primer')}
                className={`p-3 rounded-lg text-left transition-all border ${
                  courseType === 'primer'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`flex items-center gap-2 mb-1 ${
                  courseType === 'primer' ? 'text-indigo-700' : 'text-gray-700'
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    courseType === 'primer' ? 'bg-indigo-100' : 'bg-gray-100'
                  }`}>
                    🚀
                  </div>
                  <span className="font-medium text-sm">Quick Primer</span>
                </div>
                <p className="text-xs text-gray-600 pl-8">A high-level crash course covering key concepts</p>
              </button>
              
              <button
                type="button"
                onClick={() => setCourseType('fullCourse')}
                className={`p-3 rounded-lg text-left transition-all border ${
                  courseType === 'fullCourse'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`flex items-center gap-2 mb-1 ${
                  courseType === 'fullCourse' ? 'text-indigo-700' : 'text-gray-700'
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    courseType === 'fullCourse' ? 'bg-indigo-100' : 'bg-gray-100'
                  }`}>
                    🎓
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-sm">Full Course</span>
                    {/* Updated Premium badge for Full Course */}
                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs rounded-full border border-emerald-200">
                      <Award className="w-3 h-3 text-emerald-600" />
                      <span className="font-semibold tracking-wide">PRO</span>
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 pl-8">A comprehensive curriculum with detailed lessons</p>
              </button>
            </div>
          </div>
          
          {/* Premium Access Banner - More compact */}
          {user && !hasPremium && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-100">
              <div className="flex items-start gap-2.5">
                <div className="bg-indigo-100 p-1.5 rounded-full text-indigo-600 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-indigo-800 text-sm mb-0.5">
                    {isOnTrial ? 'You\'re on a free trial' : 'Upgrade to Pro'}
                  </h3>
                  <p className="text-xs text-indigo-700 mb-2">
                    {isOnTrial 
                      ? 'You can create one Primer course with your trial. Full Courses require pro.' 
                      : 'Get unlimited course generation and pro features'}
                  </p>
                  {!hasAccess && (
                    <a
                      href={POLAR_SUBSCRIPTION_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Upgrade now</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Generate Button - Smaller but still prominent */}
          <div>
            <button
              type="submit"
              disabled={!topic || isLoading}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating your course...</span>
                </>
              ) : !user ? (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Sign In to Create</span>
                </>
              ) : !hasAccess ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Upgrade to Pro</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4" />
                  <span>Create My Course</span>
                </>
              )}
            </button>
          </div>
          
          {/* Info text - Smaller */}
          {user && hasAccess && (
            <p className="text-center text-xs text-gray-500">
              Your personalized course will be ready in seconds
            </p>
          )}
        </form>
        
        {/* Error & Success Messages - Keep these the same size for readability */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {syllabusUrl && (
          <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-green-800">
                Your {courseType === 'primer' ? 'primer' : 'course'} on {successTopic} is ready!
              </h3>
            </div>
            <a
              href={syllabusUrl}
              className="block w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center font-medium"
            >
              View Your Course
            </a>
          </div>
        )}
      </div>

      {/* Popular Topics - Clean grid layout */}
      <div className="mb-16">
        <h2 className="text-xl font-medium text-gray-900 mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          <span>Popular Topics to Explore</span>
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {Object.entries(TOPIC_CATEGORIES).flatMap(([category, topics]) => 
            topics.slice(0, 1).map(topic => (
              <button
                key={topic}
                onClick={() => handleTopicSelect(topic)}
                className="group p-4 text-left rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all duration-200"
              >
                <p className="text-xs text-indigo-600 mb-1 uppercase tracking-wider font-medium">{category}</p>
                <h3 className="text-gray-900 group-hover:text-indigo-700 transition-colors font-medium">{topic}</h3>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Featured Courses - Enhanced card design */}
      {/* Featured Courses - Enhanced card design with actual images */}
<div className="mb-8">
  <h2 className="text-xl font-medium text-gray-900 mb-6 flex items-center gap-2">
    <BookOpen className="w-5 h-5 text-indigo-600" />
    <span>Featured Courses</span>
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
    {[
      {
        title: "🏠 DIY A-Frame Constructions",
        description: "Learn how to design and build your own A-frame structure, from planning to final touches.",
        href: "/syllabus/142da292-c1b8-4f18-84cd-e0fe9790793b",
        img: "https://images.unsplash.com/photo-1573812331441-d99117496acb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2OTM2NzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MzYxMDU4NTN8&ixlib=rb-4.0.3&q=80&w=1080",
        category: "Home Building"
      },
      {
        title: "💰 Wealth Management - Primer",
        description: "A focused introduction to get you started quickly with wealth management.",
        href: "/syllabus/d333a703-87a9-4387-83a5-a1a82c1b168c",
        img: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2OTM2NzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MzYxMDU4NTN8&ixlib=rb-4.0.3&q=80&w=1080",
        category: "Finance"
      },
      {
        title: "🌱 Microgreens Garden",
        description: "Everything from fundamentals to advanced techniques for growing microgreens.",
        href: "/syllabus/eb470a51-d8db-45fd-baa4-252214750b29",
        img: "https://images.unsplash.com/photo-1702351253307-e6f8a3f308ff?q=80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2OTM2NzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MzYxMDU4NTN8&ixlib=rb-4.0.3&q=80&w=1080",
        category: "Gardening"
      }
    ].map((feature) => (
      <a
        key={feature.title}
        href={feature.href}
        className="group block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
      >
        <div className="h-32 relative overflow-hidden">
          <Image 
            src={feature.img} 
            alt={feature.title}
            width={100}
            height={100}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
          <div className="absolute bottom-3 left-4">
            <span className="px-3 py-1 bg-white/90 rounded-full text-xs font-medium text-indigo-700">
              {feature.category}
            </span>
          </div>
        </div>
        <div className="p-5">
          <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-700 transition-colors mb-2">{feature.title}</h3>
          <p className="text-gray-600 text-sm">{feature.description}</p>
        </div>
      </a>
    ))}
  </div>
</div>
      {/* Premium Upsell Dialog */}
      <UpsellDialog 
        isOpen={showUpsell} 
        onClose={() => setShowUpsell(false)} 
        storeUrl={POLAR_SUBSCRIPTION_URL} 
      />
    </div>
  );
}