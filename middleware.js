import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Define the portals we want to protect
    const portals = ["admin", "manager", "freelancer", "client"];

    for (const portal of portals) {
      const portalPath = `/${portal}`;
      const loginPath = `/${portal}/login`;

      // Check if the user is trying to access a portal route (but not its login page)
      if (path.startsWith(portalPath) && !path.startsWith(loginPath)) {
        // 1. Not authenticated -> Redirect to the portal's login page
        if (!token) {
          return NextResponse.redirect(new URL(loginPath, req.url));
        }

        // 2. Authenticated but wrong role -> Redirect to their actual role portal
        if (token.role !== portal) {
          return NextResponse.redirect(new URL(`/${token.role}`, req.url));
        }
      }
      
      // 3. Authenticated and trying to access a login page -> Redirect to their portal
      if (path.startsWith(loginPath) && token) {
        return NextResponse.redirect(new URL(`/${token.role}`, req.url));
      }
    }

    // Handle global /login page if they are already logged in
    if (path === '/login' && token) {
      return NextResponse.redirect(new URL(`/${token.role}`, req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // Let the middleware handle the logic
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*", 
    "/manager/:path*", 
    "/freelancer/:path*", 
    "/client/:path*",
    "/login"
  ],
};
