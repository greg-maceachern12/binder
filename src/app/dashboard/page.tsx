"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase/client";
import { DbSyllabus } from "../types/database";
import { Loader2, BookOpen, PlusCircle, Zap, Award } from "lucide-react";
import Link from "next/link";

// Polar subscription URL
const POLAR_SUBSCRIPTION_URL =
  "https://buy.polar.sh/polar_cl_fDrvRuLYXy3EkHVwSktBlPzLCCEPeFqr4ai5D0sdvVo";

export default function Dashboard() {
  // Get the user and subscription status directly from AuthContext
  const { user, subscriptionStatus } = useAuth();
  const [userSyllabi, setUserSyllabi] = useState<DbSyllabus[]>([]);
  const [loadingSyllabi, setLoadingSyllabi] = useState(true);

  // No need to determine subscription status manually - use the one from AuthContext
  // const subscriptionStatus = user?.has_subscription
  //   ? "active"
  //   : user?.trial_active
  //   ? "trialing"
  //   : "inactive";

  // Fetch user syllabi when user is available

  useEffect(() => {
    if (!user) return;

    const fetchSyllabi = async () => {
      try {
        setLoadingSyllabi(true);

        const { data, error } = await supabase
          .from("syllabi")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching syllabi:", error);
          return;
        }

        setUserSyllabi(data || []);
      } catch (error) {
        console.error("Failed to fetch syllabi:", error);
      } finally {
        setLoadingSyllabi(false);
      }
    };

    fetchSyllabi();
  }, [user]);

  // Main dashboard content that will be wrapped by ProtectedRoute
  const DashboardContent = () => (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
              My Courses
            </h1>
            <p className="text-gray-500">
              {userSyllabi.length > 0
                ? "Select a course to continue or create a new one"
                : "Create your first course to get started"}
            </p>
          </div>

          <div className="mt-4 md:mt-0">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Course</span>
            </Link>
          </div>
        </div>

        {/* Subscription Status Banner */}
        {subscriptionStatus === "inactive" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="bg-amber-100 p-2 rounded-full text-amber-600 mt-0.5">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  Your trial has ended
                </h3>
                <p className="text-gray-500 text-sm">
                  Subscribe to continue generating courses
                </p>
              </div>
            </div>
            <a
              href={POLAR_SUBSCRIPTION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 text-sm font-medium whitespace-nowrap"
            >
              Subscribe Now
            </a>
          </div>
        )}

        {subscriptionStatus === "trial" && (
          <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 p-2 rounded-full text-purple-600 mt-0.5">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Free trial active</h3>
                <p className="text-gray-500 text-sm">
                  You can generate one full course for free
                </p>
              </div>
            </div>
            <a
              href={POLAR_SUBSCRIPTION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-purple-200 text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 hover:border-purple-300 text-sm font-medium whitespace-nowrap"
            >
              Upgrade to Premium
            </a>
          </div>
        )}

        {subscriptionStatus === "active" && (
          <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="bg-emerald-100 p-2 rounded-full text-emerald-600 mt-0.5">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  Pro subscription active
                </h3>
                <p className="text-gray-500 text-sm">
                  You have unlimited access to all features
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Courses Grid / List */}
        {loadingSyllabi ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : userSyllabi.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mx-auto mb-4 flex items-center justify-center">
              <BookOpen className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-medium text-gray-800 mb-2">
              No courses yet
            </h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Create your first AI-generated course by clicking the button above
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userSyllabi.map((syllabus) => (
              <Link
                key={syllabus.id}
                href={`/syllabus/${syllabus.id}`}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all flex flex-col h-full"
              >
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6">
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    {syllabus.title}
                  </h3>
                  <p className="text-gray-600 line-clamp-2">
                    {syllabus.description}
                  </p>
                </div>
                <div className="p-4 border-t border-gray-100 mt-auto">
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Difficulty: {syllabus.difficulty_level}</span>
                    <span>{syllabus.estimated_duration}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );

  // Wrap the dashboard content with the ProtectedRoute component
  return <DashboardContent />;
}
