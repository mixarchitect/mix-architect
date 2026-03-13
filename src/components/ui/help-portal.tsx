"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import { Mail, Search } from "lucide-react";
import { KnowledgeBase } from "@/components/ui/knowledge-base";
import { BugReportForm } from "@/components/ui/bug-report-form";
import { FeatureBoard } from "@/components/ui/feature-board";
import { Panel, PanelBody } from "@/components/ui/panel";
import { useTranslations } from "next-intl";

type Tab = "articles" | "bug" | "feature" | "contact";

export function HelpPortal() {
  const t = useTranslations("help");
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as Tab | null;
  const articleParam = searchParams.get("article");

  const tabs = useMemo(() => [
    { key: "articles" as Tab, label: t("articles") },
    { key: "bug" as Tab, label: t("reportBug") },
    { key: "feature" as Tab, label: t("suggestFeature") },
    { key: "contact" as Tab, label: t("contact") },
  ], [t]);

  const [activeTab, setActiveTab] = useState<Tab>(
    articleParam
      ? "articles"
      : tabParam && tabs.some((tb) => tb.key === tabParam)
        ? tabParam
        : "articles",
  );
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (articleParam) {
      setActiveTab("articles");
    } else if (tabParam && tabs.some((tb) => tb.key === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam, articleParam, tabs]);

  const hasSearch = query.trim().length > 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold h2">{t("title")}</h1>
        <p className="text-muted text-sm mt-1">
          {t("description")}
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-6 border-b border-border mb-6 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
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
          placeholder={t("searchPlaceholder")}
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
  const t = useTranslations("help");
  return (
    <Panel className="max-w-xl">
      <PanelBody className="pt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-signal-muted flex items-center justify-center">
            <Mail size={20} strokeWidth={1.5} className="text-signal" />
          </div>
          <h2 className="text-lg font-semibold">{t("getInTouch")}</h2>
        </div>
        <p className="text-muted text-sm mb-5">
          {t("getInTouchDesc")}
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
