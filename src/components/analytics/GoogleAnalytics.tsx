import Script from "next/script";

/**
 * Google Analytics 4 tracking script.
 *
 * Analytics storage granted (first-party cookies for session tracking).
 * Ad storage/personalization remain denied — no consent banner needed.
 * Only loads on production (mixarchitect.com).
 */
export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;

  if (!measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('consent', 'default', {
            'analytics_storage': 'granted',
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
          });

          gtag('config', '${measurementId}', {
            send_page_view: true,
          });
        `}
      </Script>
    </>
  );
}
