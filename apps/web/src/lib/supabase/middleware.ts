import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const protectedPaths = ['/profile', '/my-listings', '/my-reviews', '/admin'];
  const path = request.nextUrl.pathname;
  const isProtected = protectedPaths.some((p) => path.startsWith(p));

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // Gracefully clean up stale cookies if refresh token is expired/invalid
    if (error && (error.message?.includes('Refresh Token') || (error as any).code === 'refresh_token_not_found')) {
      request.cookies.getAll().forEach((cookie) => {
        if (cookie.name.includes('auth-token') || cookie.name.startsWith('sb-')) {
          supabaseResponse.cookies.delete(cookie.name);
        }
      });
    }

    if (isProtected && (!user || error)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/auth/login';
      redirectUrl.searchParams.set('redirectTo', path);
      return NextResponse.redirect(redirectUrl);
    }
  } catch {
    if (isProtected) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/auth/login';
      redirectUrl.searchParams.set('redirectTo', path);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}
