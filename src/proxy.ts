import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { isMockBackend, MOCK_SESSION_COOKIE } from '@/lib/backend-mode'

/**
 * Keeps the Supabase session cookie fresh for the portal, and turns away
 * visitors with no session at all. This is only the optimistic check: every
 * portal page and action re-verifies membership through `src/lib/dal.ts`.
 */
export async function proxy(request: NextRequest) {
  if (isMockBackend()) {
    const signedIn = request.cookies.has(MOCK_SESSION_COOKIE)
    return !signedIn && request.nextUrl.pathname.startsWith('/portal')
      ? redirectToLogin(request)
      : NextResponse.next()
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }
          response = NextResponse.next({ request })
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options)
          }
          for (const [key, value] of Object.entries(headers ?? {})) {
            response.headers.set(key, value)
          }
        },
      },
    },
  )

  // Must run before anything else reads the session: it is what refreshes it.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && request.nextUrl.pathname.startsWith('/portal')) {
    return redirectToLogin(request)
  }

  return response
}

function redirectToLogin(request: NextRequest) {
  const login = request.nextUrl.clone()
  login.pathname = '/login'
  login.search = ''
  return NextResponse.redirect(login)
}

export const config = {
  matcher: ['/portal/:path*', '/login'],
}
