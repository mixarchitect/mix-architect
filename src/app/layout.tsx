import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeWrapper } from "@/components/theme-wrapper";
import "./globals.css";
import { PerfOverlayLoader } from "@/components/dev/perf-overlay-loader";
import { PerfReporterInit } from "@/components/perf-reporter-init";
import { OpenPanelAnalytics } from "@/components/analytics/OpenPanelAnalytics";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mix Architect",
  description: "Blueprints for stereo and immersive mixes",
  alternates: {
    types: {
      "application/rss+xml": "/changelog/feed.xml",
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeWrapper>
          <nav aria-label="Skip links">
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-teal-600 focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              Skip to main content
            </a>
          </nav>
          {children}
          <OpenPanelAnalytics />
          <GoogleAnalytics />
          <PerfReporterInit />
          <PerfOverlayLoader />
        </ThemeWrapper>
      </body>
    </html>
  );
}
