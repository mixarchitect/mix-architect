"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Radar,
  AlertTriangle,
  AlertCircle,
  Info,
} from "lucide-react";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { RlsAuditResponse } from "@/app/api/admin/rls-audit/route";
import type { AikidoFindingsResponse } from "@/app/api/admin/aikido/route";

type TestResult = { name: string; passed: boolean; detail?: string };

type Tab = "aikido" | "rls";

// ── Severity helpers ──

const severityConfig = {
  critical: { label: "Critical", color: "text-red-500", bg: "bg-red-500/15", border: "border-red-500/30", icon: XCircle },
  high: { label: "High", color: "text-orange-500", bg: "bg-orange-500/15", border: "border-orange-500/30", icon: AlertTriangle },
  medium: { label: "Medium", color: "text-amber-500", bg: "bg-amber-500/15", border: "border-amber-500/30", icon: AlertCircle },
  low: { label: "Low", color: "text-blue-400", bg: "bg-blue-400/15", border: "border-blue-400/30", icon: Info },
} as const;

const typeLabels: Record<string, string> = {
  open_source: "Dependency",
  leaked_secret: "Secret",
  sast: "SAST",
  surface_monitoring: "DAST",
  iac: "IaC",
  cloud: "Cloud",
  malware: "Malware",
  eol: "End of Life",
  scm_security: "SCM",
  ai_pentest: "AI Pentest",
  license: "License",
};

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState<Tab>("aikido");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text">Security</h1>
        <p className="text-sm text-muted mt-1">
          Code vulnerability scanning and data isolation testing.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab("aikido")}
          className={cn(
            "px-4 py-2.5 text-sm font-medium transition-colors -mb-px border-b-2",
            activeTab === "aikido"
              ? "border-amber-500 text-amber-500"
              : "border-transparent text-muted hover:text-text",
          )}
        >
          <span className="flex items-center gap-2">
            <Radar size={15} />
            Aikido
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("rls")}
          className={cn(
            "px-4 py-2.5 text-sm font-medium transition-colors -mb-px border-b-2",
            activeTab === "rls"
              ? "border-amber-500 text-amber-500"
              : "border-transparent text-muted hover:text-text",
          )}
        >
          <span className="flex items-center gap-2">
            <ShieldCheck size={15} />
            RLS Audit
          </span>
        </button>
      </div>

      {activeTab === "aikido" ? <AikidoTab /> : <RlsAuditTab />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// AIKIDO TAB
// ═══════════════════════════════════════════════════════════════

function AikidoTab() {
  const [findings, setFindings] = useState<AikidoFindingsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

  const fetchFindings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/aikido");
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const data: AikidoFindingsResponse = await res.json();
      setFindings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load findings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFindings();
  }, [fetchFindings]);

  async function triggerScan() {
    setScanning(true);
    setScanMessage(null);
    try {
      const res = await fetch("/api/admin/aikido/scan", { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
      setScanMessage(body.message);
    } catch (err) {
      setScanMessage(
        err instanceof Error ? err.message : "Failed to trigger scan",
      );
    } finally {
      setScanning(false);
    }
  }

  function toggleGroup(id: number) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const counts = findings?.counts.issue_groups;

  return (
    <div className="space-y-4">
      {/* Severity summary cards */}
      {counts && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(["critical", "high", "medium", "low"] as const).map((sev) => {
            const config = severityConfig[sev];
            const count = counts[sev];
            return (
              <Panel key={sev}>
                <PanelBody className="py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={cn("w-2 h-2 rounded-full", config.bg, config.color)} style={{ backgroundColor: "currentColor" }} />
                    <span className="text-xs font-medium uppercase tracking-wider text-muted">
                      {config.label}
                    </span>
                  </div>
                  <p className={cn("text-2xl font-bold", count > 0 ? config.color : "text-muted")}>
                    {count}
                  </p>
                </PanelBody>
              </Panel>
            );
          })}
        </div>
      )}

      {/* Actions bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={triggerScan}
            disabled={scanning}
            className="gap-2"
          >
            {scanning ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Triggering...
              </>
            ) : (
              <>
                <Radar size={16} />
                Trigger Scan
              </>
            )}
          </Button>
          <Button
            variant="secondary"
            onClick={fetchFindings}
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            Refresh
          </Button>
        </div>
        {findings && (
          <span className="text-xs text-faint">
            Updated {new Date(findings.fetchedAt).toLocaleString()}
          </span>
        )}
      </div>

      {/* Scan trigger feedback */}
      {scanMessage && (
        <Panel>
          <PanelBody>
            <p className="text-sm text-muted">{scanMessage}</p>
          </PanelBody>
        </Panel>
      )}

      {/* Error state */}
      {error && (
        <Panel>
          <PanelBody>
            <div className="flex items-center gap-3 text-red-500">
              <ShieldAlert size={20} />
              <div>
                <p className="font-medium">Failed to load findings</p>
                <p className="text-sm text-muted mt-0.5">{error}</p>
              </div>
            </div>
          </PanelBody>
        </Panel>
      )}

      {/* Loading state */}
      {loading && !findings && (
        <Panel>
          <PanelBody>
            <div className="flex items-center justify-center gap-3 py-8 text-muted">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">Loading Aikido findings...</span>
            </div>
          </PanelBody>
        </Panel>
      )}

      {/* Issue groups list */}
      {findings && findings.issues.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted">
            Open Issues ({findings.issues.length})
          </h2>
          {findings.issues.map((issue) => {
            const expanded = expandedGroups.has(issue.id);
            const config = severityConfig[issue.severity] ?? severityConfig.low;
            const SevIcon = config.icon;
            return (
              <Panel key={issue.id}>
                <PanelHeader className="py-3">
                  <button
                    type="button"
                    onClick={() => toggleGroup(issue.id)}
                    className="flex items-center justify-between w-full text-left gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <SevIcon size={16} className={cn(config.color, "shrink-0")} />
                      <span className="text-sm font-medium text-text truncate">
                        {issue.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          config.bg,
                          config.color,
                        )}
                      >
                        {config.label}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-panel2 text-muted">
                        {typeLabels[issue.type] ?? issue.type}
                      </span>
                      {expanded ? (
                        <ChevronDown size={14} className="text-muted" />
                      ) : (
                        <ChevronRight size={14} className="text-muted" />
                      )}
                    </div>
                  </button>
                </PanelHeader>
                {expanded && (
                  <PanelBody className="pt-0">
                    <div className="space-y-3 text-sm">
                      {issue.description && (
                        <p className="text-muted">{issue.description}</p>
                      )}
                      {issue.related_cve_ids.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-faint text-xs font-medium">CVEs:</span>
                          <div className="flex flex-wrap gap-1">
                            {issue.related_cve_ids.map((cve) => (
                              <span
                                key={cve}
                                className="text-xs px-1.5 py-0.5 rounded bg-panel2 text-muted font-mono"
                              >
                                {cve}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {issue.how_to_fix && (
                        <div>
                          <p className="text-xs font-medium text-faint mb-1">How to fix</p>
                          <p className="text-muted whitespace-pre-wrap">
                            {issue.how_to_fix}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-xs text-faint pt-1">
                        <span>Score: {issue.severity_score}</span>
                        <span>Status: {issue.group_status}</span>
                        {issue.time_to_fix_minutes > 0 && (
                          <span>
                            Est. fix: {issue.time_to_fix_minutes < 60
                              ? `${issue.time_to_fix_minutes}m`
                              : `${Math.round(issue.time_to_fix_minutes / 60)}h`}
                          </span>
                        )}
                      </div>
                    </div>
                  </PanelBody>
                )}
              </Panel>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {findings && findings.issues.length === 0 && !error && (
        <Panel>
          <PanelBody>
            <div className="text-center py-8 text-muted">
              <ShieldCheck size={40} className="mx-auto mb-3 text-emerald-500" />
              <p className="text-sm font-medium text-text">No open issues</p>
              <p className="text-xs text-faint mt-1">
                Aikido found no open vulnerabilities in the repository.
              </p>
            </div>
          </PanelBody>
        </Panel>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// RLS AUDIT TAB
// ═══════════════════════════════════════════════════════════════

function RlsAuditTab() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RlsAuditResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );

  async function runAudit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/rls-audit", { method: "POST" });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const data: RlsAuditResponse = await res.json();
      setResult(data);
      // Auto-expand categories with failures
      const failedCats = new Set<string>();
      for (const cat of data.categories) {
        if (cat.passed < cat.total) failedCats.add(cat.name);
      }
      setExpandedCategories(failedCats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Audit failed");
    } finally {
      setLoading(false);
    }
  }

  function toggleCategory(name: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  const allPassed = result && result.failures.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          Creates temporary test users, seeds data, runs cross-user access
          tests, then cleans up. Takes ~30 seconds.
        </p>
        <Button
          variant="primary"
          onClick={runAudit}
          disabled={loading}
          className="gap-2 shrink-0"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Running...
            </>
          ) : (
            <>
              <ShieldCheck size={16} />
              Run Audit
            </>
          )}
        </Button>
      </div>

      {error && (
        <Panel>
          <PanelBody>
            <div className="flex items-center gap-3 text-red-500">
              <ShieldAlert size={20} />
              <div>
                <p className="font-medium">Audit failed</p>
                <p className="text-sm text-muted mt-0.5">{error}</p>
              </div>
            </div>
          </PanelBody>
        </Panel>
      )}

      {result && (
        <>
          {/* Summary card */}
          <Panel>
            <PanelBody>
              <div className="flex items-center gap-4">
                {allPassed ? (
                  <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center">
                    <ShieldCheck size={24} className="text-emerald-500" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center">
                    <ShieldAlert size={24} className="text-red-500" />
                  </div>
                )}
                <div>
                  <p className="text-lg font-semibold text-text">
                    {result.totalPassed}/{result.totalTests} passed
                    {allPassed
                      ? " — All Clear"
                      : ` — ${result.failures.length} failure(s)`}
                  </p>
                  <p className="text-sm text-muted">
                    Last run: {new Date(result.date).toLocaleString()}
                  </p>
                </div>
              </div>
            </PanelBody>
          </Panel>

          {/* Category breakdown */}
          {result.categories.map((cat) => {
            const expanded = expandedCategories.has(cat.name);
            const catPassed = cat.passed === cat.total;
            return (
              <Panel key={cat.name}>
                <PanelHeader>
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat.name)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <div className="flex items-center gap-3">
                      {catPassed ? (
                        <CheckCircle2
                          size={18}
                          className="text-emerald-500"
                        />
                      ) : (
                        <XCircle size={18} className="text-red-500" />
                      )}
                      <span className="font-medium text-text">{cat.name}</span>
                      <span className="text-sm text-muted">
                        {cat.passed}/{cat.total}
                      </span>
                    </div>
                    {expanded ? (
                      <ChevronDown size={16} className="text-muted" />
                    ) : (
                      <ChevronRight size={16} className="text-muted" />
                    )}
                  </button>
                </PanelHeader>
                {expanded && (
                  <PanelBody className="pt-0">
                    <div className="space-y-1">
                      {cat.results.map((r: TestResult, i: number) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 py-1 text-sm"
                        >
                          {r.passed ? (
                            <CheckCircle2
                              size={14}
                              className="text-emerald-500 mt-0.5 shrink-0"
                            />
                          ) : (
                            <XCircle
                              size={14}
                              className="text-red-500 mt-0.5 shrink-0"
                            />
                          )}
                          <span
                            className={
                              r.passed ? "text-muted" : "text-red-400"
                            }
                          >
                            {r.name}
                            {r.detail && (
                              <span className="text-faint ml-2">
                                ({r.detail})
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </PanelBody>
                )}
              </Panel>
            );
          })}
        </>
      )}

      {!result && !loading && !error && (
        <Panel>
          <PanelBody>
            <div className="text-center py-8 text-muted">
              <ShieldCheck size={40} className="mx-auto mb-3 text-faint" />
              <p className="text-sm">
                Click &quot;Run Audit&quot; to test RLS data isolation across
                all tables and storage buckets.
              </p>
            </div>
          </PanelBody>
        </Panel>
      )}
    </div>
  );
}
