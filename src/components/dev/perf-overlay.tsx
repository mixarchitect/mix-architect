"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { perf, type PerfMark } from "@/lib/perf";
import { PERF_BUDGETS, toBudgetArray } from "@/lib/perf-budgets";

/* ------------------------------------------------------------------ */
/*  Dev-only performance overlay — visible when ?perf is in URL       */
/* ------------------------------------------------------------------ */

const ACCENT = "#0D9488";

function budgetStatus(
  actual: number,
  budget: number,
): "pass" | "warn" | "fail" {
  if (actual <= budget) return "pass";
  if (actual <= budget * 1.5) return "warn";
  return "fail";
}

const STATUS_COLORS = {
  pass: "#22c55e",
  warn: "#eab308",
  fail: "#ef4444",
};

export function PerfOverlay() {
  const [visible, setVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [marks, setMarks] = useState<PerfMark[]>([]);
  const [tab, setTab] = useState<"marks" | "budgets">("marks");
  const counterRef = useRef(0);

  // Only render if ?perf is in URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    const has = new URLSearchParams(window.location.search).has("perf");
    setVisible(has);

    if (has) {
      // Register budgets
      perf.setBudgets(toBudgetArray());

      // Subscribe to new marks
      const unsub = perf.onMark(() => {
        counterRef.current++;
        setMarks(perf.getReport());
      });
      return unsub;
    }
  }, []);

  const handleExport = useCallback(() => {
    const data = {
      marks: perf.getReport(),
      budgets: perf.checkBudgets(),
      timestamp: new Date().toISOString(),
    };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  }, []);

  const handleClear = useCallback(() => {
    perf.clear();
    setMarks([]);
  }, []);

  if (!visible) return null;

  const violations = perf.checkBudgets();
  const budgetEntries = Object.entries(PERF_BUDGETS);
  const matchingMarks = (metric: string) =>
    marks.filter((m) => m.name === metric);

  if (collapsed) {
    return (
      <div
        style={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 99999,
          background: "#1a1a2e",
          border: `1px solid ${ACCENT}`,
          borderRadius: 8,
          padding: "6px 12px",
          cursor: "pointer",
          color: ACCENT,
          fontSize: 12,
          fontFamily: "monospace",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
        onClick={() => setCollapsed(false)}
      >
        <span>PERF</span>
        <span style={{ color: "#888" }}>{marks.length} marks</span>
        {violations.length > 0 && (
          <span
            style={{
              background: "#ef4444",
              color: "#fff",
              borderRadius: 4,
              padding: "1px 6px",
              fontSize: 10,
            }}
          >
            {violations.length} violations
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 99999,
        width: 400,
        maxHeight: "60vh",
        background: "#1a1a2e",
        border: `1px solid ${ACCENT}33`,
        borderRadius: 10,
        fontFamily: "monospace",
        fontSize: 11,
        color: "#ccc",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 12px",
          borderBottom: "1px solid #333",
          background: ACCENT,
          color: "#fff",
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 12 }}>Performance</span>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={handleExport}
            style={btnStyle}
            title="Copy JSON to clipboard"
          >
            Export
          </button>
          <button onClick={handleClear} style={btnStyle} title="Clear all marks">
            Clear
          </button>
          <button
            onClick={() => setCollapsed(true)}
            style={btnStyle}
            title="Collapse"
          >
            —
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #333",
        }}
      >
        {(["marks", "budgets"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: "6px 0",
              background: "none",
              border: "none",
              color: tab === t ? ACCENT : "#888",
              borderBottom: tab === t ? `2px solid ${ACCENT}` : "2px solid transparent",
              cursor: "pointer",
              fontFamily: "monospace",
              fontSize: 11,
              textTransform: "capitalize",
            }}
          >
            {t}
            {t === "budgets" && violations.length > 0 && (
              <span
                style={{
                  marginLeft: 6,
                  background: "#ef4444",
                  color: "#fff",
                  borderRadius: 4,
                  padding: "0 4px",
                  fontSize: 9,
                }}
              >
                {violations.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ overflowY: "auto", flex: 1 }}>
        {tab === "marks" && (
          <div style={{ padding: 8 }}>
            {marks.length === 0 && (
              <div style={{ color: "#666", padding: 12, textAlign: "center" }}>
                No marks recorded yet
              </div>
            )}
            {marks.map((m, i) => {
              const budget = budgetEntries.find(
                ([, v]) =>
                  typeof v === "number" &&
                  m.name ===
                    toBudgetArray().find(
                      (b) =>
                        b.budget === v,
                    )?.metric,
              );
              const budgetVal = budget ? (budget[1] as number) : null;
              const status =
                budgetVal && m.duration
                  ? budgetStatus(m.duration, budgetVal)
                  : null;

              return (
                <div
                  key={`${m.name}-${i}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "4px 6px",
                    borderBottom: "1px solid #222",
                  }}
                >
                  <span
                    style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    title={m.metadata ? JSON.stringify(m.metadata) : undefined}
                  >
                    {m.name}
                  </span>
                  <span
                    style={{
                      color: status ? STATUS_COLORS[status] : "#aaa",
                      fontWeight: 500,
                      marginLeft: 8,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {m.duration != null
                      ? `${Math.round(m.duration * 10) / 10}ms`
                      : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {tab === "budgets" && (
          <div style={{ padding: 8 }}>
            {toBudgetArray().map((b) => {
              const matching = matchingMarks(b.metric);
              const worst =
                matching.length > 0
                  ? Math.max(...matching.map((m) => m.duration ?? 0))
                  : null;
              const status =
                worst != null ? budgetStatus(worst, b.budget) : null;

              return (
                <div
                  key={b.metric}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "4px 6px",
                    borderBottom: "1px solid #222",
                  }}
                >
                  <span style={{ flex: 1 }}>{b.metric}</span>
                  <span style={{ color: "#888", marginRight: 8 }}>
                    {b.budget}ms
                  </span>
                  <span
                    style={{
                      color: status ? STATUS_COLORS[status] : "#555",
                      fontWeight: 500,
                      minWidth: 60,
                      textAlign: "right",
                    }}
                  >
                    {worst != null
                      ? `${Math.round(worst * 10) / 10}ms`
                      : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.15)",
  border: "none",
  color: "#fff",
  padding: "2px 8px",
  borderRadius: 4,
  cursor: "pointer",
  fontFamily: "monospace",
  fontSize: 10,
};
