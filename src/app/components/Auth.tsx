'use client';

import { useState, useEffect } from 'react';
import { Loader2, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const { isAuthenticated, isLoading, signIn } = useAuth();
  const router = useRouter();
  
  // Check for redirect path in sessionStorage
  useEffect(() => {
    // Only run on client
    if (typeof window !== 'undefined') {
      const storedRedirect = sessionStorage.getItem('redirectAfterLogin');
      if (storedRedirect) {
        setRedirectPath(storedRedirect);
      }
    }
  }, []);
  
  // Redirect authenticated users
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Allow success message to be seen briefly before redirecting
      const redirectTimer = setTimeout(() => {
        if (redirectPath) {
          // Clear the stored redirect path
          sessionStorage.removeItem('redirectAfterLogin');
          router.push(redirectPath);
        } else {
          router.push('/dashboard');
        }
      }, message?.type === 'success' ? 1500 : 0);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [isAuthenticated, isLoading, router, redirectPath, message]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;
    
    setMessage(null);
    
    try {
      const result = await signIn(email);
      
      setMessage({
        text: result.message,
        type: result.success ? 'success' : 'error'
      });
    } catch (error: unknown) {
      setMessage({
        text: 'An unexpected error occurred. Please try again.',
        type: 'error'
      });
      console.error('Sign in error:', error);
    }
  };

  return (
    <div className="fixed top-[64px] left-0 right-0 bottom-0 z-20 flex items-center justify-center overflow-hidden">
      {/* Background Image - positioned to cover the entire viewport including behind the nav */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/grass-l.png"
          alt="Peaceful landscape"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-sky-600/20 to-emerald-900/85"></div>
      </div>
      
      <div className="max-w-md w-full mx-auto relative z-10 p-6">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-white/20">
          <div className="h-3 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-300"></div>
          
          <div className="p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-emerald-200 to-sky-200 p-3 rounded-full">
                <Sparkles className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold mb-2 text-center text-emerald-900">Welcome to PrimerAI</h2>
            <p className="text-center text-emerald-700 mb-6">Sign in to start learning</p>
            
            {redirectPath && (
              <div className="mb-4 bg-sky-50 border border-sky-100 rounded-lg p-3 text-sm text-sky-700">
                You&apos;ll be redirected back after signing in
              </div>
            )}
            
            {isLoading ? (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-4" />
                <p className="text-emerald-700">Verifying your account...</p>
              </div>
            ) : (
              <form onSubmit={handleSignIn}>
                <div className="mb-5">
                  <label htmlFor="email" className="block text-sm font-medium text-emerald-800 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full pl-11 pr-4 py-2.5 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 bg-white"
                      required
                    />
                  </div>
                </div>
                
                {message && (
                  <div className={`mb-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                    {message.text}
                  </div>
                )}
                
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 flex items-center justify-center gap-2"
                >
                  <span>Send Magic Link</span>
                </button>
              </form>
            )}
            
            <div className="mt-6 pt-6 border-t border-emerald-100">
              <p className="text-xs text-emerald-600 text-center">
                By signing in, you agree to our Terms and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}