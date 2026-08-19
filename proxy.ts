import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";

// Optimistic auth gate only (session/role from the JWT cookie, no DB call).
// Per-resource checks that need a DB read (e.g. "does this user own this
// listing") happen in the Server Component/Action itself, not here — see
// node_modules/next/dist/docs/.../proxy.md: "Always verify authentication
// and authorization inside each Server Function rather than relying on
// Proxy alone," since a matcher change can silently stop covering a route.
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  if (!session?.user) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin") && !hasPermission(session.user.role, "viewAdminPanel")) {
    return NextResponse.redirect(new URL("/listings", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/host/:path*",
    "/bookings/:path*",
    "/wishlist/:path*",
    "/listings/new",
    "/listings/:id/edit",
  ],
};
