import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
 
export function middleware(request: NextRequest) {

  const accessToken = sessionStorage.getItem('accessToken');
  
  // Check URL path
  const path = request.nextUrl.pathname;
  const isAuthPage = path.startsWith('/login') || path.startsWith('/signup');
  const isProtectedRoute = path.startsWith('/dashboard');

  
  // Authentication check
  const isAuthenticated = !!accessToken;


      // Redirect logic
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }



  
  return NextResponse.next();
}
 
export const config = {
  matcher: [
    '/dashboard',
    '/login',
    '/signup',
    '/logout'
  ]
};