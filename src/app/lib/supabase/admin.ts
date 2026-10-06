import 'server-only';
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';

/**
 * Service-role Supabase client. Bypasses RLS, so only import it from server
 * code that has already checked the caller. Never import this module from a
 * client component, and never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
 */
export function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!serviceRoleKey) {
    throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export type AuthenticatedAdmin =
  | { ok: true; user: User; admin: SupabaseClient }
  | { ok: false; status: number; message: string };

function readBearerToken(request: Request): string | null {
  const header = request.headers.get('authorization');
  if (!header) return null;
  const match = header.match(/^Bearer\s+(\S+)$/i);
  return match?.[1] ?? null;
}

/**
 * Verifies the caller's Supabase access token with the Auth server and
 * returns a service-role client for the subsequent write. The user id comes
 * from the token, not from the request body.
 */
export async function authenticateRequest(request: Request): Promise<AuthenticatedAdmin> {
  const token = readBearerToken(request);
  if (!token) {
    return { ok: false, status: 401, message: 'Sign in required' };
  }

  let admin: SupabaseClient;
  try {
    admin = createAdminClient();
  } catch (error) {
    console.error(error);
    return { ok: false, status: 500, message: 'Failed to generate' };
  }

  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) {
    return { ok: false, status: 401, message: 'Sign in required' };
  }

  return { ok: true, user: data.user, admin };
}
