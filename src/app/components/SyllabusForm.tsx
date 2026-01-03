'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Loader2, BookOpen, Search, TrendingUp, Zap, CheckCircle, AlertCircle, Sparkles, Award } from 'lucide-react';
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
  const { user, hasAccess, hasPremium } = useAuth();
  const [topic, setTopic] = useState('');
  const [courseType, setCourseType] = useState<CourseType>('primer');
  const [successTopic, setSuccessTopic] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syllabusUrl, setSyllabusUrl] = useState<string | null>(null);
  const [coursesGenerated, setCoursesGenerated] = useState<number | null>(null);
  const topicInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Upsell dialog state
  const [showUpsell, setShowUpsell] = useState(false);
  // const [lastTypedTime, setLastTypedTime] = useState<number>(0);

  // Polar subscription URL
  const POLAR_SUBSCRIPTION_URL = 'https://buy.polar.sh/polar_cl_fDrvRuLYXy3EkHVwSktBlPzLCCEPeFqr4ai5D0sdvVo';


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
        setCoursesGenerated(count ? count + 112 : 112);
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

    // ==========================================
    // PAYMENT FUNCTIONALITY DISABLED - FREE SITE
    // Uncomment these blocks to restore subscription checks
    // ==========================================
    /*
    // Check if user can generate the selected course type
    if (!hasAccess) {
      // If they can't generate the selected course, show the upsell dialog instead of redirecting
      setShowUpsell(true);
      return;
    }
    
    // Check if user is trying to generate a Full Course without Pro subscription
    if (courseType === 'fullCourse' && !hasPremium) {
      // Show upsell dialog for non-Pro users trying to access Full Course
      setShowUpsell(true);
      return;
    }
    */

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
        // PAYMENT FUNCTIONALITY DISABLED - Uncomment to restore subscription error
        // if (response.status === 403) {
        //   setError("You need an active subscription to generate more courses");
        //   return;
        // }
        throw new Error('Failed to generate syllabus');
      }

      const data = await response.json();
      console.log('API response:', data);
      if (!data.slug) {
        console.error('No slug found in API response:', data);
        setError('Failed to generate syllabus: Invalid response from server');
        return;
      }
      setSyllabusUrl(`/syllabus/${data.slug}`);
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
    // Removed dropdown trigger
  };

  // Re-add the handleTopicSelect function
  const handleTopicSelect = (suggestedTopic: string) => {
    setTopic(suggestedTopic);
    // Focus on input after selection for a better UX
    if (topicInputRef.current) {
      topicInputRef.current.focus();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4">
      {/* Hero Section - Editorial Style */}
      <div className="text-center mb-10 md:mb-14">
        <div className="inline-flex items-center justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/20 blur-[40px] rounded-full"></div>
            <Image
              src="/logo_trans.png"
              alt="Logo"
              width={112}
              height={112}
              className="w-20 h-20 md:w-24 md:h-24 relative drop-shadow-2xl"
              priority
            />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-serif text-gray-900 mb-6 leading-[0.9] tracking-tight">
          <span className="block text-gray-800">Unlock your</span>
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent italic pr-2">
            curiosity
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8 font-light leading-relaxed">
          Turn your interests into expertise with <span className="font-medium text-gray-900">handcrafted learning journeys</span> that fit your style.
        </p>

        {/* Social proof banner */}
        {coursesGenerated && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-indigo-900/80 text-sm mb-4 animate-fade-in-up delay-100">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span className="font-medium">{coursesGenerated.toLocaleString()} courses created</span>
          </div>
        )}
      </div>

      {/* Course Creator Card - Premium Glass */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 mb-12 relative overflow-hidden transition-all duration-500 hover:shadow-2xl border-white/50">
        {/* Premium badge for subscribers */}
        {hasPremium && (
          <div className="absolute top-4 right-4 z-10">
            <div className="flex items-center gap-1.5 py-1 px-3 bg-emerald-100/80 backdrop-blur-sm text-emerald-800 rounded-full shadow-sm border border-emerald-200/50">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-bold tracking-wide">PRO MEMBER</span>
            </div>
          </div>
        )}

        <h2 className="text-base md:text-lg font-medium text-gray-900 mb-3">Craft your personalized course</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Topic Input - Command Center Style */}
          <div className="mb-6">
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2 ml-1">What sparks your curiosity today?</label>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                id="topic"
                ref={topicInputRef}
                type="text"
                value={topic}
                onChange={handleTopicChange}
                placeholder="Japanese cooking, urban sketching, crypto basics..."
                className="w-full pl-12 pr-10 py-4 text-lg bg-white/70 backdrop-blur-xl rounded-xl border-2 border-transparent focus:border-indigo-500/30 focus:bg-white/90 shadow-sm focus:shadow-lg focus:ring-0 transition-all placeholder:text-gray-400 text-gray-900 relative z-10"
                disabled={isLoading}
              />
              {topic && !isLoading && (
                <button
                  type="button"
                  onClick={() => setTopic('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-20 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Course Type Selection - More compact */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">How deep do you want to dive?</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCourseType('primer')}
                className={`p-2.5 rounded-lg text-left transition-all border ${courseType === 'primer'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className={`flex items-center gap-2 ${courseType === 'primer' ? 'text-indigo-700' : 'text-gray-700'
                  }`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${courseType === 'primer' ? 'bg-indigo-100' : 'bg-gray-100'
                    }`}>
                    🚀
                  </div>
                  <span className="font-medium text-xs">Quick Primer</span>
                </div>
                <p className="text-xs text-gray-600 pl-7 mt-0.5">Weekend warrior edition - the essentials in a flash</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  // PAYMENT FUNCTIONALITY DISABLED - Everyone can select Full Course
                  setCourseType('fullCourse');

                  // Uncomment to restore premium restriction:
                  /*
                  // Only allow Pro users to select Full Course
                  if (hasPremium) {
                    setCourseType('fullCourse');
                  } else {
                    // Show upsell dialog for non-Pro users
                    setShowUpsell(true);
                    // Keep the primer selected
                    setCourseType('primer');
                  }
                  */
                }}
                className={`p-2.5 rounded-lg text-left transition-all border ${courseType === 'fullCourse'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
                  // PAYMENT DISABLED - Removed opacity/cursor-not-allowed for non-premium
                  // Original: : hasPremium ? 'border-gray-200 hover:border-gray-300' : 'border-gray-200 opacity-80 cursor-not-allowed'
                  }`}
              >
                <div className={`flex items-center gap-2 ${courseType === 'fullCourse' ? 'text-indigo-700' : 'text-gray-700'
                  }`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${courseType === 'fullCourse' ? 'bg-indigo-100' : 'bg-gray-100'
                    }`}>
                    🎓
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-xs">Full Course</span>
                    {/* Updated Premium badge for Full Course */}
                    <span className="flex items-center gap-0.5 px-1 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] rounded-full border border-emerald-200">
                      <Award className="w-2.5 h-2.5 text-emerald-600" />
                      <span className="font-semibold tracking-wide">PRO</span>
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 pl-7 mt-0.5">Master class edition - from novice to knowledgeable</p>

              </button>
            </div>
          </div>

          {/* Generate Button - Big and Bold */}
          <div>
            <button
              type="submit"
              disabled={!topic || isLoading}
              className="w-full py-4 bg-gray-900 text-white rounded-xl hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-base font-medium shadow-lg hover:shadow-xl hover:scale-[1.01]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Crafting your perfect course...</span>
                </>
              ) : !user ? (
                <>
                  <Zap className="w-5 h-5" />
                  <span>Sign In to Create</span>
                </>
              ) : !hasAccess ? (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Unlock Premium Learning</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-5 h-5" />
                  <span>Start Learning Journey</span>
                </>
              )}
            </button>
          </div>

          {/* Info text - Smaller */}
          {user && hasAccess && (
            <p className="text-center text-[11px] text-gray-500">
              Your tailor-made curriculum is just moments away
            </p>
          )}
        </form>

        {/* Error & Success Messages */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {syllabusUrl && (
          <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <h3 className="font-medium text-green-800 text-sm">
                  Your {courseType === 'primer' ? 'primer' : 'course'} on {successTopic} is ready to explore!
                </h3>
              </div>
              <a
                href={syllabusUrl}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(syllabusUrl);
                }}
                className="px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-center font-medium text-xs whitespace-nowrap"
              >
                Start Learning
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Popular Topics - Clean grid layout */}
      <div className="mb-16">
        <h2 className="text-2xl font-serif text-gray-900 mb-8 flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span>Hot Topics Right Now</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(TOPIC_CATEGORIES).flatMap(([category, topics]) =>
            topics.slice(0, 1).map(topic => (
              <button
                key={topic}
                onClick={() => handleTopicSelect(topic)}
                className="group p-5 text-left rounded-xl glass-card hover:bg-white/80 hover:-translate-y-1 hover:border-indigo-200/50"
              >
                <p className="text-[10px] font-bold text-indigo-500 mb-2 uppercase tracking-widest">{category}</p>
                <h3 className="text-gray-900 text-lg font-medium group-hover:text-indigo-700 transition-colors leading-tight">{topic}</h3>
              </button>
            ))
          )}
        </div>
      </div>
      {/* Featured Courses - Enhanced card design */}
      <div className="mb-8">
        <h2 className="text-2xl font-serif text-gray-900 mb-8 flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <span>Staff Picks & Community Favorites</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "DIY A-Frame Constructions",
              description: "Master the art of building your dream A-frame retreat, from blueprint to final nail.",
              href: "/syllabus/142da292-c1b8-4f18-84cd-e0fe9790793b",
              img: "https://images.unsplash.com/photo-1573812331441-d99117496acb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2OTM2NzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MzYxMDU4NTN8&ixlib=rb-4.0.3&q=80&w=1080",
              category: "Home Building"
            },
            {
              title: "Wealth Management",
              description: "Navigate the world of personal finance with insider strategies for building lasting wealth.",
              href: "/syllabus/d333a703-87a9-4387-83a5-a1a82c1b168c",
              img: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2OTM2NzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MzYxMDU4NTN8&ixlib=rb-4.0.3&q=80&w=1080",
              category: "Finance"
            },
            {
              title: "Microgreens Garden",
              description: "Transform your windowsill into a flourishing microgreen oasis — from seed to harvest.",
              href: "/syllabus/eb470a51-d8db-45fd-baa4-252214750b29",
              img: "https://images.unsplash.com/photo-1702351253307-e6f8a3f308ff?q=80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2OTM2NzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MzYxMDU4NTN8&ixlib=rb-4.0.3&q=80&w=1080",
              category: "Gardening"
            }
          ].map((feature) => (
            <a
              key={feature.title}
              href={feature.href}
              className="group block glass-card rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="h-48 relative overflow-hidden">
                <Image
                  src={feature.img}
                  alt={feature.title}
                  width={400}
                  height={300}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold text-white mb-2 uppercase tracking-wide border border-white/30">
                    {feature.category}
                  </span>
                  <h3 className="text-xl font-serif text-white font-medium drop-shadow-md">{feature.title}</h3>
                </div>
              </div>
              <div className="p-5">
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                <div className="mt-4 flex items-center text-indigo-600 text-sm font-medium opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <span>Explore Course</span>
                  <BookOpen className="w-4 h-4 ml-2" />
                </div>
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