// Re-export all auth-related utilities for easier imports
export * from './withAuth';
export * from './useAuthHelpers';

// Simplify auth imports with more explicit naming to prevent confusion
export { AuthProvider, useAuth } from '@/app/context/AuthContext';

// Define auth-related types for better type safety
export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading';

// Helper functions for common auth state checks
export const getAuthStatus = (isAuthenticated: boolean, isLoading: boolean): AuthStatus => {
  if (isLoading) return 'loading';
  return isAuthenticated ? 'authenticated' : 'unauthenticated';
}; 