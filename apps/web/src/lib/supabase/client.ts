import { createBrowserClient } from '@supabase/ssr';

// Fix Node 25 experimental localStorage bug on server-side SSR
if (typeof window === 'undefined' && globalThis.localStorage && typeof globalThis.localStorage.getItem !== 'function') {
  delete (globalThis as Record<string, unknown>).localStorage;
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  return createBrowserClient(url, key);
}
