"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase/client";
import { DbSyllabus } from "../types/database";
import { Loader2, BookOpen, PlusCircle, Zap, Award, Sparkles, Terminal } from "lucide-react";
import Link from "next/link";
import UpsellDialog from "../components/UpsellDialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Polar subscription URL
const POLAR_SUBSCRIPTION_URL =
  "https://buy.polar.sh/polar_cl_fDrvRuLYXy3EkHVwSktBlPzLCCEPeFqr4ai5D0sdvVo";
  
export default function Dashboard() {
  const { user, subscriptionStatus } = useAuth();
  const [userSyllabi, setUserSyllabi] = useState<DbSyllabus[]>([]);
  const [loadingSyllabi, setLoadingSyllabi] = useState(true);
  const [showUpsell, setShowUpsell] = useState(false);

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

  const DashboardContent = () => (
    <main className="min-h-[calc(100vh-56px)] bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex flex-col">
      
      <div className="flex-1 max-w-6xl mx-auto px-4 py-6 md:py-8 w-full">
        {/* Refined Subscription Banners */}
        {subscriptionStatus === "inactive" && (
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
        )}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
              My Courses
            </h1>
            <p className="text-gray-600 text-sm">
              {userSyllabi.length > 0
                ? "Select a course to continue or create a new one."
                : "Create your first course to get started."}
            </p>
          </div>
          
          <Button 
            asChild 
            size="icon" 
            className="mt-3 md:mt-0 rounded-full bg-indigo-600 hover:bg-indigo-700 w-10 h-10"
          >
            <Link href="/" aria-label="Create New Course">
              <PlusCircle className="w-5 h-5" />
            </Link>
          </Button>
        </div>

        {loadingSyllabi ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : userSyllabi.length === 0 ? (
          <Card className="text-center py-10">
             <CardHeader>
                <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-600 mx-auto mb-3 flex items-center justify-center">
                   <BookOpen className="w-7 h-7" />
                </div>
               <CardTitle className="text-lg font-medium text-gray-800">No courses yet</CardTitle>
               <CardDescription className="text-gray-500">
                 Create your first AI-generated course using the button above.
               </CardDescription>
             </CardHeader>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userSyllabi.map((syllabus) => (
              <Link key={syllabus.id} href={`/syllabus/${syllabus.id}`} className="block">
                 <Card className="h-full flex flex-col hover:border-primary transition-colors group">
                    <CardHeader>
                       <CardTitle className="text-lg group-hover:text-primary transition-colors">
                         {syllabus.title}
                       </CardTitle>
                       <CardDescription className="line-clamp-3 h-[60px]">
                         {syllabus.description}
                       </CardDescription>
                    </CardHeader>
                    <CardFooter className="mt-auto border-t pt-4">
                       <div className="flex justify-between items-center text-xs text-muted-foreground w-full">
                         <span>Difficulty: {syllabus.difficulty_level}</span>
                         <span>{syllabus.estimated_duration}</span>
                       </div>
                    </CardFooter>
                 </Card>
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
