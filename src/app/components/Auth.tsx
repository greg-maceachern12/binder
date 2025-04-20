'use client';

import { useState, useEffect } from 'react';
import { Loader2, Mail, Sparkles, Terminal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Auth() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const { isAuthenticated, isLoading, signIn } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRedirect = sessionStorage.getItem('redirectAfterLogin');
      if (storedRedirect) {
        setRedirectPath(storedRedirect);
      }
    }
  }, []);
  
  useEffect(() => {
    if (isAuthenticated && !isLoading && !isSubmitting) {
      const redirectTimer = setTimeout(() => {
        if (redirectPath) {
          sessionStorage.removeItem('redirectAfterLogin');
          router.push(redirectPath);
        } else {
          router.push('/dashboard');
        }
      }, message?.type === 'success' ? 1000 : 0);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [isAuthenticated, isLoading, router, redirectPath, message, isSubmitting]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting || isLoading) return;
    
    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading && !isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed top-[64px] left-0 right-0 bottom-0 z-20 flex items-center justify-center overflow-hidden p-4">
      <div className="fixed inset-0 -z-10">
        <Image
          src="/grass-l.png"
          alt="Peaceful landscape"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-sky-600/10 via-transparent to-emerald-900/70"></div>
      </div>
      
      <Card className="w-full max-w-md mx-auto bg-card/90 backdrop-blur-md border-border/30 shadow-xl">
        <CardHeader className="items-center text-center">
          <div className="bg-gradient-to-r from-emerald-200 to-sky-200 p-3 rounded-full mb-4">
            <Sparkles className="w-6 h-6 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl text-emerald-900">Welcome to PrimerAI</CardTitle>
          <CardDescription className="text-emerald-700">
            {redirectPath ? 'Sign in to continue' : 'Sign in to start learning'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {redirectPath && (
             <Alert variant="default" className="mb-4 bg-sky-50 border-sky-100 text-sky-700">
               <Mail className="h-4 w-4" />
               <AlertTitle className="text-sky-800">Redirecting</AlertTitle>
               <AlertDescription>
                  You&apos;ll be redirected back after signing in.
               </AlertDescription>
            </Alert>
          )}
            
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-emerald-800">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                disabled={isSubmitting} 
                className="bg-white"
              />
            </div>
              
            {message && (
              <Alert variant={message.type === 'success' ? 'default' : 'destructive'} className={message.type === 'success' ? 'bg-emerald-50 border-emerald-100' : ''}>
                <Terminal className="h-4 w-4" />
                <AlertTitle>{message.type === 'success' ? 'Check your Email' : 'Error'}</AlertTitle>
                <AlertDescription className={message.type === 'success' ? 'text-emerald-700' : ''}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}
            
            <Button type="submit" className="w-full" disabled={isSubmitting || !email}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Magic Link'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-xs text-emerald-600 text-center">
            By signing in, you agree to our Terms and Privacy Policy
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}