'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase/client';
import { DbSyllabus } from '../types/database';
import { Loader2, BookOpen, PlusCircle, Zap } from 'lucide-react';
import Link from 'next/link';

// Polar subscription URL
const POLAR_SUBSCRIPTION_URL = 'https://buy.polar.sh/polar_cl_fDrvRuLYXy3EkHVwSktBlPzLCCEPeFqr4ai5D0sdvVo';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userSyllabi, setUserSyllabi] = useState<DbSyllabus[]>([]);
  const [loadingSyllabi, setLoadingSyllabi] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch user syllabi when user is available
  useEffect(() => {
    if (!user) return;
    
    const fetchSyllabi = async () => {
      try {
        setLoadingSyllabi(true);
        
        const { data, error } = await supabase
          .from('syllabi')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching syllabi:', error);
          return;
        }
        
        setUserSyllabi(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoadingSyllabi(false);
      }
    };

    fetchSyllabi();
  }, [user]);

  // Show loading state
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl p-6">
      {/* Subscription Upsell Banner */}
      <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl p-4 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-lg font-semibold text-indigo-800">Upgrade to Premium</h2>
            <p className="text-sm text-indigo-700">Get unlimited course generations and more features</p>
          </div>
          <a 
            href={POLAR_SUBSCRIPTION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-all"
          >
            <Zap size={16} />
            <span>Subscribe Now</span>
          </a>
        </div>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Your Courses</h1>
        <Link
          href="/syllabus/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
        >
          <PlusCircle size={16} />
          <span>Create Course</span>
        </Link>
      </div>

      {loadingSyllabi ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : userSyllabi.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-indigo-500" />
          </div>
          <h2 className="text-xl font-medium mb-2">No courses yet</h2>
          <p className="text-gray-500 mb-2">Create your first course to get started</p>
          <p className="text-indigo-600 text-sm mb-6">You have one free course generation with your trial</p>
          <Link
            href="/syllabus/new"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 hover:bg-indigo-700"
          >
            <PlusCircle size={16} />
            <span>Create Your First Course</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userSyllabi.map((syllabus) => (
            <Link 
              key={syllabus.id} 
              href={`/syllabus/${syllabus.id}`}
              className="bg-white rounded-xl shadow p-5 transition-all hover:shadow-md"
            >
              <h3 className="text-lg font-medium mb-2">{syllabus.title}</h3>
              <p className="text-gray-500 line-clamp-2 mb-3">
                {syllabus.description || 'No description available'}
              </p>
              <div className="text-xs text-gray-400">
                {new Date(syllabus.created_at).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 