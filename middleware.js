// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
    // Get the pathname
    const pathname = request.nextUrl.pathname;
    
    // Define protected routes that require authentication
    const protectedRoutes = ['/profile', '/dashboard', '/cart', '/orders'];
    const supplierProtectedRoutes = ['/supplier/profile', '/supplier/dashboard', '/supplier/orders', '/supplier/products', '/supplier/analytics'];
    
    // Define auth routes that should redirect if already logged in
    const authRoutes = ['/login', '/register'];
    const supplierAuthRoutes = ['/supplier/login', '/supplier/register'];
    
    // Get the cookies
    const userId = request.cookies.get('userId')?.value;
    const supplierSession = request.cookies.get('supplier-session')?.value;
    
    // Check if the current path is protected
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isSupplierProtectedRoute = supplierProtectedRoutes.some(route => pathname.startsWith(route));
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
    const isSupplierAuthRoute = supplierAuthRoutes.some(route => pathname.startsWith(route));
    
    // Handle vendor routes
    if (isProtectedRoute && !userId) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirectTo', pathname);
        loginUrl.searchParams.set('message', 'Please login to access this page');
        return NextResponse.redirect(loginUrl);
    }
    
    if (isAuthRoute && userId) {
        return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Handle supplier routes
    if (isSupplierProtectedRoute && !supplierSession) {
        const loginUrl = new URL('/supplier/login', request.url);
        loginUrl.searchParams.set('redirectTo', pathname);
        loginUrl.searchParams.set('message', 'Please login to access this page');
        return NextResponse.redirect(loginUrl);
    }
    
    if (isSupplierAuthRoute && supplierSession) {
        return NextResponse.redirect(new URL('/supplier/dashboard', request.url));
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
