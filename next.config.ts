import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Content Security Policy is now set dynamically in middleware with per-request
// nonces. See src/middleware.ts for the policy definition.

const nextConfig: NextConfig = {
  poweredByHeader: false,
  serverActions: {
    bodySizeLimit: "10mb",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sjdodeauawmuzredpxwa.supabase.co",
      },
    ],
  },
  async rewrites() {
    return [
      { source: "/stats/op.js", destination: "https://openpanel.dev/op1.js" },
      { source: "/stats/api/:path*", destination: "https://api.openpanel.dev/:path*" },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
