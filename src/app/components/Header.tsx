'use client';

import Link from 'next/link';
import Image from 'next/image';
import { User, LogOut, Loader2, Zap, Award } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    signOut, 
    subscriptionStatus, 
    hasPremium 
  } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // For rare cases where auth gets stuck, we always make sure to show something
  // const [emergencyTimeout, setEmergencyTimeout] = useState(false);
  
  // Improved loading state management
  useEffect(() => {
    // Initialize with undefined
    let timeoutId: NodeJS.Timeout | undefined = undefined;
    
    if (isLoading) {
      // Keep loading state in sync, but add protection
      setLocalLoading(true);
      
      // If loading takes more than 1.5 seconds, stop showing spinner
      timeoutId = setTimeout(() => {
        setLocalLoading(false);
      }, 1500);
    } else {
      // Auth context is not loading, clear our loading state
      setLocalLoading(false);
      
      // Clear any pending timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
    
    // Absolute emergency fallback - if we somehow get stuck indefinitely
    // Force show login button after 3 seconds
    const emergencyTimeoutId = setTimeout(() => {
      if (localLoading) {
        console.warn('Emergency timeout triggered - forcing auth display');
        setLocalLoading(false);
        // setEmergencyTimeout(true);
      }
    }, 3000);
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      clearTimeout(emergencyTimeoutId);
    };
  }, [isLoading, localLoading]);

  // Add click outside handler to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showMenu && 
        menuRef.current && 
        buttonRef.current && 
        !menuRef.current.contains(event.target as Node) && 
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
    } catch (error: unknown) {
      console.error('Error signing out:', error);
    } finally {
      setShowMenu(false);
      setIsSigningOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo_trans.png" alt="Logo" width={32} height={32} priority />
          <span className="font-medium text-lg">Primer AI</span>
        </Link>
        
        {localLoading ? (
          <div className="w-8 h-8 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
          </div>
        ) : isAuthenticated && user ? (
          <div className="relative">
            <button 
              ref={buttonRef}
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 py-1.5 px-3 rounded-full hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                {hasPremium ? (
                  <Award className="w-5 h-5 text-emerald-600" />
                ) : subscriptionStatus === 'trial' ? (
                  <Zap className="w-5 h-5 text-indigo-600" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>
              {user?.email && (
                <span className="text-sm font-medium hidden md:inline-block">
                  {user.email.split('@')[0]}
                  {hasPremium && <span className="ml-1.5 text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full border border-emerald-200">PRO</span>}
                  {subscriptionStatus === 'trial' && <span className="ml-1.5 text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">TRIAL</span>}
                </span>
              )}
            </button>
            
            {showMenu && (
              <div 
                ref={menuRef}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-[100] border border-gray-100"
              >
                <Link 
                  href="/dashboard" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowMenu(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    {isSigningOut ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogOut className="w-4 h-4" />
                    )}
                    <span>{isSigningOut ? 'Signing out...' : 'Sign out'}</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="flex items-center gap-1 py-1.5 px-3 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors text-sm font-medium">
            <User className="w-4 h-4" />
            <span>Sign in</span>
          </Link>
        )}
      </div>
    </header>
  );
} 