import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import api from '@/services/axiosInstance';

// Middleware function to protect routes based on authentication token
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Define a list of public URLs that can be accessed without a token
  const publicUrls = ['/login'];

  // Skip middleware for static assets and API routes
  if (
    pathname.startsWith('/_next') || // Built-in Next.js assets (e.g., /_next/static/)
    pathname.startsWith('/static') || // Static files (e.g., images, CSS)
    /\.(.*)$/.test(pathname)           // Matches any static file extension (e.g., .png, .jpg, .js, .css)
  ) {
    return NextResponse.next(); // Allow these requests to proceed
  }

  // Check if the current path is in the list of public URLs
  const isPublicUrl = publicUrls.some((url) => pathname.startsWith(url));

  // If the request is for a public URL, allow access
  if (isPublicUrl) {
    return NextResponse.next();
  }

  // Retrieve the token from cookies
  const token = request.cookies.get('token')?.value;

  // Check if the token exists for protected routes
  if (!token) {
    // Redirect to the login page if no token is found
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);

    // Optionally, delete the cookie if it doesn't exist or is invalid
    response.cookies.set('token', '', {
      maxAge: -1, // Set maxAge to -1 to delete the cookie
      path: '/',  // Use the same path as the original cookie
    });

    return response;
  }

  // Check User (Auth or Token Expired)
  try {
    await api.get(`${process.env.NEXT_PUBLIC_USER_API}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Send the token as a bearer token
      },
    });
    
  } catch (error) {
    // User info not found
    if (error instanceof Error) {
      console.error('User Info Error:', error.message);
    } else {
      console.error('Unexpected Error:', error);
    }

    // Redirect to the login page if fetching user info fails
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);

    // Delete the token cookie if fetching user info fails
    response.cookies.set('token', '', {
      maxAge: -1, // Set maxAge to -1 to delete the cookie
      path: '/',  // Use the same path as the original cookie
    });

    return response;
  }

  // Proceed if the user has a valid token
  return NextResponse.next();
}

// Configuration to apply middleware to all routes
export const config = {
  matcher: '/:path*', // Match all routes
};
