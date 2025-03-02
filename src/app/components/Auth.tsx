'use client';

import { useState } from 'react';
import { Loader2, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await signIn(email);
      if (error) throw error;
      setMessage('Check your email for the magic link!');
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send magic link';
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
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
        <p className="text-center text-gray-500 mb-6">Sign in with your email to continue</p>
        
        <form onSubmit={handleSignIn}>
          <div className="mb-5">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-200" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-400 bg-gray-50 transition-all duration-200"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading || !email}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all duration-200"
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
        
        {message && (
          <div className={`mt-5 p-4 rounded-lg ${
            message.includes('Check') 
              ? 'bg-gradient-to-r from-green-50 to-teal-50 text-green-700 border border-green-100' 
              : 'bg-gradient-to-r from-red-50 to-pink-50 text-red-600 border border-red-100'
          }`}>
            {message}
          </div>
        )}
        
        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            By signing in, you agree to our <a href="#" className="text-purple-600 hover:text-purple-800">Terms</a> and <a href="#" className="text-purple-600 hover:text-purple-800">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}