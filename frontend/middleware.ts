import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value
  const refreshToken = request.cookies.get('refreshToken')?.value

  const isAuthenticated = accessToken && refreshToken; // Simple check for presence of both tokens

  // If the user is trying to access the dashboard and is NOT authenticated, redirect them to the home page
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // If the user is trying to access the login/signup page and IS authenticated, redirect them to the dashboard
  if (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: ['/', '/dashboard/:path*', '/login', '/signup'], // Apply middleware to home, dashboard and auth pages
}
