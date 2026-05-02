import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { withSentryConfig } from "@sentry/nextjs";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Content Security Policy is now set dynamically in middleware with per-request
// nonces. See src/middleware.ts for the policy definition.

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
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

// Wrap with Sentry's config helper. When SENTRY_AUTH_TOKEN is set
// in CI, this also uploads source maps; when it's unset, the wrap
// is effectively a no-op. Order matters: Sentry must be the
// outermost wrapper so it sees the final webpack config from
// next-intl + any future plugins.
export default withSentryConfig(withNextIntl(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Quiet build logs unless we're in CI explicitly debugging.
  silent: !process.env.CI,
  // Tunnels Sentry traffic through a Next.js route to avoid ad-block
  // false-positives. Cheap; safe to leave on.
  tunnelRoute: "/monitoring",
  // Source maps: only upload if an auth token is set. Without one,
  // the build still succeeds but errors show minified frames.
  disableLogger: true,
  automaticVercelMonitors: false,
});
