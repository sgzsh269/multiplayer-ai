import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Match all routes except for static files and public folder
    "/((?!_next|.*\\..*|favicon.ico).*)",
  ],
};
