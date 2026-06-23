import withAuth from "next-auth/middleware";

export default withAuth;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/repositories/:path*",
    "/pr/:path*",
    "/settings/:path*",
    "/teams/:path*",
    "/admin/:path*",
  ],
};

