'use client';

import { useState, useEffect } from 'react';
import { Loader2, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';


export default function Auth() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const { user, loading, signIn } = useAuth();
  const router = useRouter();
  
  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;
    
    const result = await signIn(email);
    
    setMessage({
      text: result.message,
      type: result.success ? 'success' : 'error'
    });
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Decorative top gradient bar */}
      <div className="h-3 bg-gradient-to-r from-pink-400 via-purple-500 to-pink-300"></div>
      
      <div className="p-8">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-gradient-to-r from-pink-200 to-purple-200 p-3 rounded-full">
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">Welcome to PrimerAI</h2>
        <p className="text-center text-gray-500 mb-6">Sign in to start learning</p>
        
        {/* Trial Info */}
        {/* <div className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-100">
          <h3 className="text-sm font-semibold text-purple-700 mb-1">Free Trial + Premium Option</h3>
          <p className="text-xs text-gray-600 mb-2">
            New users get one free course generation. Subscribe for unlimited access.
          </p>
          <a 
            href={POLAR_SUBSCRIPTION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800"
          >
            <Zap className="w-3 h-3" /> View subscription options
          </a>
        </div> */}
        
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
                disabled={loading}
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
            disabled={loading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <span>Send Magic Link</span>
            )}
          </button>
        </form>
        
        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            By signing in, you agree to our Terms and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}