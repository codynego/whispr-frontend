// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedPaths = ['/dashboard']

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Allow static files, API routes, etc.
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.includes('.') ||
    path.startsWith('/auth')
  ) {
    return NextResponse.next()
  }

  const isProtected = protectedPaths.some(p => path.startsWith(p))
  const accessToken = request.cookies.get('access_token')

  if (isProtected && !accessToken) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(loginUrl)
  }

  // Optional: redirect logged-in users away from login page
  if (accessToken && (path === '/auth/login' || path === '/auth/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/:path*',
}