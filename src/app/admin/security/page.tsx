"use client";

import { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight,
  Download,
} from "lucide-react";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import type { RlsAuditResponse } from "@/app/api/admin/rls-audit/route";

type TestResult = { name: string; passed: boolean; detail?: string };

export default function SecurityPage() {
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

  function downloadReport() {
    if (!result) return;
    const lines: string[] = [];
    lines.push("RLS AUDIT REPORT");
    lines.push(`Date,${new Date(result.date).toLocaleString()}`);
    lines.push(`Result,${result.totalPassed}/${result.totalTests} passed`);
    lines.push(`Failures,${result.failures.length}`);
    lines.push("");

    for (const cat of result.categories) {
      lines.push(`${cat.name.toUpperCase()} (${cat.passed}/${cat.total})`);
      lines.push("Test,Status,Detail");
      for (const r of cat.results) {
        const detail = r.detail ? `"${r.detail.replace(/"/g, '""')}"` : "";
        lines.push(`"${r.name.replace(/"/g, '""')}",${r.passed ? "PASS" : "FAIL"},${detail}`);
      }
      lines.push("");
    }

    if (result.failures.length > 0) {
      lines.push("FAILURES SUMMARY");
      lines.push("Test,Detail");
      for (const f of result.failures) {
        const detail = f.detail ? `"${f.detail.replace(/"/g, '""')}"` : "";
        lines.push(`"${f.name.replace(/"/g, '""')}",${detail}`);
      }
    }

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rls-audit-${new Date(result.date).toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text">Security</h1>
        <p className="text-sm text-muted mt-1">
          RLS data-isolation testing across tables and storage buckets.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          Creates temporary test users, seeds data, runs cross-user access
          tests, then cleans up. Takes ~30 seconds.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          {result && (
            <Button
              variant="secondary"
              onClick={downloadReport}
              className="gap-2"
            >
              <Download size={16} />
              Download Report
            </Button>
          )}
          <Button
            variant="primary"
            onClick={runAudit}
            disabled={loading}
            className="gap-2"
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
