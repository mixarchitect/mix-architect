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
} from "lucide-react";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import type { RlsAuditResponse } from "@/app/api/admin/rls-audit/route";

type TestResult = { name: string; passed: boolean; detail?: string };

export default function RlsAuditPage() {
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">RLS Security Audit</h1>
          <p className="text-sm text-muted mt-1">
            Tests data isolation across all Supabase tables and storage buckets.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={runAudit}
          disabled={loading}
          className="gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Running Audit...
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
                    {allPassed ? " — All Clear" : ` — ${result.failures.length} failure(s)`}
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
                      <span className="font-medium text-text">
                        {cat.name}
                      </span>
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
                Click "Run Audit" to test RLS data isolation across all tables and
                storage buckets.
              </p>
              <p className="text-xs text-faint mt-2">
                The audit creates temporary test users, seeds data, runs
                cross-user access tests, then cleans up. Takes ~30 seconds.
              </p>
            </div>
          </PanelBody>
        </Panel>
      )}
    </div>
  );
}
