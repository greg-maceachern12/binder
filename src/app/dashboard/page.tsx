"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase/client";
import { DbSyllabus } from "../types/database";
import { Loader2, BookOpen, PlusCircle, Zap, Award, Sparkles } from "lucide-react";
import Link from "next/link";
import UpsellDialog from "../components/UpsellDialog";

// Polar subscription URL
const POLAR_SUBSCRIPTION_URL =
  "https://buy.polar.sh/polar_cl_fDrvRuLYXy3EkHVwSktBlPzLCCEPeFqr4ai5D0sdvVo";
  
export default function Dashboard() {
  // Get the user and subscription status directly from AuthContext
  const { user, subscriptionStatus } = useAuth();
  const [userSyllabi, setUserSyllabi] = useState<DbSyllabus[]>([]);
  const [loadingSyllabi, setLoadingSyllabi] = useState(true);
  const [showUpsell, setShowUpsell] = useState(false);

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
    <main className="h-[calc(100vh-56px)] flex flex-col relative">
      {/* Background image with overlay */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("/beach.png")' }}></div>
        <div className="absolute inset-0 bg-slate-900/75 backdrop-blur-[1px]"></div>
      </div>
      
      <div className="flex-1 max-w-6xl mx-auto px-4 py-6 md:py-8 relative z-10 w-full overflow-y-auto">
        {/* Subscription Status Banner - More compact and elegant */}
        {subscriptionStatus === "inactive" && (
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-md border border-white/20 p-3.5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="bg-amber-100 p-1.5 rounded-full text-amber-600 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 text-sm">
                  Your trial has ended
                </h3>
                <p className="text-gray-500 text-xs">
                  Subscribe to continue generating courses
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowUpsell(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 text-xs font-medium whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Subscribe Now</span>
            </button>
          </div>
        )}

        {subscriptionStatus === "trial" && (
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-md border border-purple-200/30 p-3.5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="bg-purple-100 p-1.5 rounded-full text-purple-600 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 text-sm">Free trial active</h3>
                <p className="text-gray-500 text-xs">
                  You can generate one full course for free
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowUpsell(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 border border-purple-200 text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 hover:border-purple-300 text-xs font-medium whitespace-nowrap"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Upgrade to Premium</span>
            </button>
          </div>
        )}

        {subscriptionStatus === "active" && (
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-md border border-emerald-200/30 p-3.5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="bg-emerald-100 p-1.5 rounded-full text-emerald-600 mt-0.5">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 text-sm">
                  Pro subscription active
                </h3>
                <p className="text-gray-500 text-xs">
                  You have unlimited access to all features
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Integrated header with course creation button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-5">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
              My Courses
            </h1>
            <p className="text-blue-100 text-sm">
              {userSyllabi.length > 0
                ? "Select a course to continue or create a new one"
                : "Create your first course to get started"}
            </p>
          </div>
          
          <Link
            href="/"
            className="mt-3 md:mt-0 inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm hover:shadow"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Course</span>
          </Link>
        </div>

        {/* Courses Grid / List - More compact */}
        {loadingSyllabi ? (
          <div className="flex items-center justify-center min-h-[180px]">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
          </div>
        ) : userSyllabi.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-md border border-white/20 py-10 text-center">
            <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-600 mx-auto mb-3 flex items-center justify-center">
              <BookOpen className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-medium text-gray-800 mb-1.5">
              No courses yet
            </h2>
            <p className="text-gray-500 text-sm mb-5 max-w-md mx-auto">
              Create your first AI-generated course by clicking the button above
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userSyllabi.map((syllabus) => (
              <Link
                key={syllabus.id}
                href={`/syllabus/${syllabus.id}`}
                className="bg-white/90 backdrop-blur-md rounded-xl shadow-md overflow-hidden border border-white/20 hover:border-indigo-200 hover:shadow-lg transition-all flex flex-col h-full group"
              >
                <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-5">
                  <h3 className="text-lg font-medium text-gray-900 mb-1.5 group-hover:text-indigo-700 transition-colors">
                    {syllabus.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {syllabus.description}
                  </p>
                </div>
                <div className="p-3.5 border-t border-gray-100 mt-auto">
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Difficulty: {syllabus.difficulty_level}</span>
                    <span>{syllabus.estimated_duration}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Premium Upsell Dialog */}
      <UpsellDialog 
        isOpen={showUpsell} 
        onClose={() => setShowUpsell(false)} 
        storeUrl={POLAR_SUBSCRIPTION_URL} 
      />
    </main>
  );

  // Wrap the dashboard content with the ProtectedRoute component
  return <DashboardContent />;
}
