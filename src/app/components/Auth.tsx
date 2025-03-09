'use client';

import { useState, useEffect } from 'react';
import { Loader2, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

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
    <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="h-3 bg-gradient-to-r from-pink-400 via-purple-500 to-pink-300"></div>
      
      <div className="p-8">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-gradient-to-r from-pink-200 to-purple-200 p-3 rounded-full">
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">Welcome to PrimerAI</h2>
        <p className="text-center text-gray-500 mb-6">Sign in to start learning</p>
        
        {redirectPath && (
          <div className="mb-4 bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700">
            You&apos;ll be redirected back after signing in
          </div>
        )}
        
        {isLoading ? (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-600">Verifying your account...</p>
          </div>
        ) : (
          <form onSubmit={handleSignIn}>
            <div className="mb-5">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-400 bg-gray-50"
                  required
                />
              </div>
            </div>
            
            {message && (
              <div className={`mb-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                {message.text}
              </div>
            )}
            
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 flex items-center justify-center gap-2"
            >
              <span>Send Magic Link</span>
            </button>
          </form>
        )}
        
        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            By signing in, you agree to our Terms and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}