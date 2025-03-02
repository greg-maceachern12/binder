'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase/client';
import { DbSyllabus } from '../types/database';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [userSyllabi, setUserSyllabi] = useState<DbSyllabus[]>([]);
  const [loadingSyllabi, setLoadingSyllabi] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchUserSyllabi = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('syllabi')
          .select('*')
          .eq('user_id', user.id);
          
        if (error) throw error;
        setUserSyllabi(data || []);
      } catch (error) {
        console.error('Error fetching user syllabi:', error);
      } finally {
        setLoadingSyllabi(false);
      }
    };

    fetchUserSyllabi();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Your Dashboard</h1>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
          <p className="text-gray-600">Welcome back, {user?.email}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Your Courses</h2>
          
          {loadingSyllabi ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            </div>
          ) : userSyllabi.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userSyllabi.map((syllabus) => (
                <a
                  key={syllabus.id}
                  href={`/syllabus/${syllabus.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all"
                >
                  <h3 className="font-medium text-lg mb-2">{syllabus.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{syllabus.description}</p>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>You haven't created any courses yet.</p>
              <button
                onClick={() => router.push('/')}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create Your First Course
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 