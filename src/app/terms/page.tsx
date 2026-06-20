import type { Metadata } from "next";
import Link from "next/link";
import { LandingNav } from "@/components/landing/nav";
import { LandingFooter } from "@/components/landing/footer";
import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";

export const metadata: Metadata = {
  title: "Terms of Service | Mix Architect",
  description:
    "The terms and conditions that govern your use of Mix Architect.",
  robots: { index: true, follow: true },
};

// Update this whenever the substance of these Terms changes.
const EFFECTIVE_DATE = "June 20, 2026";

export default async function TermsPage() {
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
              Terms of Service
            </h1>
            <p className="text-sm text-white/50">
              Effective Date: {EFFECTIVE_DATE}
            </p>
          </header>

          <Section title="1. Agreement to These Terms">
            <p>
              These Terms of Service (the &quot;Terms&quot;) are a legal
              agreement between you and{" "}
              <strong>Tiix</strong> (&quot;Mix Architect,&quot;
              &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) governing your
              access to and use of mixarchitect.com, the Mix Architect web
              application, and any related services we offer (together, the
              &quot;Services&quot;).
            </p>
            <p>
              By creating an account, accessing, or using the Services, you
              confirm that you have read, understood, and agree to be bound by
              these Terms and our{" "}
              <Link href="/privacy" className="text-[#14B8A6] hover:underline">
                Privacy Policy
              </Link>
              . If you do not agree, do not use the Services.
            </p>
          </Section>

          <Section title="2. Description of the Service">
            <p>
              Mix Architect is a software platform that helps music engineers,
              mix engineers, producers, and recording artists plan releases,
              build mix briefs, review audio with timestamped comments, deliver
              tracks to clients, and bill for project work. Features may
              include:
            </p>
            <List
              items={[
                "Release planning, timelines, and project organization",
                "Audio file upload, version tracking, and waveform-based review",
                "Comment threads tied to specific timestamps in a track",
                "A shareable client portal for collecting feedback and approvals",
                "Loudness and audio specification analysis",
                "Format conversion (e.g., WAV to MP3, AAC, FLAC)",
                "Subscription billing through Stripe",
                "Engineer payment collection via Stripe Connect",
                "Distribution tracking across streaming platforms",
              ]}
            />
            <p>
              We may add, modify, or remove features at any time. For material
              changes that affect paid-tier functionality, we will give
              reasonable advance notice.
            </p>
          </Section>

          <Section title="3. Eligibility and Your Account">
            <p>
              You must be at least 18 years old (or the legal age of majority in
              your jurisdiction) and able to enter into a binding contract to
              use the Services. By creating an account, you represent that you
              meet these requirements.
            </p>
            <p>You are responsible for:</p>
            <List
              items={[
                "Providing accurate registration information and keeping it current",
                "Keeping your login credentials secure",
                "All activity that occurs under your account",
                "Promptly notifying us of any unauthorized use of your account",
              ]}
            />
            <p>
              We may suspend or terminate accounts that violate these Terms,
              applicable law, or that show signs of abuse, fraud, or misuse.
            </p>
          </Section>

          <Section title="4. Subscriptions and Billing">
            <SubSection title="4.1 Plans">
              <p>
                We offer a Free plan and a paid Pro plan, available on monthly
                or annual billing. Current pricing and features are listed at{" "}
                <Link href="/" className="text-[#14B8A6] hover:underline">
                  mixarchitect.com
                </Link>{" "}
                and may change. We will give existing paid subscribers
                reasonable notice before any price increase.
              </p>
            </SubSection>
            <SubSection title="4.2 Billing">
              <p>
                Paid subscriptions are billed in advance via Stripe on a
                recurring basis (monthly or annually) until canceled. By
                providing a payment method, you authorize us (through Stripe) to
                charge it on each renewal date for the then-current
                subscription fee plus any applicable taxes.
              </p>
            </SubSection>
            <SubSection title="4.3 Cancellation">
              <p>
                You may cancel your paid subscription at any time from your
                account settings. Cancellation takes effect at the end of the
                current billing period; you retain paid features until then.
              </p>
            </SubSection>
            <SubSection title="4.4 Refunds">
              <p>
                We do not offer refunds for partial billing periods, unused
                features, or unused time. If you believe you were charged in
                error, contact us at{" "}
                <Anchor href="mailto:legal@mixarchitect.com">legal@mixarchitect.com</Anchor>{" "}
                within 30 days of the charge and we will review the request in
                good faith.
              </p>
            </SubSection>
            <SubSection title="4.5 Failed Payments">
              <p>
                If a payment fails, we will retry per Stripe&apos;s standard
                cadence. After repeated failures, we may downgrade your account
                to the Free plan, which removes access to paid features.
              </p>
            </SubSection>
            <SubSection title="4.6 Taxes">
              <p>
                Stated prices exclude applicable taxes (sales tax, VAT, GST,
                etc.). Where required, we will add taxes at checkout based on
                your billing location.
              </p>
            </SubSection>
          </Section>

          <Section title="5. Engineer Payment Collection (Stripe Connect)">
            <p>
              Mix Architect provides tools that engineers can use to invoice
              clients and receive payments through Stripe Connect.
            </p>
            <List
              items={[
                "Engineers connect their own Stripe accounts to receive client payments.",
                "Clients pay through the platform; funds are routed by Stripe to the engineer's connected account, less Stripe's processing fees and any platform fee disclosed before the engineer accepts the engagement.",
                "The professional engagement (scope, deliverables, timelines, refund terms) is solely between the engineer and the client. Mix Architect is a software platform; we are not a party to any engagement contract and do not provide engineering services.",
                "Payment disputes, chargebacks, refunds, and tax obligations are governed by Stripe's Connect terms and the engineer-client agreement. We may, at our discretion, assist with mediation but are not obligated to do so.",
              ]}
            />
          </Section>

          <Section title="6. Your Content">
            <SubSection title="6.1 What &quot;User Content&quot; Means">
              <p>
                &quot;User Content&quot; includes any audio files, project
                briefs, mix references, comments, cover art, metadata, and other
                material you upload, create, or share through the Services.
              </p>
            </SubSection>
            <SubSection title="6.2 You Own Your Content">
              <p>
                You retain all ownership rights in your User Content. We claim
                no ownership over the music, masters, mixes, or other creative
                work you bring to the platform.
              </p>
            </SubSection>
            <SubSection title="6.3 License You Grant to Us">
              <p>
                To operate the Services for you, you grant Mix Architect a
                worldwide, non-exclusive, royalty-free, transferable license to
                host, store, copy, process, transcode, generate waveform
                visualizations from, analyze loudness of, and display your User
                Content. This license is limited to providing the Services to
                you and to anyone you explicitly authorize (e.g., release
                members, portal recipients). It terminates when you delete the
                content or close your account, except as necessary to comply
                with legal obligations or resolve disputes.
              </p>
            </SubSection>
            <SubSection title="6.4 Your Representations About Content">
              <p>
                By uploading or sharing any content through the Services, you
                represent and warrant that:
              </p>
              <List
                items={[
                  "You own it OR have obtained all licenses, rights, consents, and permissions necessary to upload, share, and use it through the Services for the purposes contemplated;",
                  "Your content does not infringe any third-party rights, including copyright, trademark, publicity, or privacy rights;",
                  "Your content does not contain illegal, defamatory, obscene, or otherwise unlawful material;",
                  "Any individuals depicted in cover art or referenced in metadata have given consent to that use.",
                ]}
              />
            </SubSection>
            <SubSection title="6.5 Backups Are Your Responsibility">
              <p>
                While we use reasonable measures to protect your content
                against loss, the Services are <strong>not</strong> intended as
                a primary backup or archival solution for masters or other
                irreplaceable files. You should maintain independent backups of
                anything important.
              </p>
            </SubSection>
          </Section>

          <Section title="7. Acceptable Use">
            <p>You agree not to:</p>
            <List
              items={[
                "Upload or share content you don't have the rights to;",
                "Use the Services for any unlawful, fraudulent, or abusive purpose;",
                "Send spam, unsolicited messages, or harassment through the client portal or any other feature;",
                "Attempt to gain unauthorized access to other accounts, systems, or data;",
                "Reverse engineer, decompile, disassemble, or scrape the Services;",
                "Use the Services to develop, train, or improve a competing product or service;",
                "Resell, sublicense, rent, or otherwise transfer access to your account;",
                "Bypass usage limits, abuse rate limits, or interfere with the normal operation of the Services;",
                "Upload malware, viruses, or any code intended to damage, disable, or impair the Services or any user.",
              ]}
            />
            <p>
              Violation of this section may result in immediate account
              suspension or termination at our discretion.
            </p>
          </Section>

          <Section title="8. Intellectual Property">
            <SubSection title="8.1 Our Intellectual Property">
              <p>
                The Services — including all software, design, user
                interfaces, documentation, branding, logos, and trademarks —
                are owned by Mix Architect or our licensors and are protected
                by copyright, trademark, and other intellectual property laws.
                We grant you a limited, non-exclusive, non-transferable,
                revocable license to use the Services for their intended
                purpose, subject to these Terms.
              </p>
            </SubSection>
            <SubSection title="8.2 Feedback">
              <p>
                If you send us feedback, suggestions, feature requests, or
                ideas, you grant us a perpetual, irrevocable, worldwide,
                royalty-free license to use them without obligation or
                attribution.
              </p>
            </SubSection>
          </Section>

          <Section title="9. Copyright Complaints (DMCA)">
            <p>
              We respect intellectual property rights and respond to notices of
              alleged copyright infringement under the U.S. Digital Millennium
              Copyright Act (DMCA).
            </p>
            <p>
              If you believe content on the Services infringes your copyright,
              send a notice to our designated DMCA agent at{" "}
              <Anchor href="mailto:legal@mixarchitect.com">
                legal@mixarchitect.com
              </Anchor>{" "}
              containing:
            </p>
            <List
              items={[
                "A description of the copyrighted work claimed to be infringed;",
                "The location of the allegedly infringing material on the Services (URL or specific identifier);",
                "Your contact information (name, address, telephone number, email);",
                "A statement that you have a good-faith belief that the use is not authorized by the copyright owner, its agent, or the law;",
                "A statement, under penalty of perjury, that the information in the notice is accurate and that you are the copyright owner or authorized to act on their behalf;",
                "Your physical or electronic signature.",
              ]}
            />
            <p>
              We may remove or disable access to material we believe in good
              faith to be infringing and may terminate the accounts of repeat
              infringers.
            </p>
          </Section>

          <Section title="10. Third-Party Services">
            <p>
              The Services rely on third-party providers, including but not
              limited to Supabase (database and storage), Vercel (hosting),
              Stripe (payments and Stripe Connect), Resend (email), and Sentry
              (error monitoring). Your use of these providers&apos; portions of
              the Services is also subject to their respective terms and
              privacy policies. We are not responsible for the acts or
              omissions of third-party providers beyond our reasonable
              control.
            </p>
          </Section>

          <Section title="11. Privacy">
            <p>
              Our{" "}
              <Link href="/privacy" className="text-[#14B8A6] hover:underline">
                Privacy Policy
              </Link>{" "}
              describes what data we collect, how we use it, and your rights
              with respect to it. By using the Services, you also agree to the
              Privacy Policy.
            </p>
          </Section>

          <Section title="12. Disclaimers">
            <p className="uppercase tracking-wide text-sm">
              THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS
              AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR
              IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, MIX ARCHITECT
              DISCLAIMS ALL WARRANTIES, INCLUDING WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
              NON-INFRINGEMENT, AND ANY WARRANTIES ARISING OUT OF COURSE OF
              DEALING OR USAGE OF TRADE.
            </p>
            <p>We do not warrant that:</p>
            <List
              items={[
                "The Services will be uninterrupted, error-free, or perfectly secure;",
                "Stored content will be permanently retained or available without interruption;",
                "Any specific commercial, creative, or financial result will be achieved;",
                "Defects or errors will be corrected on any particular timeline.",
              ]}
            />
            <p>
              You use the Services at your own risk and are responsible for
              evaluating their suitability for your purposes.
            </p>
          </Section>

          <Section title="13. Limitation of Liability">
            <p className="uppercase tracking-wide text-sm">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, MIX ARCHITECT AND ITS
              AFFILIATES, OFFICERS, EMPLOYEES, AGENTS, AND LICENSORS WILL NOT
              BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
              OR PUNITIVE DAMAGES, OR FOR ANY LOSS OF PROFITS, REVENUE, DATA,
              GOODWILL, OR BUSINESS OPPORTUNITIES, EVEN IF WE HAVE BEEN
              ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
            <p className="uppercase tracking-wide text-sm">
              OUR TOTAL CUMULATIVE LIABILITY FOR ANY CLAIM ARISING OUT OF OR
              RELATING TO THE SERVICES WILL NOT EXCEED THE GREATER OF (A) THE
              AMOUNTS YOU PAID TO US IN THE TWELVE (12) MONTHS IMMEDIATELY
              PRECEDING THE EVENT GIVING RISE TO THE CLAIM, OR (B) ONE HUNDRED
              U.S. DOLLARS ($100).
            </p>
            <p>
              These limitations apply regardless of the legal theory (contract,
              tort, statute, or otherwise) and apply even if a limited remedy
              fails of its essential purpose. Some jurisdictions do not allow
              limitation of certain damages — in those jurisdictions, our
              liability is limited to the maximum extent permitted by
              applicable law.
            </p>
          </Section>

          <Section title="14. Indemnification">
            <p>
              You agree to defend, indemnify, and hold harmless Mix Architect
              and its affiliates, officers, employees, agents, and licensors
              from any claims, demands, damages, losses, liabilities, costs, or
              expenses (including reasonable attorneys&apos; fees) arising out
              of or related to:
            </p>
            <List
              items={[
                "Your User Content;",
                "Your use of the Services;",
                "Your violation of these Terms;",
                "Your violation of any third-party right, including any intellectual property or privacy right;",
                "Any engagement, contract, or dispute between you and another user of the Services.",
              ]}
            />
          </Section>

          <Section title="15. Termination">
            <p>
              You may close your account at any time through your account
              settings.
            </p>
            <p>
              We may suspend or terminate your account if you violate these
              Terms, fail to pay amounts due, abuse the Services, or as
              otherwise reasonably necessary to protect the Services or other
              users. Where practical, we will provide notice before
              termination.
            </p>
            <p>Upon termination of your account:</p>
            <List
              items={[
                "Your access to the Services ends.",
                "Outstanding paid subscription fees are not refunded except as expressly stated in Section 4.4.",
                "Your User Content may be deleted after a reasonable grace period.",
                "Sections that by their nature should survive — including ownership of User Content, the license you granted in Section 6.3 for content already distributed to authorized collaborators, indemnification, limitation of liability, governing law, and these termination provisions — survive.",
              ]}
            />
          </Section>

          <Section title="16. Changes to These Terms">
            <p>
              We may update these Terms from time to time. For material changes
              that affect your rights or obligations, we will provide notice at
              least 14 days before the changes take effect, by email to the
              address on your account or by an in-app notification.
            </p>
            <p>
              Your continued use of the Services after the effective date
              constitutes acceptance of the updated Terms. If you do not agree,
              your remedy is to stop using the Services and close your account.
            </p>
          </Section>

          <Section title="17. Governing Law and Disputes">
            <p>
              These Terms are governed by the laws of the State of{" "}
              <strong>California</strong>, without regard to its conflict-of-law
              principles. Any dispute arising out of or relating to these Terms
              or the Services will be resolved exclusively in the state or
              federal courts located in <strong>Los Angeles County</strong>,{" "}
              <strong>California</strong>, and you consent to personal jurisdiction
              and venue in those courts.
            </p>
            <p>
              If you are a consumer located in the European Union, the United
              Kingdom, or another jurisdiction with mandatory
              consumer-protection laws, nothing in this section overrides those
              laws.
            </p>
          </Section>

          <Section title="18. General Provisions">
            <SubSection title="18.1 Entire Agreement">
              <p>
                These Terms, together with the{" "}
                <Link
                  href="/privacy"
                  className="text-[#14B8A6] hover:underline"
                >
                  Privacy Policy
                </Link>{" "}
                and any policies referenced in them, constitute the entire
                agreement between you and Mix Architect regarding the Services
                and supersede any prior agreements.
              </p>
            </SubSection>
            <SubSection title="18.2 Severability">
              <p>
                If any provision is found unenforceable, the remaining
                provisions remain in full force.
              </p>
            </SubSection>
            <SubSection title="18.3 No Waiver">
              <p>
                Our failure to enforce any provision is not a waiver of our
                right to enforce it later.
              </p>
            </SubSection>
            <SubSection title="18.4 Assignment">
              <p>
                You may not assign or transfer these Terms or your account
                without our prior written consent. We may assign these Terms in
                connection with a merger, acquisition, or sale of substantially
                all of our assets.
              </p>
            </SubSection>
            <SubSection title="18.5 Notices">
              <p>
                We may send notices to you at the email address associated with
                your account or through in-app notification. You should send
                notices to us at{" "}
                <Anchor href="mailto:legal@mixarchitect.com">legal@mixarchitect.com</Anchor>.
              </p>
            </SubSection>
          </Section>

          <Section title="19. Contact">
            <p>
              Questions about these Terms? Contact us at{" "}
              <Anchor href="mailto:legal@mixarchitect.com">legal@mixarchitect.com</Anchor>.
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
