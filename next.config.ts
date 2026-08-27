import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  // Keep development and production build artifacts isolated. This prevents
  // a local `next build` from invalidating a running `next dev` session.
  distDir: process.env.NODE_ENV === "production" ? ".next" : ".next-dev",
  async headers() {
    return [{ source: "/(.*)", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ] }];
  },
};

export default nextConfig;
