import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Content Security Policy — start with report-only to avoid breakage.
// Once verified, change the header key to "Content-Security-Policy".
const cspPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' js.stripe.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: sjdodeauawmuzredpxwa.supabase.co",
  "connect-src 'self' sjdodeauawmuzredpxwa.supabase.co *.supabase.co api.stripe.com",
  "font-src 'self'",
  "frame-src js.stripe.com bandcamp.com *.bandcamp.com",
  "media-src 'self' blob: sjdodeauawmuzredpxwa.supabase.co",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
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
          { key: "Content-Security-Policy", value: cspPolicy },
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
