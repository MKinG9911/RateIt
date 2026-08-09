import { createClient } from '@/lib/supabase/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | undefined>;
  token?: string;
}

/**
 * API client that automatically attaches the Supabase Bearer token.
 * Use from client components only.
 */
export async function api<T = unknown>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<{ success: boolean; data?: T; error?: string; details?: string[] }> {
  const { params, token: explicitToken, ...fetchOptions } = options;

  let accessToken = explicitToken;

  if (!accessToken) {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      accessToken = session?.access_token;
    } catch {
      // Session fetch error fallback
    }
  }

  // Build URL with query params
  let url = `${API_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        searchParams.set(key, String(value));
      }
    }
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  const json = await response.json();

  if (!response.ok) {
    return {
      success: false,
      error: json.error || json.message || 'An error occurred',
      details: json.details,
    };
  }

  return json;
}
