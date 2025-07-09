import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/", // Landing page
  "/sign-in(.*)", // Sign-in and all sub-routes
  "/sign-up(.*)", // Sign-up and all sub-routes
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Match all routes except for static files and public folder
    "/((?!_next|.*\\..*|favicon.ico).*)",
  ],
};
