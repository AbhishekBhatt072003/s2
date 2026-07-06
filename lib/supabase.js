import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Server-side client using the service role key. Bypasses RLS.
let cached = global._sbAdmin;
export function sbAdmin() {
  if (cached) return cached;
  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  global._sbAdmin = cached;
  return cached;
}
