import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  console.log("Route", req.nextUrl.pathname);
  console.log("IS LoggedIn:", isLoggedIn);
});

// Optionally, don't invoke Middleware on some paths 除了以下位置 其他都會執行auth驗證
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
