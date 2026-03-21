import { getTranslations } from "next-intl/server";
import {
  Calendar,
  FileText,
  Headphones,
  DollarSign,
  Share2,
  CheckCircle2,
  Music,
  MessageSquare,
  Clock,
  Copy,
  Layers,
  Download,
  FolderOpen,
  FileJson,
  Shuffle,
  Play,
  SkipForward,
  GripVertical,
  Radio,
  BarChart3,
  Users,
  ExternalLink,
  TrendingUp,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Section wrapper with alternating direction                         */
/* ------------------------------------------------------------------ */

function FeatureSection({
  id,
  headline,
  body,
  badge,
  badgeColor = "teal",
  visual,
  reverse = false,
}: {
  id?: string;
  headline: string;
  body: string;
  badge?: string;
  badgeColor?: "teal" | "blue" | "orange";
  visual: React.ReactNode;
  reverse?: boolean;
}) {
  const badgeColors = {
    teal: "bg-[#0D9488]/15 text-[#0D9488] border-[#0D9488]/20",
    blue: "bg-[#3B82F6]/15 text-[#60A5FA] border-[#3B82F6]/20",
    orange: "bg-[#FE5E0E]/15 text-[#FF6D22] border-[#FE5E0E]/20",
  };

  return (
    <div
      id={id}
      className={`grid gap-8 lg:gap-16 lg:grid-cols-2 items-center py-20 md:py-28 ${
        reverse ? "lg:[direction:rtl]" : ""
      }`}
    >
      <div className={reverse ? "lg:[direction:ltr]" : ""}>
        {badge && (
          <span
            className={`inline-block mb-4 px-3 py-1 text-xs font-semibold rounded-full border ${badgeColors[badgeColor]}`}
          >
            {badge}
          </span>
        )}
        <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
          {headline}
        </h2>
        <p className="mt-4 text-white/60 leading-relaxed max-w-lg">{body}</p>
      </div>
      <div className={reverse ? "lg:[direction:ltr]" : ""}>{visual}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mock UI components                                                  */
/* ------------------------------------------------------------------ */

function ReleasePlanningMock() {
  const tracks = [
    { title: "Midnight Drive", status: "ready", color: "#22C55E" },
    { title: "Neon Bloom", status: "in progress", color: "#FE5E0E" },
    { title: "Golden Hour", status: "draft", color: "#3B82F6" },
    { title: "Afterglow", status: "draft", color: "#3B82F6" },
  ];

  return (
    <div className="rounded-xl bg-[#1a1a1a] border border-white/8 p-5 shadow-lg">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-xs text-white/60 mb-1">EP &middot; Stereo</div>
          <div className="text-lg font-semibold text-white">
            Late Night Drive
          </div>
          <div className="text-sm text-white/60">Aria Voss</div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Calendar size={14} className="text-[#0D9488]" />
          <span className="text-white/60">Jun 15, 2026</span>
        </div>
      </div>
      <div className="space-y-2">
        {tracks.map((t) => (
          <div
            key={t.title}
            className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-white/4"
          >
            <div className="flex items-center gap-3">
              <Music size={14} className="text-white/60" />
              <span className="text-sm text-white/80">{t.title}</span>
            </div>
            <span
              className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{
                color: t.color,
                background: `${t.color}15`,
              }}
            >
              {t.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WebPortalMock() {
  const tracks = [
    { title: "Midnight Drive", approved: true },
    { title: "Neon Bloom", approved: false },
    { title: "Golden Hour", approved: false },
  ];

  return (
    <div className="rounded-xl bg-[#1a1a1a] border border-white/8 p-5 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-[#0D9488]/30 to-[#3B82F6]/20 flex items-center justify-center">
          <Music size={24} className="text-[#0D9488]" />
        </div>
        <div>
          <div className="text-lg font-semibold text-white">
            Late Night Drive
          </div>
          <div className="text-sm text-white/60">
            Shared by Marcus Chen Audio
          </div>
        </div>
      </div>
      {/* Track list with approval status */}
      <div className="space-y-2 mb-4">
        {tracks.map((t) => (
          <div
            key={t.title}
            className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-white/4"
          >
            <div className="flex items-center gap-3">
              {t.approved ? (
                <CheckCircle2 size={16} className="text-[#22C55E]" />
              ) : (
                <Clock size={16} className="text-white/60" />
              )}
              <span className="text-sm text-white/80">{t.title}</span>
            </div>
            <span
              className={`text-xs font-medium ${
                t.approved ? "text-[#22C55E]" : "text-white/60"
              }`}
            >
              {t.approved ? "Approved" : "Pending review"}
            </span>
          </div>
        ))}
      </div>
      {/* Download gating notice */}
      <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#FE5E0E]/8 border border-[#FE5E0E]/15 mb-3">
        <span className="text-xs text-[#FF6D22]">
          Downloads available after payment
        </span>
        <DollarSign size={12} className="text-[#FE5E0E]" />
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#0D9488]/8 border border-[#0D9488]/15">
        <span className="text-xs text-white/60">
          Powered by Mix Architect
        </span>
        <Share2 size={12} className="text-[#0D9488]" />
      </div>
    </div>
  );
}

function AudioReviewMock() {
  return (
    <div className="rounded-xl bg-[#1a1a1a] border border-white/8 p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold text-white">
          Waveform &middot; v3
        </div>
        <div className="flex items-center gap-1.5">
          {["v1", "v2", "v3"].map((v, i) => (
            <span
              key={v}
              className={`text-xs px-2 py-0.5 rounded-full ${
                i === 2
                  ? "bg-[#0D9488] text-[#1a1a1a] font-semibold"
                  : "bg-white/8 text-white/60"
              }`}
            >
              {v}
            </span>
          ))}
        </div>
      </div>
      {/* Stylized waveform */}
      <div className="relative h-16 mb-4 rounded-lg bg-white/4 overflow-hidden flex items-center px-3 gap-[2px]">
        {Array.from({ length: 60 }).map((_, i) => {
          const h = Math.sin(i * 0.3) * 0.4 + 0.5 + Math.random() * 0.2;
          const isPast = i < 35;
          return (
            <div
              key={i}
              className="flex-1 rounded-full"
              style={{
                height: `${h * 100}%`,
                background: isPast
                  ? "rgba(13,148,136,0.6)"
                  : "rgba(255,255,255,0.15)",
              }}
            />
          );
        })}
        {/* Comment markers */}
        <div
          className="absolute top-1 rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-bold"
          style={{ left: "25%", background: "#FE5E0E", color: "#fff" }}
        >
          1
        </div>
        <div
          className="absolute top-1 rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-bold"
          style={{ left: "58%", background: "#3B82F6", color: "#fff" }}
        >
          2
        </div>
      </div>
      {/* Comments */}
      <div className="space-y-2">
        <div className="flex items-start gap-3 py-2 px-3 rounded-lg bg-white/4">
          <MessageSquare size={14} className="text-[#FE5E0E] shrink-0 mt-0.5" />
          <div>
            <div className="text-xs text-white/60">
              0:47 &middot; Aria Voss
            </div>
            <div className="text-sm text-white/70">
              Vocal feels a bit buried here. Can we push it forward?
            </div>
          </div>
        </div>
        <div className="flex items-start gap-3 py-2 px-3 rounded-lg bg-white/4">
          <MessageSquare size={14} className="text-[#3B82F6] shrink-0 mt-0.5" />
          <div>
            <div className="text-xs text-white/60">
              1:32 &middot; Marcus Chen
            </div>
            <div className="text-sm text-white/70">
              Love the reverb tail on this section.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentsMock() {
  const rows = [
    {
      title: "Late Night Drive",
      client: "Aria Voss",
      amount: "$1,200",
      status: "PAID",
      color: "#22C55E",
    },
    {
      title: "Concrete Jungle",
      client: "Jay Park",
      amount: "$800",
      status: "PARTIAL",
      color: "#FE5E0E",
    },
    {
      title: "Ocean Eyes",
      client: "Luna Ray",
      amount: "$600",
      status: "UNPAID",
      color: "#3B82F6",
    },
  ];

  return (
    <div className="rounded-xl bg-[#1a1a1a] border border-white/8 p-5 shadow-lg">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-lg bg-white/4 p-3 text-center">
          <div className="text-xs text-white/60 mb-1">Outstanding</div>
          <div className="text-lg font-bold text-[#FE5E0E]">$1,400</div>
        </div>
        <div className="rounded-lg bg-white/4 p-3 text-center">
          <div className="text-xs text-white/60 mb-1">Earned</div>
          <div className="text-lg font-bold text-[#22C55E]">$1,200</div>
        </div>
        <div className="rounded-lg bg-white/4 p-3 text-center">
          <div className="text-xs text-white/60 mb-1">Total</div>
          <div className="text-lg font-bold text-white">$2,600</div>
        </div>
      </div>
      {/* Table */}
      <div className="space-y-2">
        {rows.map((r) => (
          <div
            key={r.title}
            className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-white/4"
          >
            <div>
              <div className="text-sm text-white/80">{r.title}</div>
              <div className="text-xs text-white/60">{r.client}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-white/70">{r.amount}</span>
              <span
                className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{
                  color: r.color,
                  background: `${r.color}15`,
                }}
              >
                {r.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TemplatesMock() {
  const templates = [
    {
      name: "Standard EP (4 tracks)",
      artist: "Aria Voss",
      tracks: 4,
      specs: "WAV 24-bit/48kHz",
      tier: "PRO",
    },
    {
      name: "Single Release",
      artist: "Jay Park",
      tracks: 1,
      specs: "WAV 16-bit/44.1kHz",
      tier: "PRO",
    },
    {
      name: "Full Album (10 tracks)",
      artist: "Luna Ray",
      tracks: 10,
      specs: "WAV 24-bit/96kHz",
      tier: "PRO",
    },
  ];

  return (
    <div className="rounded-xl bg-[#1a1a1a] border border-white/8 p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold text-white">
          Saved Templates
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#0D9488]/15 text-[#0D9488]">
          PRO
        </span>
      </div>
      <div className="space-y-2">
        {templates.map((t) => (
          <div
            key={t.name}
            className="py-3 px-3 rounded-lg bg-white/4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0D9488]/12 flex items-center justify-center">
                  <Layers size={14} className="text-[#0D9488]" />
                </div>
                <div>
                  <div className="text-sm text-white/80 font-medium">{t.name}</div>
                  <div className="text-xs text-white/60">{t.artist}</div>
                </div>
              </div>
              <button className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-white/8 text-white/60 hover:bg-white/12 transition-colors flex items-center gap-1">
                <Copy size={10} />
                Apply
              </button>
            </div>
            <div className="flex gap-2 ml-[42px]">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/6 text-white/60">
                {t.tracks} {t.tracks === 1 ? "track" : "tracks"}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/6 text-white/60">
                {t.specs}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0D9488]/12 text-[#0D9488]">
                {t.tier}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DataExportMock() {
  return (
    <div className="rounded-xl bg-[#1a1a1a] border border-white/8 p-5 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0D9488]/12 flex items-center justify-center">
            <Download size={18} className="text-[#0D9488]" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">
              mix-architect-export.zip
            </div>
            <div className="text-xs text-white/60">24.8 MB</div>
          </div>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E]">
          Ready
        </span>
      </div>
      {/* File tree */}
      <div className="rounded-lg bg-white/4 p-3 space-y-1.5 text-[11px]">
        <div className="flex items-center gap-2 text-white/70">
          <FileJson size={12} className="text-[#0D9488] shrink-0" />
          metadata.json
        </div>
        <div className="flex items-center gap-2 text-white/70">
          <FileText size={12} className="text-[#60A5FA] shrink-0" />
          payments.csv
        </div>
        <div className="flex items-center gap-2 text-white/60 mt-1">
          <FolderOpen size={12} className="text-[#0D9488] shrink-0" />
          releases/
        </div>
        <div className="ml-5 space-y-1.5">
          <div className="flex items-center gap-2 text-white/60">
            <FolderOpen size={12} className="text-white/60 shrink-0" />
            Late Night Drive/
          </div>
          <div className="ml-5 space-y-1">
            <div className="flex items-center gap-2 text-white/60">
              <Music size={10} className="text-white/60 shrink-0" />
              01-Midnight Drive/
              <span className="text-white/60">v1.wav, v2.wav</span>
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <Music size={10} className="text-white/60 shrink-0" />
              02-Neon Bloom/
              <span className="text-white/60">v1.wav</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/60">
            <FolderOpen size={12} className="text-white/60 shrink-0" />
            Concrete Jungle/
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowSimulatorMock() {
  const tracks = [
    { title: "Midnight Drive", duration: "3:42", color: "#0D9488", width: "28%" },
    { title: "Neon Bloom", duration: "4:15", color: "#3B82F6", width: "32%" },
    { title: "Golden Hour", duration: "3:18", color: "#FE5E0E", width: "24%" },
    { title: "Afterglow", duration: "2:08", color: "#22C55E", width: "16%" },
  ];

  return (
    <div className="rounded-xl bg-[#1a1a1a] border border-white/8 p-5 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shuffle size={14} className="text-[#0D9488]" />
          <span className="text-sm font-semibold text-white">Flow Simulator</span>
        </div>
        <div className="flex items-center gap-1.5">
          {["Condensed", "Full"].map((m, i) => (
            <span
              key={m}
              className={`text-[10px] px-2 py-0.5 rounded-full ${
                i === 0
                  ? "bg-[#0D9488] text-[#1a1a1a] font-semibold"
                  : "bg-white/8 text-white/60"
              }`}
            >
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* Timeline bar */}
      <div className="flex h-8 rounded-lg overflow-hidden mb-3 gap-[2px]">
        {tracks.map((t) => (
          <div
            key={t.title}
            className="relative flex items-center justify-center"
            style={{ width: t.width, background: `${t.color}25` }}
          >
            <span className="text-[9px] font-medium text-white/60 truncate px-1">
              {t.title}
            </span>
            {/* Playhead indicator on first track */}
            {t.title === "Midnight Drive" && (
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-white/90"
                style={{ left: "60%" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Transport controls */}
      <div className="flex items-center justify-center gap-4 mb-4 py-2">
        <button aria-label="Previous track" className="w-7 h-7 rounded-full bg-white/8 flex items-center justify-center">
          <SkipForward size={12} className="text-white/60 rotate-180" />
        </button>
        <button aria-label="Play" className="w-9 h-9 rounded-full bg-[#0D9488] flex items-center justify-center">
          <Play size={14} className="text-[#1a1a1a] ml-0.5" />
        </button>
        <button aria-label="Next track" className="w-7 h-7 rounded-full bg-white/8 flex items-center justify-center">
          <SkipForward size={12} className="text-white/60" />
        </button>
      </div>

      {/* Track list with drag handles */}
      <div className="space-y-1.5">
        {tracks.map((t, i) => (
          <div
            key={t.title}
            className={`flex items-center gap-3 py-2 px-3 rounded-lg ${
              i === 0 ? "bg-white/8 border border-white/10" : "bg-white/4"
            }`}
          >
            <GripVertical size={12} className="text-white/60 shrink-0" />
            <div
              className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0"
              style={{ background: `${t.color}20`, color: t.color }}
            >
              {i + 1}
            </div>
            <span className={`text-sm flex-1 ${i === 0 ? "text-white" : "text-white/60"}`}>
              {t.title}
            </span>
            <span className="text-xs text-white/60">{t.duration}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DistributionTrackerMock() {
  const platforms = [
    {
      name: "Spotify",
      icon: "/icons/streaming/spotify.svg",
      status: "LIVE",
      color: "#22C55E",
      distributor: "DistroKid",
      auto: true,
    },
    {
      name: "Apple Music",
      icon: "/icons/streaming/apple-music.svg",
      status: "PROCESSING",
      color: "#FE5E0E",
      distributor: "DistroKid",
    },
    {
      name: "Tidal",
      icon: "/icons/streaming/tidal.svg",
      status: "SUBMITTED",
      color: "#3B82F6",
      distributor: "DistroKid",
    },
    {
      name: "Amazon Music",
      icon: "/icons/streaming/amazon-music.svg",
      status: "SUBMITTED",
      color: "#3B82F6",
      distributor: "DistroKid",
    },
    {
      name: "YouTube Music",
      icon: "/icons/streaming/youtube-music.svg",
      status: "NOT SUBMITTED",
      color: "rgba(255,255,255,0.60)",
    },
  ];

  return (
    <div className="rounded-xl bg-[#1a1a1a] border border-white/8 p-5 shadow-lg">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Radio size={14} className="text-[#0D9488]" />
          <span className="text-sm font-semibold text-white">
            Distribution Tracker
          </span>
        </div>
        <button className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-white/8 text-white/60">
          + Add Platform
        </button>
      </div>
      <div className="space-y-2">
        {platforms.map((p) => (
          <div
            key={p.name}
            className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-white/4"
          >
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.icon}
                alt={p.name}
                width={16}
                height={16}
                className="shrink-0"
              />
              <span className="text-sm text-white/80">{p.name}</span>
              {p.auto && (
                <span className="text-[9px] text-[#0D9488]/70 ml-0.5">
                  Auto
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {p.distributor && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/6 text-white/60">
                  {p.distributor}
                </span>
              )}
              <span
                className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{
                  color: p.color,
                  background: `${p.color}15`,
                }}
              >
                {p.status}
              </span>
              {p.status === "LIVE" && (
                <ExternalLink size={10} className="text-white/60" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsMock() {
  const months = [
    { label: "Oct", velocity: 3, revenue: 2400 },
    { label: "Nov", velocity: 5, revenue: 4100 },
    { label: "Dec", velocity: 2, revenue: 1800 },
    { label: "Jan", velocity: 4, revenue: 3200 },
    { label: "Feb", velocity: 6, revenue: 5600 },
    { label: "Mar", velocity: 4, revenue: 3800 },
  ];

  const maxV = Math.max(...months.map((m) => m.velocity));

  return (
    <div className="rounded-xl bg-[#1a1a1a] border border-white/8 p-5 shadow-lg">
      {/* KPI row */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          {
            label: "Releases",
            value: "24",
            icon: BarChart3,
            color: "#0D9488",
          },
          {
            label: "Avg Turnaround",
            value: "8.2d",
            icon: Clock,
            color: "#3B82F6",
          },
          {
            label: "Revenue",
            value: "$21k",
            icon: DollarSign,
            color: "#22C55E",
          },
          { label: "Clients", value: "12", icon: Users, color: "#FE5E0E" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-lg bg-white/4 p-3 text-center"
          >
            <kpi.icon
              size={14}
              className="mx-auto mb-1.5"
              style={{ color: kpi.color }}
            />
            <div className="text-lg font-bold text-white">{kpi.value}</div>
            <div className="text-[10px] text-white/60">{kpi.label}</div>
          </div>
        ))}
      </div>
      {/* Release velocity bar chart */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-3">
          <TrendingUp size={12} className="text-[#0D9488]" />
          <span className="text-xs text-white/60 font-medium">
            Release Velocity
          </span>
        </div>
        <div className="flex items-end gap-2 h-20">
          {months.map((m) => (
            <div key={m.label} className="flex-1 flex flex-col items-center">
              <div
                className="w-full rounded-t"
                style={{
                  height: `${(m.velocity / maxV) * 100}%`,
                  background:
                    m.label === "Feb"
                      ? "#0D9488"
                      : "rgba(13,148,136,0.3)",
                }}
              />
              <span className="text-[9px] text-white/60 mt-1.5">
                {m.label}
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* Client table */}
      <div className="space-y-1.5">
        {[
          { name: "Aria Voss", releases: 8, revenue: "$9.6k" },
          { name: "Jay Park", releases: 6, revenue: "$5.4k" },
          { name: "Luna Ray", releases: 4, revenue: "$3.2k" },
        ].map((c) => (
          <div
            key={c.name}
            className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/4"
          >
            <span className="text-xs text-white/70">{c.name}</span>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-white/60">
                {c.releases} releases
              </span>
              <span className="text-xs font-medium text-[#22C55E]">
                {c.revenue}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export async function FeatureShowcase() {
  const t = await getTranslations("landing");
  return (
    <section id="features" aria-label="Features" className="px-6">
      <div className="mx-auto max-w-6xl">
        <FeatureSection
          headline={t("featureReleasePlanning")}
          body={t("featureReleasePlanningDesc")}
          visual={<ReleasePlanningMock />}
        />

        <FeatureSection
          headline={t("featureClientDelivery")}
          body={t("featureClientDeliveryDesc")}
          badge={t("featureClientDeliveryBadge")}
          visual={<WebPortalMock />}
          reverse
        />

        <FeatureSection
          headline={t("featureAudioReview")}
          body={t("featureAudioReviewDesc")}
          visual={<AudioReviewMock />}
        />

        <FeatureSection
          headline={t("featureFlowSim")}
          body={t("featureFlowSimDesc")}
          badge={t("featureFlowSimBadge")}
          badgeColor="blue"
          visual={<FlowSimulatorMock />}
          reverse
        />

        <FeatureSection
          headline={t("featurePayments")}
          body={t("featurePaymentsDesc")}
          badge={t("featurePaymentsBadge")}
          badgeColor="orange"
          visual={<PaymentsMock />}
        />

        <FeatureSection
          headline={t("featureDistribution")}
          body={t("featureDistributionDesc")}
          badge={t("featureDistributionBadge")}
          badgeColor="teal"
          visual={<DistributionTrackerMock />}
          reverse
        />

        <FeatureSection
          headline={t("featureAnalytics")}
          body={t("featureAnalyticsDesc")}
          badge={t("featureAnalyticsBadge")}
          badgeColor="blue"
          visual={<AnalyticsMock />}
        />

        <FeatureSection
          headline={t("featureTemplates")}
          body={t("featureTemplatesDesc")}
          badge={t("featureTemplatesBadge")}
          badgeColor="blue"
          visual={<TemplatesMock />}
          reverse
        />

        <FeatureSection
          headline={t("featureExport")}
          body={t("featureExportDesc")}
          badge={t("featureExportBadge")}
          visual={<DataExportMock />}
        />
      </div>
    </section>
  );
}
