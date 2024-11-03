import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import api from '@/services/axiosInstance';
import { Role } from '@/utils/interface/userInterface';

// Define a type for the roles
type RoleName = 'master-item' | 'office'; // Add other roles here as needed

// Define role-based access control configuration
const rolePermissions: Record<RoleName, string[]> = {
  'master-item': ['/', '/master-item', '/scanned-item'],
  'office': ['/', '/report'],
  // Add additional roles and their allowed routes here
};

// List of public URLs that can be accessed without a token
const publicUrls = ['/login'];

// Middleware function to protect routes based on authentication token
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static assets and API routes
  if (pathname.startsWith('/_next') || pathname.startsWith('/static') || /\.(.*)$/.test(pathname)) {
    return NextResponse.next();
  }

  // Allow access to public URLs
  if (publicUrls.some(url => pathname.startsWith(url))) {
    return NextResponse.next();
  }

  // Retrieve the token from cookies
  const token = request.cookies.get('token')?.value;

  // If no token, redirect to login and delete the cookie
  if (!token) {
    return redirectToLogin(request);
  }

  // Attempt to fetch user data
  const user = await fetchUser(token);
  if (!user) {
    return redirectToLogin(request);
  }

  // Role-based access control
  const roleNames = user.roles.map((role: Role) => role.name as RoleName);
  const allowedRoutes = getAllowedRoutes(roleNames);

  // Check access permissions
  if (!allowedRoutes.includes(pathname)) {
    return NextResponse.rewrite(new URL('/404', request.url));
  }

  // Proceed if the user has a valid token and the correct role
  return NextResponse.next();
}

// Function to redirect to the login page and delete the token cookie
function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL('/login', request.url);
  const response = NextResponse.redirect(loginUrl);
  response.cookies.set('token', '', { maxAge: -1, path: '/' });
  return response;
}

// Function to fetch user data with error handling
async function fetchUser(token: string) {
  try {
    const response = await api.get(`${process.env.NEXT_PUBLIC_USER_API}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('User Info Error:', error);
    return null; // Return null on error
  }
}

// Function to get allowed routes for the given roles
function getAllowedRoutes(roleNames: RoleName[]): string[] {
  return roleNames.flatMap(role => rolePermissions[role] || []);
}

// Configuration to apply middleware to all routes
export const config = {
  matcher: '/:path*', // Match all routes
};
