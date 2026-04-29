export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/((?!api/auth|api/webhook|login|_next/static|_next/image|favicon.ico|icon-192.png|manifest.json|sw.js|workbox-.*).*)",
  ],
};
