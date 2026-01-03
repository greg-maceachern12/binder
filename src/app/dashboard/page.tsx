"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase/client";
import { DbSyllabus } from "../types/database";
import { Loader2, BookOpen, PlusCircle, Zap, Sparkles } from "lucide-react";
import Link from "next/link";
import UpsellDialog from "../components/UpsellDialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

// Polar subscription URL
const POLAR_SUBSCRIPTION_URL =
  "https://buy.polar.sh/polar_cl_fDrvRuLYXy3EkHVwSktBlPzLCCEPeFqr4ai5D0sdvVo";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const [userSyllabi, setUserSyllabi] = useState<DbSyllabus[]>([]);
  const [loadingSyllabi, setLoadingSyllabi] = useState(true);
  const [showUpsell, setShowUpsell] = useState(false);
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      // Store the current path to redirect back after login
      sessionStorage.setItem('redirectAfterLogin', '/dashboard');
      router.push('/login');
    }
  }, [user, isLoading, router]);

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

  // If still loading auth state, show loading spinner
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not authenticated, don't render anything (redirect will happen from useEffect)
  if (!user) {
    return null;
  }

  const DashboardContent = () => (

    <main className="min-h-[calc(100vh-56px)] overflow-hidden">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-400/20 blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-pink-400/20 blur-[100px] animate-pulse delay-1000"></div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto px-4 py-6 md:py-8 w-full">
        {/* ==========================================
            PAYMENT FUNCTIONALITY DISABLED - FREE SITE
            Subscription Banners Hidden
            Uncomment this block to restore subscription status banners
            ========================================== */}
        {/* {subscriptionStatus === "inactive" && (
          <Alert variant="default" className="mb-6 bg-gradient-to-r from-amber-50/40 to-orange-50/40 border-l-4 border-l-amber-400 border-y border-r border-amber-200/40 text-amber-800 transition-all hover:from-amber-50/50 hover:to-orange-50/50">
             <div className="flex items-center justify-between w-full">
               <div className="flex items-center gap-2.5">
                 <div className="relative">
                   <div className="absolute inset-0 animate-ping rounded-full bg-amber-400/20"></div>
                   <Zap className="h-4 w-4 text-amber-500 relative animate-pulse" />
                 </div>
                 <span className="font-medium tracking-tight">Your trial has ended</span>
               </div>
               <Button 
                 variant="default" 
                 size="sm" 
                 onClick={() => setShowUpsell(true)} 
                 className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm transition-all duration-300 hover:shadow"
               >
                  Subscribe
               </Button>
             </div>
          </Alert>
        )}

        {subscriptionStatus === "trial" && (
          <Alert variant="default" className="mb-6 bg-gradient-to-r from-purple-50/40 via-fuchsia-50/30 to-purple-50/40 border-l-4 border-l-purple-400 border-y border-r border-purple-200/40 text-purple-800 transition-all hover:from-purple-50/50 hover:to-fuchsia-50/50">
             <div className="flex items-center justify-between w-full">
               <div className="flex items-center gap-2.5">
                 <div className="relative">
                   <Sparkles className="h-4 w-4 text-purple-500 relative animate-pulse" />
                 </div>
                 <span className="font-medium tracking-tight">Free trial active</span>
               </div>
               <Button 
                 variant="outline" 
                 size="sm" 
                 onClick={() => setShowUpsell(true)} 
                 className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800 transition-all duration-300"
               >
                  Upgrade
               </Button>
             </div>
          </Alert>
        )}

        {subscriptionStatus === "active" && (
          <Alert variant="default" className="mb-6 bg-gradient-to-r from-emerald-50/40 via-teal-50/30 to-emerald-50/40 border-l-4 border-l-emerald-400 border-y border-r border-emerald-200/40 text-emerald-800 transition-all hover:from-emerald-50/50 hover:to-teal-50/50">
             <div className="flex items-center gap-2.5">
               <div className="relative">
                 <Award className="h-4 w-4 text-emerald-500 relative animate-pulse" />
               </div>
               <span className="font-medium tracking-tight">Pro subscription active</span>
             </div>
          </Alert>
        )} */}

        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-2">
              My Courses
            </h1>
            <p className="text-gray-600 text-lg font-light">
              {userSyllabi.length > 0
                ? "Continue your learning journey."
                : "Start your first journey today."}
            </p>
          </div>

          <Button
            asChild
            size="lg"
            className="mt-4 md:mt-0 rounded-full bg-gray-900 hover:bg-black px-6 shadow-lg hover:shadow-xl transition-all"
          >
            <Link href="/" aria-label="Create New Course">
              <PlusCircle className="w-5 h-5 mr-2" />
              <span>New Course</span>
            </Link>
          </Button>
        </div>

        {loadingSyllabi ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : userSyllabi.length === 0 ? (
          <div className="glass-panel text-center py-16 rounded-3xl border-dashed border-2 border-indigo-200/50">
            <div className="w-20 h-20 rounded-full bg-indigo-50 text-indigo-500 mx-auto mb-6 flex items-center justify-center animate-pulse">
              <BookOpen className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-serif text-gray-900 mb-3">Your library is empty</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              The world is full of fascinating things to learn. Create your first AI-generated course now.
            </p>
            <Button
              asChild
              variant="outline"
              className="border-indigo-200 hover:bg-indigo-50 text-indigo-700"
            >
              <Link href="/">Create Course</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userSyllabi.map((syllabus, index) => (
              <Link
                key={syllabus.id}
                href={`/syllabus/${syllabus.id}`}
                className="block group"
              >
                <div
                  className="h-full glass-card rounded-2xl p-6 flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>

                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-white/50 rounded-full text-[10px] font-bold tracking-widest text-indigo-600 uppercase">
                      COURSE
                    </span>
                  </div>

                  <h3 className="text-2xl font-serif text-gray-900 mb-3 leading-tight group-hover:text-indigo-700 transition-colors">
                    {syllabus.title}
                  </h3>

                  <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-grow">
                    {syllabus.description}
                  </p>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-medium text-gray-400">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {syllabus.difficulty_level}
                    </span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {syllabus.estimated_duration}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <UpsellDialog
        isOpen={showUpsell}
        onClose={() => setShowUpsell(false)}
        storeUrl={POLAR_SUBSCRIPTION_URL}
      />
    </main>
  );

  return <DashboardContent />;
}
