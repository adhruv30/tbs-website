import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

import { isMockBackend, MOCK_SESSION_COOKIE } from '@/lib/backend-mode'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  if (isMockBackend()) {
    ;(await cookies()).delete(MOCK_SESSION_COOKIE)
  } else {
    const supabase = await createClient()
    await supabase.auth.signOut()
  }
  // 303 so the browser follows with a GET.
  return NextResponse.redirect(new URL('/login', request.nextUrl.origin), 303)
}
