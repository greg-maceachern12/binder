'use client';

import { useEffect, useState } from 'react';
import Auth from '../components/Auth';

export default function LoginPage() {
  const [hasRedirect, setHasRedirect] = useState(false);
  
  // Check if there's a redirect path stored
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRedirect = sessionStorage.getItem('redirectAfterLogin');
      setHasRedirect(Boolean(storedRedirect));
    }
  }, []);
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-100 flex flex-col items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-pink-200 rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-200 rounded-full opacity-20 translate-x-1/3 translate-y-1/3 blur-3xl"></div>
      
      <div className="relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl text-indigo-700 mb-4 leading-tight">
            PrimerAI
          </h1>
          <p className="text-gray-600 mt-2">
            {hasRedirect ? 'Sign in to continue' : 'Learn anything'}
          </p>
        </div>
        
        <Auth />
        
        <p className="mt-8 text-center text-gray-500 text-sm">
          © 2025 PrimerAI. All rights reserved.
        </p>
      </div>
    </main>
  );
}