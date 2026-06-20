import type { Metadata } from "next";
import Link from "next/link";
import { LandingNav } from "@/components/landing/nav";
import { LandingFooter } from "@/components/landing/footer";
import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";

export const metadata: Metadata = {
  title: "Privacy Policy | Mix Architect",
  description:
    "How Mix Architect collects, uses, shares, and protects your information.",
  robots: { index: true, follow: true },
};

// Update this whenever the substance of this policy changes.
const EFFECTIVE_DATE = "June 20, 2026";

export default async function PrivacyPage() {
  const [locale, messages] = await Promise.all([getLocale(), getMessages()]);

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={{ landing: (messages as Record<string, unknown>).landing }}
    >
      <main className="min-h-screen bg-[#0A0A0A] text-white/85">
        <LandingNav />

        <article className="mx-auto max-w-3xl px-6 py-16 md:py-24">
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Privacy Policy
            </h1>
            <p className="text-sm text-white/50">
              Effective Date: {EFFECTIVE_DATE}
            </p>
          </header>

          <Section title="1. About This Policy">
            <p>
              This Privacy Policy explains how{" "}
              <strong>Mix Architect</strong> (&quot;we,&quot; &quot;us,&quot;
              or &quot;our&quot;) collects, uses, shares, and protects
              information when you use mixarchitect.com, the Mix Architect web
              application, and related services (the &quot;Services&quot;).
            </p>
            <p>
              By using the Services, you agree to the practices described here
              and to our{" "}
              <Link href="/terms" className="text-[#14B8A6] hover:underline">
                Terms of Service
              </Link>
              . If you do not agree, please do not use the Services.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <SubSection title="2.1 Account Information">
              <p>
                When you create an account, we collect your email address and
                authentication credentials (passwords are stored as salted
                hashes by our authentication provider; we never see your
                plaintext password). You may optionally provide a display name,
                profile photo, and persona type.
              </p>
            </SubSection>

            <SubSection title="2.2 Content You Upload or Create">
              <p>
                We store the content you create through the Services, including
                audio files, cover art, project briefs, mix references,
                timestamped comments, version histories, distribution metadata,
                and any other material you upload. This content is private to
                you and the collaborators or clients you explicitly share it
                with.
              </p>
            </SubSection>

            <SubSection title="2.3 Payment Information">
              <p>
                Payments are processed by <strong>Stripe, Inc.</strong> Stripe
                collects and stores your full payment card details — we never
                see your card number, expiration date, or CVC. We do store and
                retain identifiers we receive from Stripe, such as your Stripe
                customer ID, subscription ID, and payment status, which we use
                to manage your subscription and process refunds.
              </p>
              <p>
                For engineers who collect payments from clients via Stripe
                Connect, we additionally store your connected Stripe account
                ID, account status, and payout settings as reported by Stripe.
              </p>
            </SubSection>

            <SubSection title="2.4 Communications With Us">
              <p>
                If you contact support, submit a feature request, or fill out a
                form, we keep a record of that correspondence and any
                information you provide.
              </p>
            </SubSection>

            <SubSection title="2.5 Automatic Usage and Device Data">
              <p>When you use the Services, we automatically collect:</p>
              <List
                items={[
                  "IP address, used for security, rate limiting, and approximate geolocation;",
                  "Browser type, operating system, device type, and screen size;",
                  "Pages visited, features used, and approximate session timing;",
                  "Performance metrics (page load timing, waveform render speed, audio buffering events) used to debug and improve the product;",
                  "Error reports including stack traces and the URL where an error occurred, sent to our error-monitoring provider.",
                ]}
              />
            </SubSection>

            <SubSection title="2.6 Cookies and Similar Technology">
              <p>
                We use cookies and similar technologies for the following
                categories of purposes:
              </p>
              <List
                items={[
                  "Strictly necessary: authentication session cookies (set by Supabase) to keep you logged in. Without these the Services cannot function.",
                  "Analytics: cookies set by Google Analytics 4 and OpenPanel to measure aggregate usage and improve the product.",
                  "Payment processing: cookies set by Stripe Checkout during the checkout flow.",
                ]}
              />
              <p>
                See Section 9 below for more detail on cookies and how to
                control them.
              </p>
            </SubSection>
          </Section>

          <Section title="3. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <List
              items={[
                "Provide, maintain, and operate the Services for you;",
                "Process subscription payments and route engineer-client payments through Stripe Connect;",
                "Send transactional emails (welcome messages, payment receipts, comment notifications, password resets);",
                "Send product-related communications you have not opted out of (changelogs, important announcements);",
                "Detect, investigate, and prevent abuse, fraud, security issues, and violations of our Terms;",
                "Debug errors and improve performance using stack traces and performance metrics;",
                "Understand aggregate usage patterns to inform product decisions;",
                "Comply with legal obligations and respond to lawful requests from regulators and law enforcement;",
                "Enforce our Terms and protect our rights and the rights of users.",
              ]}
            />
            <p>
              We do <strong>not</strong> sell your personal information to
              third parties for advertising, and we do not train artificial
              intelligence models on your User Content.
            </p>
          </Section>

          <Section title="4. How We Share Information">
            <p>
              We share information only as described in this section. We never
              sell personal information.
            </p>

            <SubSection title="4.1 Service Providers (Sub-Processors)">
              <p>
                We rely on third-party service providers to operate the
                Services. They process information on our behalf, subject to
                contracts that require them to protect your data:
              </p>
              <List
                items={[
                  "Supabase — database, authentication, and file storage. Data is hosted in the United States.",
                  "Vercel — hosting and content delivery for the web application.",
                  "Stripe — payment processing for subscriptions and Stripe Connect engineer payouts.",
                  "Resend — transactional email delivery.",
                  "Sentry — error monitoring (captures stack traces, browser context, and the user ID associated with an error).",
                  "Google Analytics 4 — web traffic analytics.",
                  "OpenPanel — product usage analytics.",
                  "Anthropic — AI summarization of admin analytics dashboards (used internally; not applied to your User Content).",
                ]}
              />
              <p>
                Where these providers offer their own privacy policies, those
                terms also apply to the portions of your data they handle.
              </p>
            </SubSection>

            <SubSection title="4.2 Collaborators and Portal Visitors">
              <p>
                When you invite a release collaborator or share a project
                through the client portal, the people you share with can see
                the content you explicitly include in that share (audio
                versions, briefs, comments, etc.). You control who you share
                with.
              </p>
            </SubSection>

            <SubSection title="4.3 Engineer-Client Payments">
              <p>
                When a client pays an engineer through the Stripe Connect flow,
                Stripe shares limited transaction information with both the
                engineer and the client as needed to complete the payment, send
                receipts, and handle disputes.
              </p>
            </SubSection>

            <SubSection title="4.4 Legal Process">
              <p>
                We may disclose information if required to do so by law or
                valid legal process (such as a subpoena or court order), or if
                we believe in good faith that disclosure is necessary to
                investigate fraud, protect the safety of any person, or enforce
                our Terms.
              </p>
            </SubSection>

            <SubSection title="4.5 Business Transfers">
              <p>
                If we are involved in a merger, acquisition, financing, or sale
                of business assets, your information may be transferred as part
                of that transaction. We will provide notice (e.g., via email or
                in-app) before any material change in the controller of your
                personal information.
              </p>
            </SubSection>
          </Section>

          <Section title="5. Portal Visitors (Anonymous Clients)">
            <p>
              The client delivery portal is designed so that the clients of
              engineers using the Services can review tracks without creating
              an account.
            </p>
            <p>For portal visitors specifically:</p>
            <List
              items={[
                "We collect the name you provide when you leave a comment or approve a track. If you don't provide a name, your comment is labeled \"Client\".",
                "We collect your IP address for rate limiting and abuse detection.",
                "We do not require an email address from portal visitors.",
                "We store a small opaque token in your browser's local storage so that you can edit or delete your own comments later. Clearing your browser data removes this token.",
              ]}
            />
            <p>
              Portal comments are visible to the engineer (and any release
              collaborators) but not to other portal visitors of unrelated
              releases.
            </p>
          </Section>

          <Section title="6. Your Rights and Choices">
            <SubSection title="6.1 General">
              <p>
                You can access and edit most of your information directly in
                your account settings. You can also export your data, change
                your email preferences, and close your account from there.
              </p>
            </SubSection>

            <SubSection title="6.2 California Residents (CCPA / CPRA)">
              <p>
                If you are a California resident, you have specific rights
                regarding your personal information:
              </p>
              <List
                items={[
                  "The right to know what personal information we collect, use, share, or sell about you;",
                  "The right to delete personal information we have collected from you, subject to legal exceptions;",
                  "The right to correct inaccurate personal information;",
                  "The right to opt out of the sale or sharing of personal information — we do not sell personal information, so this right is automatically respected;",
                  "The right to limit the use and disclosure of sensitive personal information;",
                  "The right not to be discriminated against for exercising any of these rights.",
                ]}
              />
              <p>
                To exercise any of these rights, email{" "}
                <Anchor href="mailto:legal@mixarchitect.com">
                  legal@mixarchitect.com
                </Anchor>
                . We will verify your request by asking you to confirm
                ownership of the account email address. Authorized agents may
                submit requests on your behalf with proof of authorization.
              </p>
            </SubSection>

            <SubSection title="6.3 EU, UK, and Other Jurisdictions">
              <p>
                If you are in the European Economic Area, the United Kingdom,
                or another jurisdiction with comprehensive data-protection
                laws, you may have rights including access, correction,
                deletion, restriction of processing, data portability, and
                objection to processing.
              </p>
              <p>
                To exercise these rights, email{" "}
                <Anchor href="mailto:legal@mixarchitect.com">
                  legal@mixarchitect.com
                </Anchor>
                . You also have the right to lodge a complaint with the
                supervisory authority in your country.
              </p>
            </SubSection>

            <SubSection title="6.4 How We Respond to Requests">
              <p>
                We aim to respond to verified requests within 30 days. Where
                allowed by law, we may charge a reasonable fee or refuse to act
                on requests that are manifestly unfounded, excessive, or
                repetitive.
              </p>
            </SubSection>
          </Section>

          <Section title="7. Email Communications and Unsubscribing">
            <p>
              We send two categories of email through Resend:
            </p>
            <List
              items={[
                "Transactional emails (subscription confirmation, password resets, payment receipts, comment notifications, security alerts). You cannot opt out of essential transactional emails while your account is active because they are necessary to operate the Services.",
                "Product communications (changelogs, important product news). You can disable these in your account email preferences. Each marketing-style email includes an unsubscribe link.",
              ]}
            />
          </Section>

          <Section title="8. Data Security">
            <p>
              We take security seriously and use reasonable administrative,
              technical, and physical safeguards to protect your information.
              These include:
            </p>
            <List
              items={[
                "HTTPS encryption in transit for all traffic between your browser and our Services;",
                "Encryption at rest for database storage (provided by Supabase) and audio file storage;",
                "Row-Level Security (RLS) policies that prevent users from accessing each other's data at the database level;",
                "Signed, expiring URLs for private audio file access;",
                "Rate limiting on sensitive endpoints and webhook signature verification on incoming payment events;",
                "Regular review of our access controls and dependency vulnerabilities.",
              ]}
            />
            <p>
              No method of transmission or storage is 100% secure. While we
              work hard to protect your data, we cannot guarantee absolute
              security.
            </p>
          </Section>

          <Section title="9. Cookies and Tracking Detail">
            <p>
              You can configure your browser to block cookies, but doing so may
              break parts of the Services that depend on the authentication
              cookie (you will not be able to stay logged in).
            </p>
            <p>Specific tools we use:</p>
            <List
              items={[
                "Authentication cookie (set by Supabase) — strictly necessary; allows you to remain logged in.",
                "Google Analytics 4 — measures aggregate page views, sessions, and conversion events. You can opt out using Google's browser opt-out plugin (https://tools.google.com/dlpage/gaoptout).",
                "OpenPanel — measures product engagement and feature usage with first-party cookies (proxied through our domain). You can opt out by enabling Do Not Track in your browser; we honor that signal where applicable.",
                "Stripe — sets cookies during the checkout flow to support fraud prevention. See Stripe's cookie policy at https://stripe.com/cookies-policy/legal.",
              ]}
            />
          </Section>

          <Section title="10. Data Retention">
            <p>
              We retain personal information only as long as we need it for the
              purposes described in this policy.
            </p>
            <List
              items={[
                "Account information: while your account is active, plus up to 30 days after closure for support and dispute resolution.",
                "User Content (audio files, projects, comments, etc.): deleted within a reasonable period after you delete it or close your account, subject to backup retention windows.",
                "Payment records and subscription history: retained as required by financial-record-keeping laws (typically 7 years).",
                "Server logs and error reports: typically retained for 90 days.",
                "Email logs: retained for 90 days for deliverability troubleshooting.",
                "Backups: full backups may be retained longer for disaster recovery and are deleted on a rolling basis.",
              ]}
            />
          </Section>

          <Section title="11. International Data Transfers">
            <p>
              Mix Architect is operated from the United States, and our primary
              service providers (Supabase, Vercel, Stripe) process data
              primarily in the United States. If you access the Services from
              outside the United States, your information will be transferred
              to, and processed in, the United States and other countries that
              may have different data-protection laws than your home country.
            </p>
            <p>
              Where required, we rely on lawful transfer mechanisms (such as
              Standard Contractual Clauses) to provide adequate protection for
              your personal information.
            </p>
          </Section>

          <Section title="12. Children&apos;s Privacy">
            <p>
              The Services are not directed to children under the age of 13
              (or 16 in jurisdictions where that age applies), and we do not
              knowingly collect personal information from them. If you believe
              we have collected information from a child, please contact{" "}
              <Anchor href="mailto:legal@mixarchitect.com">
                legal@mixarchitect.com
              </Anchor>{" "}
              and we will delete it.
            </p>
          </Section>

          <Section title="13. Do Not Track">
            <p>
              Our Services do not currently respond to all browser &quot;Do Not
              Track&quot; signals because there is no industry consensus on
              what they mean. We disable analytics cookies for users in
              browsers that send a clear Do Not Track signal where technically
              feasible.
            </p>
          </Section>

          <Section title="14. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. If we make
              material changes that affect how we use your personal
              information, we will provide notice at least 14 days before the
              changes take effect by email or in-app notification.
            </p>
            <p>
              We will update the &quot;Effective Date&quot; at the top of this
              page when changes are made. Your continued use of the Services
              after the effective date constitutes acceptance of the updated
              policy.
            </p>
          </Section>

          <Section title="15. Contact Us">
            <p>
              Questions about this Privacy Policy or our data practices? Email{" "}
              <Anchor href="mailto:legal@mixarchitect.com">
                legal@mixarchitect.com
              </Anchor>
              .
            </p>
            <p>
              The data controller for the purposes of EU/UK data-protection law
              is Mix Architect, located in Los Angeles County, California,
              United States.
            </p>
          </Section>
        </article>

        <LandingFooter />
      </main>
    </NextIntlClientProvider>
  );
}

/* ── Local components ─────────────────────────────────────── */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">
        {title}
      </h2>
      <div className="space-y-4 leading-relaxed">{children}</div>
    </section>
  );
}

function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-base font-semibold text-white/90 mt-4">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-6 space-y-1.5 marker:text-white/40">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function Anchor({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a href={href} className="text-[#14B8A6] hover:underline">
      {children}
    </a>
  );
}
