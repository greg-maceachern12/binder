import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifySubscription } from '@/app/lib/polar/client';

// Create a Supabase client for server-side use
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  {
    auth: {
      persistSession: false
    }
  }
);

export async function POST(req: Request) {
  try {
    // Get the user ID from the request body
    const { userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Get user data from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('subscription_id, trial_active, polar_id')
      .eq('id', userId)
      .single();
      
    if (userError) {
      console.error('Error fetching user data:', userError);
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      );
    }
    
    // Check subscription status using Polar API
    let subscriptionStatus = 'inactive';
    let hasGenerationsRemaining = false;
    
    if (userData.subscription_id) {
      // Verify subscription with Polar API
      const isActive = await verifySubscription(userData.subscription_id);
      
      if (isActive) {
        subscriptionStatus = 'active';
        hasGenerationsRemaining = true;
      }
    } else if (userData.trial_active) {
      subscriptionStatus = 'trialing';
      hasGenerationsRemaining = true;
    }
    
    return NextResponse.json({
      status: subscriptionStatus,
      hasGenerationsRemaining,
      userData: {
        subscription_id: userData.subscription_id,
        trial_active: userData.trial_active,
        polar_id: userData.polar_id
      }
    });
    
  } catch (error) {
    console.error('Error in subscription verification API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 