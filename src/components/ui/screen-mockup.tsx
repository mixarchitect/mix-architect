"use client";

import {
  Home,
  Search,
  LayoutTemplate,
  Settings,
  HelpCircle,
  Image,
  Music,
  Play,
  ChevronDown,
  Send,
  ArrowRight,
  RefreshCw,
  MessageSquare,
  Plus,
  Check,
  Disc3,
  Download,
  ArrowUpCircle,
  Bell,
  MapPin,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/cn";

/* ──────────────────────────────────────────────────────
   SHARED PRIMITIVES
   ────────────────────────────────────────────────────── */

function MockBtn({
  children,
  accent,
}: {
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-medium whitespace-nowrap",
        accent
          ? "bg-signal text-signal-on"
          : "border border-border bg-panel text-muted",
      )}
    >
      {children}
    </span>
  );
}

function MockPill({
  children,
  color,
}: {
  children: React.ReactNode;
  color?: "blue" | "orange" | "green";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-px rounded-full text-[8px] font-medium whitespace-nowrap",
        color === "blue" && "bg-status-blue/15 text-status-blue",
        color === "orange" && "bg-status-orange/15 text-status-orange",
        color === "green" && "bg-status-green/15 text-status-green",
        !color && "border border-border bg-panel2 text-muted",
      )}
    >
      {children}
    </span>
  );
}

function MockDot({ color }: { color: "blue" | "orange" | "green" }) {
  return (
    <span
      className={cn(
        "w-1.5 h-1.5 rounded-full shrink-0",
        color === "blue" && "bg-status-blue",
        color === "orange" && "bg-status-orange",
        color === "green" && "bg-status-green",
      )}
    />
  );
}

function MockAvatar({ initials }: { initials: string }) {
  return (
    <span className="w-4 h-4 rounded-full bg-signal text-signal-on text-[7px] font-bold flex items-center justify-center shrink-0">
      {initials}
    </span>
  );
}

function MockInput({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center px-2 py-1 rounded border border-border bg-panel text-[9px] text-faint flex-1 min-w-0 truncate">
      {text}
    </span>
  );
}

function MockSelect({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded border border-border bg-panel text-[9px] text-text whitespace-nowrap">
      {text}
      <ChevronDown size={8} className="text-faint" />
    </span>
  );
}

/* ──────────────────────────────────────────────────────
   WAVEFORM BARS (reused in audio mockups)
   ────────────────────────────────────────────────────── */

const BAR_HEIGHTS = [4, 8, 14, 18, 12, 6, 10, 16, 20, 14, 8, 12, 18, 10, 6, 14, 16, 8, 12, 10, 7, 15, 11, 9];

function WaveformBars({ highlight }: { highlight?: number }) {
  return (
    <div className="flex items-end gap-px h-5">
      {BAR_HEIGHTS.map((h, i) => (
        <div
          key={i}
          className={cn(
            "w-[3px] rounded-full",
            highlight !== undefined && i <= highlight
              ? "bg-signal"
              : "bg-signal/30",
          )}
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────
   1. DASHBOARD
   ────────────────────────────────────────────────────── */

function DashboardMockup() {
  const releases = [
    { title: "Late Night EP", artist: "Nora Chen", status: "green" as const, type: "EP" },
    { title: "Summer Single", artist: "Alex Rivera", status: "orange" as const, type: "Single" },
    { title: "Demo Reel", artist: "Jay Park", status: "blue" as const, type: "Album" },
  ];

  return (
    <div className="flex">
      {/* Rail */}
      <div className="w-7 shrink-0 border-r border-border bg-panel flex flex-col items-center gap-2.5 py-3">
        <Home size={10} className="text-signal" />
        <Search size={10} className="text-faint" />
        <LayoutTemplate size={10} className="text-faint" />
        <Settings size={10} className="text-faint" />
        <HelpCircle size={10} className="text-faint" />
      </div>
      {/* Main */}
      <div className="flex-1 p-3">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[10px] font-semibold text-text">Your Releases</span>
          <MockBtn accent>+ New Release</MockBtn>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {releases.map((r) => (
            <div key={r.title} className="border border-border bg-panel rounded p-2">
              <div className="w-full aspect-square rounded bg-panel2 flex items-center justify-center mb-1.5">
                <Music size={12} className="text-faint" />
              </div>
              <p className="text-[9px] font-medium text-text truncate">{r.title}</p>
              <p className="text-[8px] text-muted truncate">{r.artist}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <MockDot color={r.status} />
                <MockPill>{r.type}</MockPill>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────
   2. RELEASE DETAIL
   ────────────────────────────────────────────────────── */

function ReleaseDetailMockup() {
  const tracks = [
    { num: 1, title: "Opening", status: "green" as const },
    { num: 2, title: "Midnight Drive", status: "orange" as const },
    { num: 3, title: "Outro", status: "blue" as const },
  ];

  return (
    <div className="flex gap-3 p-3">
      {/* Sidebar */}
      <div className="w-24 shrink-0 space-y-2">
        <div className="w-full aspect-square rounded bg-panel2 border border-border flex items-center justify-center">
          <Image size={16} className="text-faint" />
        </div>
        <div className="flex items-center gap-1">
          <MockDot color="orange" />
          <span className="text-[9px] text-muted">In Progress</span>
        </div>
      </div>
      {/* Main */}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-text">Midnight Sessions</p>
        <p className="text-[9px] text-muted mb-2">Alex Rivera</p>
        <div className="space-y-1.5">
          {tracks.map((t) => (
            <div key={t.num} className="flex items-center gap-2 border border-border rounded px-2 py-1.5 bg-panel">
              <span className="text-[9px] text-faint w-3 text-right">{t.num}</span>
              <span className="text-[10px] text-text flex-1 truncate">{t.title}</span>
              <MockDot color={t.status} />
            </div>
          ))}
        </div>
        <div className="mt-2">
          <MockBtn>+ Add Track</MockBtn>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────
   3. COLLABORATOR PANEL
   ────────────────────────────────────────────────────── */

function CollaboratorPanelMockup() {
  const members = [
    { name: "Sarah Kim", role: "Producer", initials: "SK" },
    { name: "Marcus Lee", role: "Engineer", initials: "ML" },
  ];

  return (
    <div className="p-3 space-y-3">
      {/* Invite row */}
      <div className="flex items-center gap-2">
        <MockInput text="engineer@studio.com" />
        <MockSelect text="Engineer" />
        <MockBtn accent>
          <Send size={8} />
          Invite
        </MockBtn>
      </div>
      {/* Member list */}
      <div className="space-y-1.5">
        {members.map((m) => (
          <div key={m.name} className="flex items-center gap-2 border border-border rounded px-2 py-1.5 bg-panel">
            <MockAvatar initials={m.initials} />
            <span className="text-[10px] text-text flex-1">{m.name}</span>
            <MockPill>{m.role}</MockPill>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────
   4. AUDIO PLAYER
   ────────────────────────────────────────────────────── */

function AudioPlayerMockup() {
  return (
    <div className="p-3 space-y-2.5">
      {/* Version selector */}
      <div className="flex items-center justify-between">
        <MockSelect text="v3 (latest)" />
        <span className="text-[8px] text-faint">mix-v3-final.wav</span>
      </div>
      {/* Waveform */}
      <div className="bg-panel2 rounded p-2">
        <WaveformBars highlight={14} />
      </div>
      {/* Controls */}
      <div className="flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-signal text-signal-on flex items-center justify-center">
          <Play size={10} fill="currentColor" />
        </span>
        <span className="text-[9px] text-muted">1:24 / 3:42</span>
        <span className="flex-1" />
        <span className="text-[8px] text-faint">24.3 MB</span>
        <span className="text-[8px] text-faint">48kHz / 24-bit</span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────
   5. FORMAT CONVERTER
   ────────────────────────────────────────────────────── */

function FormatConverterMockup() {
  return (
    <div className="p-3 space-y-2.5">
      <div className="flex items-center gap-2 flex-wrap">
        <MockPill>WAV 48kHz / 24-bit</MockPill>
        <ArrowRight size={10} className="text-faint" />
        <MockSelect text="FLAC" />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[9px] text-muted">Bit Depth</span>
        <MockSelect text="16-bit" />
      </div>
      <div className="flex items-center gap-2">
        <MockBtn accent>
          <RefreshCw size={8} />
          Convert
        </MockBtn>
        <span className="text-[8px] text-faint">Output: ~18.2 MB</span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────
   6. TIMESTAMPED COMMENTS
   ────────────────────────────────────────────────────── */

function TimestampedCommentsMockup() {
  const comments = [
    { initials: "SK", time: "0:42", text: "Bring up the vocals here", color: "bg-signal" },
    { initials: "ML", time: "1:18", text: "Snare feels a bit loud", color: "bg-status-orange" },
    { initials: "AR", time: "2:05", text: "Love this section", color: "bg-status-blue" },
  ];

  return (
    <div className="p-3 space-y-2.5">
      {/* Waveform with markers */}
      <div className="bg-panel2 rounded p-2 relative">
        <WaveformBars />
        {/* Markers */}
        <div className="absolute top-1 left-[22%] w-1.5 h-1.5 rounded-full bg-signal" />
        <div className="absolute top-1 left-[48%] w-1.5 h-1.5 rounded-full bg-status-orange" />
        <div className="absolute top-1 left-[72%] w-1.5 h-1.5 rounded-full bg-status-blue" />
      </div>
      {/* Comment list */}
      <div className="space-y-1.5">
        {comments.map((c) => (
          <div key={c.time} className="flex items-start gap-2">
            <MockAvatar initials={c.initials} />
            <span className="px-1 py-px rounded bg-panel border border-border text-[8px] text-muted font-medium shrink-0">
              {c.time}
            </span>
            <span className="text-[9px] text-muted">{c.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────
   7. TASK LIST
   ────────────────────────────────────────────────────── */

function TaskListMockup() {
  const tasks = [
    { title: "Record final vocal take", assignee: "SK", status: "To Do", color: "blue" as const },
    { title: "Mix bass and drums", assignee: "ML", status: "In Progress", color: "orange" as const },
    { title: "Export stems", assignee: "AR", status: "Done", color: "green" as const, done: true },
  ];

  return (
    <div className="p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-text">Tasks</span>
        <MockBtn>
          <Plus size={8} />
          Add Task
        </MockBtn>
      </div>
      <div className="space-y-1.5">
        {tasks.map((t) => (
          <div key={t.title} className="flex items-center gap-2 border border-border rounded px-2 py-1.5 bg-panel">
            <span
              className={cn(
                "w-3 h-3 rounded-sm border flex items-center justify-center shrink-0",
                t.done ? "bg-signal border-signal" : "border-border",
              )}
            >
              {t.done && <Check size={8} className="text-signal-on" />}
            </span>
            <span className={cn("text-[10px] flex-1 truncate", t.done ? "text-faint line-through" : "text-text")}>
              {t.title}
            </span>
            <MockAvatar initials={t.assignee} />
            <MockPill color={t.color}>{t.status}</MockPill>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────
   8. TASK STATUS FLOW (kanban)
   ────────────────────────────────────────────────────── */

function TaskStatusFlowMockup() {
  const columns = [
    {
      title: "To Do",
      color: "blue" as const,
      tasks: ["Update liner notes", "Finalize tracklist"],
    },
    {
      title: "In Progress",
      color: "orange" as const,
      tasks: ["Mix revisions"],
    },
    {
      title: "Done",
      color: "green" as const,
      tasks: ["Record vocals", "Export stems"],
    },
  ];

  return (
    <div className="p-3">
      <div className="grid grid-cols-3 gap-2">
        {columns.map((col) => (
          <div key={col.title}>
            <div className="flex items-center gap-1 mb-1.5">
              <MockDot color={col.color} />
              <span className="text-[9px] font-semibold text-text">{col.title}</span>
              <span className="text-[8px] text-faint">{col.tasks.length}</span>
            </div>
            <div className="space-y-1">
              {col.tasks.map((task) => (
                <div key={task} className="border border-border rounded p-1.5 bg-panel">
                  <span className="text-[9px] text-text">{task}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────
   9. MULTI-RELEASE TIMELINE
   ────────────────────────────────────────────────────── */

function MultiReleaseTimelineMockup() {
  const months = ["Jan", "Feb", "Mar", "Apr"];
  const releases = [
    { title: "Late Night EP", left: "5%", width: "55%", color: "bg-status-green" },
    { title: "Summer Single", left: "30%", width: "40%", color: "bg-status-orange" },
    { title: "Demo Reel", left: "60%", width: "30%", color: "bg-status-blue" },
  ];

  return (
    <div className="p-3">
      {/* Month headers */}
      <div className="flex mb-1">
        {months.map((m) => (
          <span key={m} className="flex-1 text-[8px] text-faint text-center">
            {m}
          </span>
        ))}
      </div>
      {/* Grid + bars */}
      <div className="relative border-t border-border">
        {/* Grid lines */}
        <div className="absolute inset-0 flex">
          {months.map((m) => (
            <div key={m} className="flex-1 border-r border-border last:border-r-0" />
          ))}
        </div>
        {/* Today line */}
        <div className="absolute top-0 bottom-0 left-[38%] w-px bg-signal z-10" />
        {/* Release bars */}
        <div className="relative space-y-1.5 py-2 px-1">
          {releases.map((r) => (
            <div key={r.title} className="relative h-5">
              <div
                className={cn("absolute top-0 h-full rounded-full flex items-center px-2", r.color)}
                style={{ left: r.left, width: r.width }}
              >
                <span className="text-[8px] font-medium text-white truncate">{r.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────
   10. TIMELINE MILESTONES
   ────────────────────────────────────────────────────── */

function TimelineMilestonesMockup() {
  const milestones = [
    { label: "Mix Due", position: "20%" },
    { label: "Master Due", position: "55%" },
    { label: "Release Date", position: "85%" },
  ];

  return (
    <div className="p-3 pt-4">
      {/* Month headers */}
      <div className="flex mb-1">
        {["Jan", "Feb", "Mar", "Apr"].map((m) => (
          <span key={m} className="flex-1 text-[8px] text-faint text-center">
            {m}
          </span>
        ))}
      </div>
      {/* Bar with milestones */}
      <div className="relative h-3 bg-status-blue/20 rounded-full mx-2">
        <div className="absolute inset-y-0 left-0 w-[45%] bg-status-blue rounded-full" />
        {milestones.map((ms) => (
          <div key={ms.label} className="absolute top-1/2 -translate-y-1/2" style={{ left: ms.position }}>
            <div className="w-2.5 h-2.5 rotate-45 rounded-sm bg-signal border border-panel -translate-x-1/2" />
          </div>
        ))}
      </div>
      {/* Labels */}
      <div className="relative h-4 mx-2 mt-1">
        {milestones.map((ms) => (
          <span
            key={ms.label}
            className="absolute text-[8px] text-muted -translate-x-1/2 whitespace-nowrap"
            style={{ left: ms.position }}
          >
            {ms.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────
   11. TEMPLATE SELECTION
   ────────────────────────────────────────────────────── */

function TemplateSelectionMockup() {
  const templates = [
    { name: "Album Master", desc: "Standard album workflow", tags: ["Album", "Stereo"] },
    { name: "Single Release", desc: "Quick single setup", tags: ["Single", "Stereo"] },
    { name: "Podcast Episode", desc: "Podcast with chapters", tags: ["EP", "Mono"] },
  ];

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[10px] font-semibold text-text">Templates</span>
        <MockBtn accent>
          <Plus size={8} />
          New Template
        </MockBtn>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {templates.map((t) => (
          <div key={t.name} className="border border-border bg-panel rounded p-2 space-y-1">
            <div className="flex items-center gap-1">
              <LayoutTemplate size={10} className="text-signal" />
              <span className="text-[9px] font-semibold text-text truncate">{t.name}</span>
            </div>
            <p className="text-[8px] text-muted truncate">{t.desc}</p>
            <div className="flex gap-1">
              {t.tags.map((tag) => (
                <MockPill key={tag}>{tag}</MockPill>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────
   12. EXPORT DATA
   ────────────────────────────────────────────────────── */

function ExportDataMockup() {
  const stats = [
    { icon: Disc3, label: "Releases", value: "12" },
    { icon: Music, label: "Tracks", value: "47" },
    { icon: Download, label: "Audio Files", value: "23" },
  ];

  return (
    <div className="p-3 space-y-2.5">
      <span className="text-[10px] font-semibold text-text">Export My Data</span>
      <div className="grid grid-cols-3 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="border border-border bg-panel rounded p-2 text-center">
            <s.icon size={12} className="text-signal mx-auto mb-1" />
            <p className="text-[11px] font-semibold text-text">{s.value}</p>
            <p className="text-[8px] text-muted">{s.label}</p>
          </div>
        ))}
      </div>
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="h-1.5 bg-panel2 rounded-full overflow-hidden">
          <div className="h-full w-[65%] bg-signal rounded-full" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[8px] text-faint">Preparing export...</span>
          <MockBtn accent>
            <Download size={8} />
            Download
          </MockBtn>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────
   13. SUBSCRIPTION PAGE
   ────────────────────────────────────────────────────── */

function SubscriptionPageMockup() {
  const features = [
    "Unlimited releases",
    "Audio format conversion",
    "Priority support",
    "Advanced export",
  ];

  return (
    <div className="p-3 space-y-2.5">
      <div className="flex items-center gap-2">
        <MockPill color="blue">Free</MockPill>
        <ArrowRight size={10} className="text-faint" />
        <span className="inline-flex items-center gap-1 px-1.5 py-px rounded-full text-[8px] font-bold bg-signal text-signal-on">
          Pro
        </span>
        <span className="text-[10px] text-muted">$12/month</span>
      </div>
      <div className="space-y-1">
        {features.map((f) => (
          <div key={f} className="flex items-center gap-1.5">
            <Check size={10} className="text-signal shrink-0" />
            <span className="text-[9px] text-text">{f}</span>
          </div>
        ))}
      </div>
      <MockBtn accent>
        <ArrowUpCircle size={8} />
        Upgrade to Pro
      </MockBtn>
    </div>
  );
}

/* ──────────────────────────────────────────────────────
   14. CANCELLATION FLOW
   ────────────────────────────────────────────────────── */

function CancellationFlowMockup() {
  return (
    <div className="p-3 space-y-2.5">
      <div className="border border-status-orange/30 bg-status-orange/5 rounded-lg p-2.5 space-y-1.5">
        <span className="text-[10px] font-semibold text-text">Subscription Cancelled</span>
        <p className="text-[9px] text-muted">Your Pro access continues until Mar 15, 2026.</p>
        <div className="flex items-center gap-1.5">
          <Check size={10} className="text-signal shrink-0" />
          <span className="text-[9px] text-muted">Your data is preserved</span>
        </div>
      </div>
      <MockBtn accent>
        <RefreshCw size={8} />
        Resubscribe
      </MockBtn>
    </div>
  );
}

/* ──────────────────────────────────────────────────────
   MOCKUP REGISTRY
   ────────────────────────────────────────────────────── */

const MOCKUPS: Record<string, () => React.ReactNode> = {
  dashboard: DashboardMockup,
  "release-detail": ReleaseDetailMockup,
  "collaborator-panel": CollaboratorPanelMockup,
  "audio-player": AudioPlayerMockup,
  "format-converter": FormatConverterMockup,
  "timestamped-comments": TimestampedCommentsMockup,
  "task-list": TaskListMockup,
  "task-status-flow": TaskStatusFlowMockup,
  "multi-release-timeline": MultiReleaseTimelineMockup,
  "timeline-milestones": TimelineMilestonesMockup,
  "template-selection": TemplateSelectionMockup,
  "export-data": ExportDataMockup,
  "subscription-page": SubscriptionPageMockup,
  "cancellation-flow": CancellationFlowMockup,
};

/* ──────────────────────────────────────────────────────
   PUBLIC COMPONENT
   ────────────────────────────────────────────────────── */

type Props = { mockupId: string };

export function ScreenMockup({ mockupId }: Props) {
  const render = MOCKUPS[mockupId];
  if (!render) return null;
  return (
    <div
      className="my-5 rounded-lg border border-border bg-panel2 overflow-hidden select-none"
      aria-hidden="true"
    >
      {render()}
    </div>
  );
}
