'use client';

import Link from 'next/link';
import Image from 'next/image';
import { User, LogOut, Loader2, Zap, Award } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function Header() {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    signOut, 
    subscriptionStatus, 
    hasPremium 
  } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;
    if (isLoading) {
      setLocalLoading(true);
      timeoutId = setTimeout(() => {
        if (isLoading) {
          console.warn('Auth loading timeout');
          setLocalLoading(false); 
        }
      }, 3000);
    } else {
      setLocalLoading(false);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading]);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
    } catch (error: unknown) {
      console.error('Error signing out:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const getInitials = (email?: string | null): string => {
    if (!email) return 'U';
    const namePart = email.split('@')[0];
    return namePart.substring(0, 2).toUpperCase();
  };

  const renderUserIcon = () => {
    if (hasPremium) {
      return <Award className="w-5 h-5 text-emerald-600" />;
    } else if (subscriptionStatus === 'trial') {
      return <Zap className="w-5 h-5 text-indigo-600" />;
    } else {
      return <User className="w-5 h-5" />;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-2 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo_trans.png" alt="Logo" width={32} height={32} priority />
          <span className="font-medium text-lg">Primer AI</span>
        </Link>
        
        <div className="flex items-center">
          {localLoading ? (
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-20 hidden md:block" />
            </div>
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 py-1.5 px-2 rounded-full h-auto">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      {renderUserIcon()}
                    </AvatarFallback>
                  </Avatar>
                  {user?.email && (
                    <span className="text-sm font-medium hidden md:inline-block">
                      {user.email.split('@')[0]}
                      {hasPremium && <span className="ml-1.5 text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full border border-emerald-200">PRO</span>}
                      {subscriptionStatus === 'trial' && <span className="ml-1.5 text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">TRIAL</span>}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.email?.split('@')[0]}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                   <Link href="/dashboard" className="cursor-pointer">
                     Profile
                   </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} disabled={isSigningOut} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    {isSigningOut ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogOut className="w-4 h-4" />
                    )}
                    <span>{isSigningOut ? 'Signing out...' : 'Sign out'}</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link href="/login">
                <User className="mr-2 h-4 w-4" />
                Sign In
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
} 