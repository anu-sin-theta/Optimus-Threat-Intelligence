import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Public routes that don't require authentication
    const publicRoutes = ["/landing", "/login", "/api"]

    // If user is trying to access a protected route without auth, redirect to landing
    if (!publicRoutes.some((route) => pathname.startsWith(route)) && pathname !== "/") {
        // Check if user has auth token (this is a basic check)
        // In a real app, you'd verify the token server-side
        const hasAuth = request.cookies.has("__session") // Firebase sets this cookie

        if (!hasAuth && pathname !== "/") {
            return NextResponse.redirect(new URL("/landing", request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
