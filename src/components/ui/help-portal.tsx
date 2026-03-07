"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import { Mail, Search } from "lucide-react";
import { KnowledgeBase } from "@/components/ui/knowledge-base";
import { BugReportForm } from "@/components/ui/bug-report-form";
import { FeatureBoard } from "@/components/ui/feature-board";
import { Panel, PanelBody } from "@/components/ui/panel";

type Tab = "articles" | "bug" | "feature" | "contact";

const TABS: { key: Tab; label: string }[] = [
  { key: "articles", label: "Help Articles" },
  { key: "bug", label: "Report a Bug" },
  { key: "feature", label: "Suggest a Feature" },
  { key: "contact", label: "Contact" },
];

export function HelpPortal() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as Tab | null;
  const articleParam = searchParams.get("article");
  const [activeTab, setActiveTab] = useState<Tab>(
    articleParam
      ? "articles"
      : tabParam && TABS.some((t) => t.key === tabParam)
        ? tabParam
        : "articles",
  );
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (articleParam) {
      setActiveTab("articles");
    } else if (tabParam && TABS.some((t) => t.key === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam, articleParam]);

  const hasSearch = query.trim().length > 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold h2">Help Center</h1>
        <p className="text-muted text-sm mt-1">
          Docs, bug reports, feature requests, and contact.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-6 border-b border-border mb-6 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "pb-3 text-sm font-medium whitespace-nowrap transition-colors",
              activeTab === tab.key && !hasSearch
                ? "text-signal border-b-2 border-signal"
                : "text-muted hover:text-text",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Persistent search bar */}
      <div className="relative mb-6">
        <Search
          size={16}
          strokeWidth={1.5}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-faint pointer-events-none"
        />
        <input
          type="text"
          className="input"
          style={{ paddingLeft: 40 }}
          placeholder="Search articles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Tab content — search overrides to show articles */}
      {hasSearch || activeTab === "articles" ? (
        <KnowledgeBase query={query} />
      ) : (
        <>
          {activeTab === "bug" && <BugReportForm />}
          {activeTab === "feature" && <FeatureBoard />}
          {activeTab === "contact" && <ContactSection />}
        </>
      )}
    </div>
  );
}

/* ── Contact Section (inline) ── */

function ContactSection() {
  return (
    <Panel className="max-w-xl">
      <PanelBody className="pt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-signal-muted flex items-center justify-center">
            <Mail size={20} strokeWidth={1.5} className="text-signal" />
          </div>
          <h2 className="text-lg font-semibold">Get in Touch</h2>
        </div>
        <p className="text-muted text-sm mb-5">
          For direct support, questions, or partnership inquiries, reach out via
          email.
        </p>
        <a
          href="mailto:support@mixarchitect.com"
          className="inline-flex items-center gap-2 text-signal hover:underline text-sm font-medium"
        >
          <Mail size={16} strokeWidth={1.5} />
          support@mixarchitect.com
        </a>
      </PanelBody>
    </Panel>
  );
}
