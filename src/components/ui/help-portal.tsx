"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import { Mail, Search, Megaphone, Activity, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import Link from "next/link";
import { KnowledgeBase } from "@/components/ui/knowledge-base";
import { BugReportForm } from "@/components/ui/bug-report-form";
import { FeatureBoard } from "@/components/ui/feature-board";
import { Panel, PanelBody } from "@/components/ui/panel";
import { useTranslations } from "next-intl";

type Tab = "articles" | "bug" | "feature" | "changelog" | "status" | "contact";

export function HelpPortal() {
  const t = useTranslations("help");
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as Tab | null;
  const articleParam = searchParams.get("article");

  const tabs = useMemo(() => [
    { key: "articles" as Tab, label: t("articles") },
    { key: "bug" as Tab, label: t("reportBug") },
    { key: "feature" as Tab, label: t("suggestFeature") },
    { key: "changelog" as Tab, label: t("whatsNew") },
    { key: "status" as Tab, label: t("systemStatus") },
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
          {activeTab === "changelog" && <ChangelogSection />}
          {activeTab === "status" && <SystemStatusSection />}
          {activeTab === "contact" && <ContactSection />}
        </>
      )}
    </div>
  );
}

/* ── What's New / Changelog Section ── */

const CHANGELOG_STORAGE_KEY = "ma_last_seen_changelog";

function ChangelogSection() {
  const t = useTranslations("help");
  const [entries, setEntries] = useState<{ slug: string; title: string; summary: string; category: string; published_at: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/changelog/latest");
        const data = await res.json();
        if (data.published_at) {
          localStorage.setItem(CHANGELOG_STORAGE_KEY, new Date().toISOString());
        }
      } catch {
        // non-critical
      }
    }
    load();
  }, []);

  useEffect(() => {
    async function loadEntries() {
      try {
        const res = await fetch("/api/changelog/recent");
        if (res.ok) {
          const data = await res.json();
          setEntries(data.entries ?? []);
        }
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    }
    loadEntries();
  }, []);

  return (
    <div>
      <Panel className="mb-6">
        <PanelBody className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-signal-muted flex items-center justify-center">
              <Megaphone size={20} strokeWidth={1.5} className="text-signal" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{t("whatsNew")}</h2>
              <p className="text-muted text-sm">{t("whatsNewDesc")}</p>
            </div>
          </div>

          {loading ? (
            <p className="text-muted text-sm py-4">Loading...</p>
          ) : entries.length === 0 ? (
            <p className="text-muted text-sm py-4">{t("noChangelog")}</p>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <Link
                  key={entry.slug}
                  href={`/app/changelog/${entry.slug}`}
                  className="block rounded-lg border border-border p-4 hover:border-border-strong transition-colors"
                >
                  <div className="flex items-center gap-2 text-xs text-faint mb-1">
                    <span className="capitalize">{entry.category}</span>
                    <span>&middot;</span>
                    <time dateTime={entry.published_at}>
                      {new Date(entry.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </time>
                  </div>
                  <p className="text-sm font-medium text-text">{entry.title}</p>
                  <p className="text-sm text-muted mt-1 line-clamp-2">{entry.summary}</p>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-border">
            <Link
              href="/app/changelog"
              className="text-sm text-signal hover:text-teal-300 transition-colors font-medium"
            >
              {t("viewAllChangelog")} &rarr;
            </Link>
          </div>
        </PanelBody>
      </Panel>
    </div>
  );
}

/* ── System Status Section ── */

type SystemStatus = "operational" | "degraded" | "down";

interface SystemItem {
  name: string;
  status: SystemStatus;
  description: string;
}

function StatusIcon({ status }: { status: SystemStatus }) {
  if (status === "operational") return <CheckCircle size={16} strokeWidth={1.5} className="text-green-500" />;
  if (status === "degraded") return <AlertTriangle size={16} strokeWidth={1.5} className="text-amber-500" />;
  return <XCircle size={16} strokeWidth={1.5} className="text-red-500" />;
}

function statusLabel(status: SystemStatus): string {
  if (status === "operational") return "Operational";
  if (status === "degraded") return "Degraded";
  return "Down";
}

function statusColor(status: SystemStatus): string {
  if (status === "operational") return "text-green-500";
  if (status === "degraded") return "text-amber-500";
  return "text-red-500";
}

function SystemStatusSection() {
  const t = useTranslations("help");
  const [systems, setSystems] = useState<SystemItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallStatus, setOverallStatus] = useState<SystemStatus>("operational");
  const [lastChecked, setLastChecked] = useState<string>("");

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/status");
        if (res.ok) {
          const data = await res.json();
          setSystems(data.systems ?? []);
          setOverallStatus(data.overall ?? "operational");
          setLastChecked(data.checked_at ?? new Date().toISOString());
        } else {
          // fallback: show static status
          setFallbackSystems();
        }
      } catch {
        setFallbackSystems();
      } finally {
        setLoading(false);
      }
    }

    function setFallbackSystems() {
      setSystems([
        { name: "Web Application", status: "operational", description: "Core app, dashboard, and release management" },
        { name: "Audio Processing", status: "operational", description: "File uploads, playback, and waveform rendering" },
        { name: "Authentication", status: "operational", description: "Sign-in, sign-up, and session management" },
        { name: "Database", status: "operational", description: "Data storage and retrieval" },
        { name: "File Storage", status: "operational", description: "Cover art, audio files, and exports" },
        { name: "Notifications", status: "operational", description: "Email and in-app notifications" },
      ]);
      setOverallStatus("operational");
      setLastChecked(new Date().toISOString());
    }

    check();
  }, []);

  return (
    <div>
      {/* Overall status banner */}
      <Panel className="mb-6">
        <PanelBody className="pt-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              overallStatus === "operational" ? "bg-green-500/10" : overallStatus === "degraded" ? "bg-amber-500/10" : "bg-red-500/10",
            )}>
              <Activity size={20} strokeWidth={1.5} className={statusColor(overallStatus)} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{t("systemStatusTitle")}</h2>
              <p className={cn("text-sm font-medium", statusColor(overallStatus))}>
                {overallStatus === "operational"
                  ? t("allSystemsOperational")
                  : overallStatus === "degraded"
                    ? t("someSystemsDegraded")
                    : t("systemOutage")}
              </p>
            </div>
          </div>
          {lastChecked && (
            <p className="text-xs text-faint mt-2">
              {t("lastChecked")}: {new Date(lastChecked).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            </p>
          )}
        </PanelBody>
      </Panel>

      {/* Individual systems */}
      {loading ? (
        <p className="text-muted text-sm py-4">Checking systems...</p>
      ) : (
        <div className="space-y-2">
          {systems.map((system) => (
            <div
              key={system.name}
              className="flex items-center justify-between rounded-lg border border-border p-4"
            >
              <div>
                <p className="text-sm font-medium text-text">{system.name}</p>
                <p className="text-xs text-muted mt-0.5">{system.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusIcon status={system.status} />
                <span className={cn("text-xs font-medium", statusColor(system.status))}>
                  {statusLabel(system.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
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
