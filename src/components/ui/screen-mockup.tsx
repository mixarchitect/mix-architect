"use client";

/* ═══════════════════════════════════════════════════════════
   SCREEN MOCKUP — Help article visual aids using real components
   74 mockups (18 articles)
   ═══════════════════════════════════════════════════════════ */

import {
  Home, Search, LayoutTemplate, Settings, HelpCircle,
  Image, Music, Play, ChevronDown, Send, ArrowRight, Pencil,
  MessageSquare, MessageCircle, Plus, Check, X,
  Disc3, Download, ArrowUpCircle, Globe, Share2,
  Calendar, Upload, GripVertical, Copy, Link2,
  Shield, CreditCard, CheckCircle2, Clock,
  ClipboardList, FileText, Users, Sparkles, Eye,
  ExternalLink, BarChart3, DollarSign,
  Sun, Moon, Monitor, Mail, Gift,
  RefreshCw, User, Trash2, UserPlus,
  Pause, Square, Star,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { StatusDot, StatusIndicator } from "@/components/ui/status-dot";
import { StatTile } from "@/components/ui/stat-tile";
import { EmptyState } from "@/components/ui/empty-state";
import { DataGrid, DataCell } from "@/components/ui/data-grid";
import { Rule } from "@/components/ui/rule";
import { AccentPanel } from "@/components/ui/accent-panel";

/* ───────────────────────────────────────────────────────
   SHARED: Visual-only clones (for components with side effects)
   ─────────────────────────────────────────────────────── */

function MockReleaseCard({ title, artist, type, status, tracks, completed, time }: {
  title: string; artist: string; type: string; status: "blue" | "orange" | "green";
  tracks: number; completed: number; time: string;
}) {
  return (
    <div className="card px-5 py-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-md shrink-0 flex items-center justify-center" style={{ background: "var(--panel2)" }}>
          <Music size={18} className="text-muted opacity-30" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-base font-semibold text-text truncate">{title}</div>
          <div className="mt-0.5 text-sm text-muted truncate">{artist}</div>
        </div>
        <StatusDot color={status} />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Pill>{type}</Pill>
        <Pill>Stereo</Pill>
      </div>
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted">
        <span>{completed} of {tracks} tracks briefed</span>
        <span>{time}</span>
      </div>
    </div>
  );
}

function MockTrackRow({ num, title, status, intent }: {
  num: number; title: string; status: "blue" | "orange" | "green"; intent?: string;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 rounded-md border border-border bg-panel">
      <span className="w-8 text-right text-sm font-medium text-faint shrink-0">
        {String(num).padStart(2, "0")}
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-text text-sm truncate">{title}</div>
        {intent && <div className="mt-0.5 text-xs text-muted truncate">{intent}</div>}
      </div>
      <StatusDot color={status} />
    </div>
  );
}

function MockAvatar({ initials, size = "md", color }: { initials: string; size?: "sm" | "md"; color?: string }) {
  return (
    <span
      className={cn(
        "rounded-full font-bold flex items-center justify-center shrink-0",
        !color && "bg-signal text-signal-on",
        size === "sm" ? "w-5 h-5 text-[8px]" : "w-6 h-6 text-[10px]",
      )}
      style={color ? { backgroundColor: color, color: "#fff" } : undefined}
    >
      {initials}
    </span>
  );
}

function MockInput({ text, className, placeholder }: { text: string; className?: string; placeholder?: boolean }) {
  return (
    <div className={cn("input min-w-0", className)} style={{ pointerEvents: "none" }}>
      {placeholder ? <span className="text-faint">{text}</span> : text}
    </div>
  );
}

function MockSelect({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn("input relative min-w-0", className)} style={{ pointerEvents: "none", paddingRight: 40 }}>
      {text}
      <ChevronDown size={14} className="text-faint absolute right-3.5 top-1/2 -translate-y-1/2" />
    </div>
  );
}

const BAR_HEIGHTS = [4, 8, 14, 20, 16, 8, 12, 18, 24, 16, 10, 14, 20, 12, 8, 16, 18, 10, 14, 12, 9, 17, 13, 11];

/* Dense waveform data: ~80 bars simulating a real audio waveform with quiet intro, loud middle, and fade-out */
const DENSE_BARS = [
  3, 5, 4, 6, 8, 5, 7, 10, 8, 6, 9, 12, 10, 8, 11, 14, 12, 9, 13, 16,
  14, 11, 15, 18, 16, 13, 10, 14, 17, 20, 18, 15, 19, 22, 20, 17, 21, 24, 22, 19,
  16, 20, 23, 18, 21, 24, 22, 19, 23, 20, 17, 22, 24, 21, 18, 23, 20, 16, 19, 22,
  18, 14, 17, 20, 16, 12, 15, 18, 14, 10, 13, 16, 12, 8, 11, 9, 6, 8, 5, 4,
];

function WaveformBars({ highlight, className, mirrored }: { highlight?: number; className?: string; mirrored?: boolean }) {
  const bars = mirrored ? DENSE_BARS : BAR_HEIGHTS;
  if (mirrored) {
    return (
      <div className={cn("flex items-center gap-[1px] h-12", className)}>
        {bars.map((h, i) => {
          const active = highlight !== undefined && i <= highlight;
          const color = active ? "bg-signal" : "bg-signal/30";
          const top = h * 0.85;
          const bot = h * 0.55;
          return (
            <div key={i} className="flex flex-col items-center gap-[1px] flex-1">
              <div className={cn("w-full max-w-[3px] rounded-sm", color)} style={{ height: `${top}px` }} />
              <div className={cn("w-full max-w-[3px] rounded-sm", color)} style={{ height: `${bot}px` }} />
            </div>
          );
        })}
      </div>
    );
  }
  return (
    <div className={cn("flex items-end gap-[2px] h-8", className)}>
      {bars.map((h, i) => (
        <div
          key={i}
          className={cn(
            "w-1 rounded-full",
            highlight !== undefined && i <= highlight ? "bg-signal" : "bg-signal/30",
          )}
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  );
}

function MockNoteEntry({ author, time, content, isClient }: {
  author: string; time: string; content: string; isClient?: boolean;
}) {
  return (
    <div className={cn("py-4", isClient && "pl-3 border-l-2 border-signal/40")}>
      <div className="flex items-center gap-2 text-xs text-muted mb-2">
        <span className="font-medium">{author}</span>
        {isClient && <span className="text-[9px] font-medium text-signal bg-signal-muted px-1.5 py-0.5 rounded-full">Client</span>}
        <span>&middot;</span>
        <span className="text-faint">{time}</span>
      </div>
      <p className="text-sm text-text leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ARTICLE 1: WELCOME TO MIX ARCHITECT (3 mockups)
   ═══════════════════════════════════════════════════════════ */

function DashboardMockup() {
  return (
    <>
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-text">Your Releases</span>
          <Button variant="primary">+ New Release</Button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <MockReleaseCard title="Late Night EP" artist="Nora Chen" type="EP" status="green" tracks={5} completed={5} time="2h ago" />
          <MockReleaseCard title="Summer Single" artist="Alex Rivera" type="Single" status="orange" tracks={1} completed={0} time="1d ago" />
          <MockReleaseCard title="Demo Reel" artist="Jay Park" type="Album" status="blue" tracks={8} completed={3} time="3d ago" />
        </div>
      </div>
    </>
  );
}

function NavRailMockup() {
  const items = [
    { icon: Home, label: "Dashboard", active: true },
    { icon: Search, label: "Search", active: false },
    { icon: LayoutTemplate, label: "Templates", active: false },
    { icon: Settings, label: "Settings", active: false },
    { icon: HelpCircle, label: "Help", active: false },
  ];
  return (
    <>
      <div className="flex">
        <div className="w-48 border-r border-border bg-panel py-4 px-3 space-y-1">
          {items.map((item) => (
            <div
              key={item.label}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                item.active ? "bg-signal-muted text-signal" : "text-muted",
              )}
            >
              <item.icon size={18} strokeWidth={1.5} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        <div className="flex-1 p-6">
          <span className="text-lg font-semibold text-text">Your Releases</span>
          <p className="text-sm text-muted mt-1">Click any release to open it</p>
        </div>
      </div>
    </>
  );
}

function KeyConceptsMockup() {
  return (
    <>
      <div className="p-4 space-y-3">
        <Panel variant="flat" className="px-5 py-4 border-border border">
          <div className="flex items-center gap-3 mb-4">
            <Disc3 size={20} className="text-signal" />
            <span className="text-base font-semibold text-text">Release</span>
            <StatusIndicator color="orange" label="In Progress" />
          </div>
          <div className="ml-8 space-y-2">
            {[
              { icon: Music, label: "Tracks", desc: "Audio versions, comments, exports" },
              { icon: FileText, label: "Brief", desc: "Mix direction and references" },
              { icon: ClipboardList, label: "Specs", desc: "Technical settings and delivery" },
              { icon: Users, label: "Collaborators", desc: "Team members and roles" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 py-2 px-3 rounded-md border border-border bg-panel">
                <item.icon size={16} className="text-muted shrink-0" />
                <div>
                  <span className="text-sm font-medium text-text">{item.label}</span>
                  <span className="text-xs text-muted ml-2">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   ARTICLE 2: CREATING YOUR FIRST RELEASE (4 mockups)
   ═══════════════════════════════════════════════════════════ */

function CreateReleaseMockup() {
  return (
    <>
      <Panel className="m-4">
        <PanelHeader><span className="text-base font-semibold text-text">New Release</span></PanelHeader>
        <PanelBody className="pt-6 space-y-4">
          <div>
            <label className="label text-xs text-faint mb-1.5 block">TITLE</label>
            <MockInput text="Midnight Sessions" className="w-full" />
          </div>
          <div>
            <label className="label text-xs text-faint mb-1.5 block">ARTIST</label>
            <MockInput text="Alex Rivera" className="w-full" />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="label text-xs text-faint mb-1.5 block">TYPE</label>
              <MockSelect text="EP" />
            </div>
            <div className="flex-1">
              <label className="label text-xs text-faint mb-1.5 block">FORMAT</label>
              <MockSelect text="Stereo" />
            </div>
          </div>
          <Button variant="primary" className="w-full">Create Release</Button>
        </PanelBody>
      </Panel>
    </>
  );
}

function CoverArtUploadMockup() {
  return (
    <>
      <div className="p-4 space-y-4">
        {/* Cover art with pencil overlay */}
        <div className="w-48 mx-auto aspect-square rounded-lg bg-panel2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-9 h-9 rounded-full bg-black/50 flex items-center justify-center">
              <Pencil size={16} className="text-white" />
            </div>
          </div>
          <div className="absolute bottom-2 left-2.5 right-2.5">
            <div className="text-[10px] font-medium text-white/80 truncate">Artist Name</div>
            <div className="text-[10px] text-white/60 truncate">Release Title</div>
          </div>
        </div>

        {/* Upload / Remove actions */}
        <div className="flex items-center gap-4 justify-center">
          <span className="flex items-center gap-1.5 text-sm font-medium text-text">
            <Upload size={14} /> Upload
          </span>
          <span className="flex items-center gap-1.5 text-sm font-medium text-red-500">
            <X size={14} /> Remove
          </span>
        </div>

        {/* Paste URL field */}
        <div className="space-y-1.5">
          <span className="label text-faint text-[10px]">OR PASTE URL</span>
          <div className="flex gap-2">
            <div className="flex-1 h-9 rounded-md border border-border bg-panel px-3 flex items-center">
              <span className="text-xs text-faint">https://...</span>
            </div>
            <div className="h-9 w-9 rounded-md bg-signal flex items-center justify-center">
              <Check size={14} className="text-white" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function TrackUploadMockup() {
  return (
    <>
      <div className="p-4">
        <EmptyState
          icon={Upload}
          title="Drop audio files here"
          description="WAV, AIFF, FLAC, or MP3 up to 500 MB"
          action={{ label: "Browse Files", onClick: () => {} }}
        />
      </div>
    </>
  );
}

function ReleaseStatusMockup() {
  return (
    <>
      <div className="p-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          {[
            { color: "blue" as const, label: "Draft" },
            { color: "orange" as const, label: "In Progress", active: true },
            { color: "green" as const, label: "Ready" },
          ].map((s) => (
            <div
              key={s.label}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium border transition-colors",
                s.active ? "border-signal bg-signal-muted text-signal" : "border-border bg-panel text-muted",
              )}
            >
              <StatusDot color={s.color} />
              {s.label}
            </div>
          ))}
        </div>
        <StatusIndicator color="orange" label="In Progress" />
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   ARTICLE 3: INVITING COLLABORATORS (4 mockups)
   ═══════════════════════════════════════════════════════════ */

function InviteCollaboratorMockup() {
  return (
    <>
      <Panel className="m-4">
        <PanelBody className="pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <MockInput text="client@example.com" placeholder />
            <MockSelect text="Collaborator" />
            <Button variant="primary"><Send size={14} /> Invite</Button>
          </div>
          <Rule />
          {[
            { name: "Sarah Kim", role: "Collaborator", initials: "SK" },
            { name: "Jordan Blake", role: "Client", initials: "JB" },
          ].map((m) => (
            <div key={m.name} className="flex items-center gap-3 py-2">
              <MockAvatar initials={m.initials} />
              <span className="text-sm font-medium text-text flex-1">{m.name}</span>
              <Pill>{m.role}</Pill>
            </div>
          ))}
        </PanelBody>
      </Panel>
    </>
  );
}

function CollaboratorRolesMockup() {
  return (
    <>
      <Panel className="m-4">
        <PanelBody className="pt-6 space-y-3">
          {[
            { role: "Collaborator", desc: "Full access to all release and track details" },
            { role: "Client", desc: "Read-only portal access with approval capabilities" },
          ].map((r, i) => (
            <div key={r.role}>
              {i > 0 && <Rule className="mb-3" />}
              <div className="flex items-center gap-3">
                <Pill active>{r.role}</Pill>
                <span className="text-sm text-muted">{r.desc}</span>
              </div>
            </div>
          ))}
        </PanelBody>
      </Panel>
    </>
  );
}

function AcceptInvitationMockup() {
  return (
    <>
      <Panel className="m-4">
        <PanelBody className="pt-6">
          <div className="flex items-center gap-3">
            <MockAvatar initials="SK" />
            <div className="flex-1">
              <span className="text-sm font-semibold text-text">Sarah Kim</span>
              <span className="text-sm text-muted"> joined as </span>
              <Pill>Collaborator</Pill>
            </div>
            <StatusDot color="green" />
            <span className="text-xs text-faint">Just now</span>
          </div>
        </PanelBody>
      </Panel>
    </>
  );
}

function PortalSharingMockup() {
  return (
    <>
      <Panel className="m-4">
        <PanelBody className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-text">Client Portal Link</span>
              <p className="text-xs text-muted mt-0.5">Read-only access to the brief, tracks, and comments</p>
            </div>
            <div className="w-10 h-6 rounded-full bg-signal flex items-center justify-end px-0.5">
              <div className="w-5 h-5 rounded-full bg-white" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MockInput text="mixarchitect.com/portal/abc123" className="flex-1" />
            <Button variant="secondary"><Copy size={14} /> Copy</Button>
          </div>
        </PanelBody>
      </Panel>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   ARTICLE 4: TRACK DETAIL TABS (6 mockups, one per tab)
   ═══════════════════════════════════════════════════════════ */

const TRACK_TABS = ["Intent", "Specs", "Audio", "Distribution", "Portal", "Notes"] as const;

function TrackTabBar({ active }: { active: typeof TRACK_TABS[number] }) {
  return (
    <div className="flex items-center gap-4 border-b border-border pb-3">
      {TRACK_TABS.map((tab) => (
        <span
          key={tab}
          className={cn(
            "text-sm font-medium pb-2 -mb-3",
            tab === active ? "text-signal border-b-2 border-signal" : "text-muted",
          )}
        >
          {tab}
        </span>
      ))}
    </div>
  );
}

function TrackTabIntentMockup() {
  return (
    <>
      <div className="p-4 space-y-4">
        <TrackTabBar active="Intent" />
        <Panel>
          <PanelBody className="pt-6 space-y-3">
            <span className="label text-xs text-faint">WHAT SHOULD THIS TRACK FEEL LIKE?</span>
            <p className="text-sm text-text leading-relaxed">Warm, spacious vocal mix with tight low end. Think Bon Iver meets James Blake.</p>
            <Rule />
            <span className="label text-xs text-faint">EMOTIONAL QUALITIES</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {["Warm", "Spacious", "Intimate", "Dreamy"].map((q) => (
                <Pill key={q} active>{q}</Pill>
              ))}
            </div>
            <Rule />
            <span className="label text-xs text-faint">ANTI-REFERENCES</span>
            <p className="text-sm text-muted">No harsh sibilance. Avoid overly compressed vocal sound.</p>
          </PanelBody>
        </Panel>
      </div>
    </>
  );
}

function TrackTabSpecsMockup() {
  return (
    <>
      <div className="p-4 space-y-4">
        <TrackTabBar active="Specs" />
        <Panel>
          <PanelBody className="pt-6 space-y-3">
            <span className="label text-xs text-faint">TECHNICAL SETTINGS</span>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label text-xs text-faint mb-1.5 block">FORMAT</label>
                <MockSelect text="Stereo + Atmos" />
              </div>
              <div>
                <label className="label text-xs text-faint mb-1.5 block">SAMPLE RATE</label>
                <MockSelect text="48 kHz" />
              </div>
              <div>
                <label className="label text-xs text-faint mb-1.5 block">BIT DEPTH</label>
                <MockSelect text="24-bit" />
              </div>
            </div>
            <Rule />
            <span className="label text-xs text-faint">DELIVERY</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {["WAV", "FLAC", "MP3"].map((f) => (
                <div key={f} className="flex items-center gap-1">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-signal/30 bg-signal-muted">
                    <Check size={12} className="text-signal" />
                    <span className="text-sm font-medium text-text">{f}</span>
                  </div>
                  <Download size={14} className="text-signal ml-0.5" />
                </div>
              ))}
              {["AIFF", "AAC"].map((f) => (
                <div key={f} className="px-3 py-1.5 rounded-md border border-border">
                  <span className="text-sm text-muted">{f}</span>
                </div>
              ))}
            </div>
          </PanelBody>
        </Panel>
      </div>
    </>
  );
}

function TrackTabLufsMockup() {
  const measured = -14.9;
  const services = [
    { label: "STREAMING", items: [
      { name: "Spotify", target: -14 },
      { name: "Apple Music", target: -16 },
      { name: "YouTube", target: -14 },
      { name: "Tidal", target: -14 },
      { name: "Amazon Music", target: -14 },
      { name: "Deezer", target: -15 },
      { name: "Qobuz", target: -14 },
      { name: "Pandora", target: -14 },
    ]},
    { label: "BROADCAST", items: [
      { name: "EBU R128", target: -23 },
      { name: "ATSC A/85", target: -24 },
      { name: "ITU-R BS.1770", target: -24 },
    ]},
    { label: "SOCIAL", items: [
      { name: "Instagram/Reels", target: -14 },
      { name: "TikTok", target: -14 },
      { name: "Facebook", target: -16 },
    ]},
  ];
  return (
    <>
      <div className="p-4 space-y-4">
        <TrackTabBar active="Audio" />
        <Panel>
          <PanelBody className="pt-6 space-y-4">
            {/* LUFS header */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-text">Loudness Analysis</span>
              <div className="flex items-center gap-2 text-xs text-faint">
                <span>{measured} LUFS</span>
                <span className="px-1.5 py-0.5 rounded bg-status-orange/20 text-status-orange text-[10px] font-medium">-0.9 dB</span>
              </div>
            </div>

            {/* Service table */}
            <div className="border border-border rounded-lg overflow-hidden">
              {services.map((group, gi) => (
                <div key={gi}>
                  <div className="px-3 py-2 bg-panel2">
                    <span className="label text-[10px] text-faint tracking-wider">{group.label}</span>
                  </div>
                  {group.items.map((s, si) => {
                    const adj = +(s.target - measured).toFixed(1);
                    const isNeg = adj < 0;
                    return (
                      <div key={si} className="flex items-center justify-between px-3 py-1.5 border-t border-border">
                        <span className="text-xs text-text">{s.name}</span>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-faint w-8 text-right">{s.target}</span>
                          <span className={cn("w-14 text-right font-medium", isNeg ? "text-status-orange" : "text-text")}>
                            {adj > 0 ? "+" : ""}{adj} dB
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </PanelBody>
        </Panel>
      </div>
    </>
  );
}

function TrackTabAudioMockup() {
  const commentMarkers = [
    { pos: 6, color: "#6366f1" },   // Alex - purple
    { pos: 18, color: "#f59e0b" },  // Jordan - gold
    { pos: 45, color: "#6366f1" },  // Alex
    { pos: 68, color: "#f59e0b" },  // Jordan
    { pos: 82, color: "#6366f1" },  // Alex
  ];
  return (
    <>
      <div className="p-4 space-y-4">
        <TrackTabBar active="Audio" />
        <Panel>
          <PanelBody className="pt-6 space-y-4">
            {/* Header: track info + version tabs */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-panel2" />
                <div>
                  <span className="text-sm font-semibold text-text block">Morning Light</span>
                  <span className="text-xs text-muted">Neon Waves</span>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-panel2 rounded-md p-0.5">
                <span className="px-2.5 py-1 text-xs font-medium rounded bg-signal text-signal-on">v1</span>
                <span className="px-2.5 py-1 text-xs font-medium text-muted">v2</span>
                <span className="px-2.5 py-1 text-xs font-medium text-muted">v3</span>
                <span className="px-2 py-1 text-xs text-muted">+</span>
              </div>
            </div>

            {/* Version metadata */}
            <div className="flex items-center gap-2 text-xs text-faint">
              <span>V1 &middot; MAR 4 &middot; 5 comments</span>
              <Download size={12} />
              <span className="flex-1" />
              <span>-14.2 LUFS</span>
              <span className="px-1.5 py-0.5 rounded bg-status-orange/20 text-status-orange text-[10px] font-medium">-0.8 dB</span>
            </div>

            {/* Waveform with comment markers */}
            <div className="relative">
              {/* Comment markers */}
              <div className="relative h-5 mb-1">
                {commentMarkers.map((m, i) => (
                  <div key={i} className="absolute -translate-x-1/2" style={{ left: `${m.pos}%` }}>
                    <MessageCircle size={14} style={{ color: m.color }} />
                  </div>
                ))}
              </div>
              <div className="bg-panel2 rounded-md p-3">
                <WaveformBars highlight={14} mirrored />
              </div>
              <p className="text-center text-[10px] text-faint mt-1">double-click waveform to add comment</p>
            </div>

            {/* Playback controls */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">0:00</span>
              <div className="flex items-center gap-3">
                <button type="button" className="w-9 h-9 rounded-full bg-signal text-signal-on flex items-center justify-center">
                  <Play size={16} fill="currentColor" />
                </button>
              </div>
              <span className="text-xs text-muted">4:12</span>
            </div>

            <Rule />

            {/* Feedback section */}
            <div className="flex items-center justify-between">
              <span className="label text-xs text-faint">FEEDBACK</span>
              <span className="text-xs text-faint">3 notes</span>
            </div>
            {[
              { author: "Alex Rivera", initials: "AR", color: "#6366f1", time: "0:15", comment: "Bring up the vocal a touch here" },
              { author: "Jordan Blake", initials: "JB", color: "#f59e0b", time: "1:08", comment: "Love the reverb on the snare" },
              { author: "Alex Rivera", initials: "AR", color: "#6366f1", time: "2:34", comment: "Can we try a wider stereo spread on the pads?" },
            ].map((c, i) => (
              <div key={i} className="flex items-start gap-3 py-1">
                <MockAvatar initials={c.initials} color={c.color} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-text">{c.author}</span>
                    <span className="px-1.5 py-0.5 rounded bg-signal/15 text-signal text-[10px] font-medium">{c.time}</span>
                  </div>
                  <p className="text-sm text-muted mt-0.5">{c.comment}</p>
                </div>
              </div>
            ))}
          </PanelBody>
        </Panel>
      </div>
    </>
  );
}

function TrackTabDistributionMockup() {
  return (
    <>
      <div className="p-4 space-y-4">
        <TrackTabBar active="Distribution" />
        <Panel>
          <PanelBody className="pt-6 space-y-3">
            <span className="label text-xs text-faint">WRITING SPLIT</span>
            <div className="space-y-2">
              {[
                { name: "Alex Rivera", pct: "50%" },
                { name: "Jordan Blake", pct: "50%" },
              ].map((s) => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="text-sm text-text flex-1">{s.name}</span>
                  <span className="text-sm font-medium text-text">{s.pct}</span>
                </div>
              ))}
            </div>
            <Rule />
            <span className="label text-xs text-faint">PUBLISHING SPLIT</span>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-sm text-text flex-1">Alex Rivera</span>
                <span className="text-sm font-medium text-text">50%</span>
              </div>
            </div>
            <Rule />
            <span className="label text-xs text-faint">CODES & IDENTIFIERS</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label text-xs text-faint mb-1.5 block">ISRC</label>
                <MockInput text="USRC17607839" />
              </div>
              <div>
                <label className="label text-xs text-faint mb-1.5 block">ISWC</label>
                <MockInput text="T-345246800-1" />
              </div>
            </div>
            <Rule />
            <span className="label text-xs text-faint">CREDITS</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label text-xs text-faint mb-1.5 block">PRODUCER</label>
                <MockInput text="Alex Rivera" />
              </div>
              <div>
                <label className="label text-xs text-faint mb-1.5 block">COMPOSER</label>
                <MockInput text="Alex Rivera, Jordan Blake" />
              </div>
            </div>
            <Rule />
            <span className="label text-xs text-faint">TRACK PROPERTIES</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label text-xs text-faint mb-1.5 block">LANGUAGE</label>
                <MockSelect text="English" />
              </div>
              <div className="flex items-center gap-2 pt-5">
                <span className="text-sm text-muted">Explicit Lyrics</span>
                <div className="w-8 h-4 rounded-full bg-signal relative"><div className="absolute right-0.5 top-0.5 w-3 h-3 rounded-full bg-white" /></div>
              </div>
            </div>
          </PanelBody>
        </Panel>
      </div>
    </>
  );
}

function TrackTabPortalMockup() {
  return (
    <>
      <div className="p-4 space-y-4">
        <TrackTabBar active="Portal" />
        <Panel>
          <PanelBody className="pt-6 space-y-3">
            <span className="label text-xs text-faint">CLIENT APPROVAL</span>
            <div className="flex items-center gap-3">
              <CheckCircle2 size={16} className="text-signal" />
              <span className="text-sm font-semibold text-signal">Approved</span>
            </div>
            <div className="space-y-1.5 text-xs text-muted">
              <div className="flex items-center gap-2"><CheckCircle2 size={10} className="text-signal" /><span className="font-semibold text-text">Client</span> approved<span className="ml-auto text-faint">Feb 28</span></div>
              <div className="flex items-center gap-2"><MessageCircle size={10} className="text-orange-400" /><span className="font-semibold text-text">Client</span> requested changes<span className="ml-auto text-faint">Feb 28</span></div>
            </div>
            <Rule />
            <span className="label text-xs text-faint">TRACK PORTAL VISIBILITY</span>
            {[
              { label: "Visible on portal", on: true },
              { label: "Enable download", on: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-1">
                <span className="text-sm text-text">{item.label}</span>
                <div className={cn("w-9 h-5 rounded-full flex items-center px-0.5", item.on ? "bg-signal justify-end" : "bg-panel2 border border-border")}>
                  <div className={cn("w-4 h-4 rounded-full", item.on ? "bg-white" : "bg-muted")} />
                </div>
              </div>
            ))}
            <Rule />
            <span className="label text-xs text-faint">TRACK VERSION VISIBILITY</span>
            {["Version 3", "Version 2", "Version 1"].map((v, i) => (
              <div key={v} className="flex items-center justify-between py-1">
                <span className="text-sm text-text">{v}</span>
                <div className={cn("w-9 h-5 rounded-full flex items-center px-0.5", i < 2 ? "bg-signal justify-end" : "bg-panel2 border border-border")}>
                  <div className={cn("w-4 h-4 rounded-full", i < 2 ? "bg-white" : "bg-muted")} />
                </div>
              </div>
            ))}
          </PanelBody>
        </Panel>
      </div>
    </>
  );
}

function TrackTabNotesMockup() {
  return (
    <>
      <div className="p-4 space-y-4">
        <TrackTabBar active="Notes" />
        <Panel>
          <PanelBody className="pt-6 space-y-1">
            <MockNoteEntry author="Sarah Kim" time="2h ago" content="Rev3 sounds great. The low end is tighter now." />
            <Rule />
            <MockNoteEntry author="Jordan Blake" time="1h ago" content="Can we try a version with more reverb on the vocals?" isClient />
            <Rule />
            <div className="flex items-center gap-2 pt-2">
              <MockInput text="Add a note..." className="flex-1" placeholder />
              <Button variant="primary"><Send size={14} /></Button>
            </div>
          </PanelBody>
        </Panel>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   ARTICLE 5: UPLOADING AND MANAGING AUDIO (3 mockups)
   ═══════════════════════════════════════════════════════════ */

function AudioUploadMockup() {
  return (
    <>
      <div className="p-4 space-y-4">
        <EmptyState
          icon={Upload}
          title="Drop audio files here"
          description="WAV, AIFF, FLAC, or MP3"
          action={{ label: "Browse Files", onClick: () => {} }}
          size="sm"
        />
        <Panel variant="flat" className="px-5 py-3 border border-border">
          <div className="flex items-center gap-3">
            <span className="w-4 h-4 border-2 border-signal border-t-transparent rounded-full animate-spin" />
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-text">mix-v3-final.wav</span>
              <div className="mt-1 h-1.5 bg-panel2 rounded-full overflow-hidden">
                <div className="h-full w-[65%] bg-signal rounded-full" />
              </div>
            </div>
            <span className="text-xs text-faint">65%</span>
          </div>
        </Panel>
      </div>
    </>
  );
}

function TrackVersionsMockup() {
  return (
    <>
      <Panel className="m-4">
        <PanelBody className="pt-6 space-y-3">
          <MockSelect text="v3 (latest)" />
          <Rule />
          {[
            { ver: "v3", file: "mix-v3-final.wav", date: "Mar 2, 2026", status: "green" as const, current: true },
            { ver: "v2", file: "mix-v2-revisions.wav", date: "Feb 28, 2026", status: "orange" as const },
            { ver: "v1", file: "mix-v1-rough.wav", date: "Feb 20, 2026", status: "blue" as const },
          ].map((v) => (
            <div key={v.ver} className={cn("flex items-center gap-3 py-2 px-3 rounded-md", v.current && "bg-signal-muted")}>
              <span className="text-sm font-semibold text-text w-6">{v.ver}</span>
              <div className="flex-1 min-w-0">
                <span className="text-sm text-text">{v.file}</span>
                <span className="text-xs text-faint ml-2">{v.date}</span>
              </div>
              <StatusDot color={v.status} />
            </div>
          ))}
        </PanelBody>
      </Panel>
    </>
  );
}

function WaveformPlayerMockup() {
  return (
    <>
      <Panel className="m-4">
        <PanelBody className="pt-6 space-y-4">
          <div className="bg-panel2 rounded-md p-4">
            <WaveformBars highlight={14} />
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className="w-10 h-10 rounded-full bg-signal text-signal-on flex items-center justify-center">
              <Play size={18} fill="currentColor" />
            </button>
            <span className="text-sm text-muted">1:24 / 3:42</span>
            <span className="flex-1" />
            <span className="text-xs text-faint font-medium">-14.2 LUFS</span>
          </div>
          <Rule />
          <DataGrid>
            <DataCell label="Sample Rate" value="48" unit="kHz" size="small" />
            <DataCell label="Bit Depth" value="24" unit="bit" size="small" />
            <DataCell label="Duration" value="3:42" size="small" />
            <DataCell label="File Size" value="24.3" unit="MB" size="small" />
          </DataGrid>
        </PanelBody>
      </Panel>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   ARTICLE 6: DELIVERY FORMATS AND CONVERSION (3 mockups)
   ═══════════════════════════════════════════════════════════ */

function FormatConvertMockup() {
  return (
    <>
      <Panel className="m-4">
        <PanelBody className="pt-6 space-y-4">
          <span className="label text-xs text-faint">DELIVERY FORMATS</span>
          <div className="flex flex-wrap gap-2">
            {["WAV", "FLAC", "MP3"].map((f) => (
              <div key={f} className="flex items-center gap-2 px-3 py-2 rounded-md border border-signal/30 bg-signal-muted">
                <Check size={14} className="text-signal" />
                <span className="text-sm font-medium text-text">{f}</span>
              </div>
            ))}
            {["AIFF", "AAC", "OGG"].map((f) => (
              <div key={f} className="flex items-center gap-2 px-3 py-2 rounded-md border border-border">
                <span className="text-sm text-muted">{f}</span>
              </div>
            ))}
          </div>
          <Rule />
          <div className="flex items-center gap-3">
            <MockSelect text="Export from: v3 - mix-final.wav (latest)" className="flex-1" />
            <Button variant="primary"><Download size={14} /> Convert</Button>
          </div>
        </PanelBody>
      </Panel>
    </>
  );
}

function ExportDownloadMockup() {
  return (
    <>
      <Panel className="m-4">
        <PanelBody className="pt-6">
          <div className="flex items-center gap-3 mb-3">
            <StatusDot color="green" />
            <span className="text-base font-semibold text-text">Conversion Complete</span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <Pill>FLAC</Pill>
            <span className="text-sm text-muted">44.1 kHz / 16-bit</span>
            <span className="text-sm text-faint">18.2 MB</span>
          </div>
          <Button variant="primary"><Download size={14} /> Download</Button>
        </PanelBody>
      </Panel>
    </>
  );
}

function SupportedFormatsMockup() {
  const lossless = [
    { name: "WAV", spec: "Source rate / depth" },
    { name: "AIFF", spec: "Source rate / depth" },
    { name: "FLAC", spec: "Source rate" },
    { name: "ALAC", spec: "Source rate" },
  ];
  const lossy = [
    { name: "MP3", spec: "44.1 kHz / 320 kbps" },
    { name: "AAC", spec: "44.1 kHz / 256 kbps" },
    { name: "OGG", spec: "44.1 kHz / Quality 8" },
  ];
  return (
    <>
      <Panel className="m-4">
        <PanelBody className="pt-6 space-y-4">
          <div>
            <span className="label text-xs text-faint">LOSSLESS (PRESERVES SOURCE QUALITY)</span>
            <div className="space-y-1.5 mt-2">
              {lossless.map((f) => (
                <div key={f.name} className="flex items-center justify-between px-3 py-1.5 rounded-md border border-signal/30 bg-signal-muted">
                  <span className="text-sm font-medium text-text">{f.name}</span>
                  <span className="text-xs text-muted">{f.spec}</span>
                </div>
              ))}
            </div>
          </div>
          <Rule />
          <div>
            <span className="label text-xs text-faint">LOSSY (FIXED OUTPUT PRESETS)</span>
            <div className="space-y-1.5 mt-2">
              {lossy.map((f) => (
                <div key={f.name} className="flex items-center justify-between px-3 py-1.5 rounded-md border border-border">
                  <span className="text-sm font-medium text-text">{f.name}</span>
                  <span className="text-xs text-muted">{f.spec}</span>
                </div>
              ))}
            </div>
          </div>
          <Rule />
          <div>
            <span className="label text-xs text-faint">NON-CONVERTIBLE (DISPLAY ONLY)</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {["DDP", "ADM BWF/Atmos", "MQA"].map((f) => (
                <Pill key={f}>{f}</Pill>
              ))}
            </div>
            <p className="text-xs text-muted mt-2">These formats require specialized tools and cannot be converted in-app.</p>
          </div>
        </PanelBody>
      </Panel>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   ARTICLE 7: TIMESTAMPED COMMENTS (3 mockups)
   ═══════════════════════════════════════════════════════════ */

function CommentWaveformMockup() {
  return (
    <>
      <Panel className="m-4">
        <PanelBody className="pt-6 space-y-3">
          <div className="bg-panel2 rounded-md p-4 relative">
            <WaveformBars />
            <div className="absolute top-2 left-[22%] w-2.5 h-2.5 rounded-full bg-signal border-2 border-panel" />
            <div className="absolute top-2 left-[48%] w-2.5 h-2.5 rounded-full bg-status-orange border-2 border-panel" />
            <div className="absolute top-2 left-[72%] w-2.5 h-2.5 rounded-full bg-status-blue border-2 border-panel" />
          </div>
          {[
            { initials: "SK", time: "0:42", text: "Bring up the vocals in this section" },
            { initials: "ML", time: "1:18", text: "Snare feels a bit loud" },
          ].map((c) => (
            <div key={c.time} className="flex items-start gap-3">
              <MockAvatar initials={c.initials} />
              <span className="px-2 py-0.5 rounded bg-panel2 border border-border text-xs text-muted font-medium shrink-0">{c.time}</span>
              <span className="text-sm text-muted">{c.text}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-2">
            <MockInput text="Add a comment at 2:05..." className="flex-1" placeholder />
            <Button variant="primary"><Send size={14} /></Button>
          </div>
        </PanelBody>
      </Panel>
    </>
  );
}

function PortalCommentsMockup() {
  return (
    <>
      <Panel className="m-4">
        <PanelBody className="pt-6">
          <MockNoteEntry author="Sarah Kim" time="2h ago" content="The vocal balance sounds great in the chorus. Can we bring up the backing vocals slightly in verse 2?" />
          <Rule />
          <MockNoteEntry author="Jordan Blake" time="1h ago" content="Love the overall direction. The guitar tone in the bridge needs a bit more warmth." isClient />
        </PanelBody>
      </Panel>
    </>
  );
}

function ResolveFeedbackMockup() {
  return (
    <>
      <Panel className="m-4">
        <PanelBody className="pt-6 space-y-3">
          <div className="flex items-start gap-3 opacity-50">
            <MockAvatar initials="SK" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text">Sarah Kim</span>
                <span className="px-2 py-0.5 rounded bg-panel2 border border-border text-xs text-muted">0:42</span>
                <CheckCircle2 size={14} className="text-signal" />
                <span className="text-xs text-signal font-medium">Resolved</span>
              </div>
              <p className="text-sm text-muted mt-1 line-through">Bring up the vocals in this section</p>
            </div>
          </div>
          <Rule />
          <div className="flex items-start gap-3">
            <MockAvatar initials="ML" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text">Marcus Lee</span>
                <span className="px-2 py-0.5 rounded bg-panel2 border border-border text-xs text-muted">1:18</span>
              </div>
              <p className="text-sm text-muted mt-1">Snare feels a bit loud in the second verse</p>
            </div>
          </div>
        </PanelBody>
      </Panel>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   ARTICLE 8: CLIENT PORTAL AND APPROVALS (3 mockups)
   ═══════════════════════════════════════════════════════════ */

function PortalSettingsMockup() {
  return (
    <>
      <Panel className="m-4">
        <PanelBody className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-signal" />
              <span className="text-sm font-semibold text-text">Client Portal</span>
            </div>
            <div className="w-10 h-6 rounded-full bg-signal flex items-center justify-end px-0.5">
              <div className="w-5 h-5 rounded-full bg-white" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MockInput text="mixarchitect.com/portal/abc123" className="flex-1" />
            <Button variant="secondary"><Share2 size={14} /> Share</Button>
          </div>
          <Rule />
          <span className="label text-xs text-faint">VISIBLE SECTIONS</span>
          <div className="space-y-3">
            {[
              { label: "Mix direction", on: true },
              { label: "Specs", on: true },
              { label: "References", on: false },
              { label: "Lyrics", on: false },
              { label: "Require payment for download", on: true },
            ].map((t) => (
              <div key={t.label} className="flex items-center justify-between">
                <span className="text-sm text-text">{t.label}</span>
                <div className={cn("w-9 h-5 rounded-full flex items-center px-0.5", t.on ? "bg-signal justify-end" : "bg-border justify-start")}>
                  <div className="w-4 h-4 rounded-full bg-white" />
                </div>
              </div>
            ))}
          </div>
        </PanelBody>
      </Panel>
    </>
  );
}

function PortalTrackVisibilityMockup() {
  return (
    <>
      <Panel className="m-4">
        <PanelBody className="pt-6 space-y-4">
          <span className="label text-xs text-faint">TRACK PORTAL VISIBILITY</span>
          <p className="text-xs text-muted">Control what your client sees for this track on the portal.</p>
          <div className="space-y-3">
            {[
              { label: "Visible on portal", on: true },
              { label: "Enable download", on: true },
            ].map((t) => (
              <div key={t.label} className="flex items-center justify-between">
                <span className="text-sm text-text">{t.label}</span>
                <div className={cn("w-9 h-5 rounded-full flex items-center px-0.5", t.on ? "bg-signal justify-end" : "bg-border justify-start")}>
                  <div className="w-4 h-4 rounded-full bg-white" />
                </div>
              </div>
            ))}
          </div>
          <Rule />
          <span className="label text-xs text-faint">TRACK VERSION VISIBILITY</span>
          <div className="space-y-3">
            {[
              { label: "v3 - mix-final.wav (latest)", on: true },
              { label: "v2 - mix-rev2.wav", on: false },
              { label: "v1 - mix-rough.wav", on: false },
            ].map((t) => (
              <div key={t.label} className="flex items-center justify-between">
                <span className="text-sm text-text">{t.label}</span>
                <div className={cn("w-9 h-5 rounded-full flex items-center px-0.5", t.on ? "bg-signal justify-end" : "bg-border justify-start")}>
                  <div className="w-4 h-4 rounded-full bg-white" />
                </div>
              </div>
            ))}
          </div>
        </PanelBody>
      </Panel>
    </>
  );
}

function PortalApprovalMockup() {
  return (
    <>
      <Panel className="m-4">
        <PanelBody className="pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-status-green/10 flex items-center justify-center shrink-0">
              <Check size={16} className="text-status-green" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-semibold text-text">Approved</span>
              <p className="text-xs text-muted mt-0.5">Jordan Blake approved on Mar 2, 2026</p>
            </div>
          </div>
          <Rule />
          <span className="label text-xs text-faint">APPROVAL HISTORY</span>
          <div className="space-y-2">
            {[
              { action: "Approved", actor: "Jordan Blake", date: "Mar 2", color: "green" as const },
              { action: "Changes requested", actor: "Jordan Blake", date: "Feb 28", color: "orange" as const, note: "Vocals need more presence in the chorus" },
              { action: "Delivered", actor: "Sarah Kim", date: "Feb 25", color: "blue" as const },
            ].map((e) => (
              <div key={e.date} className="flex items-start gap-3">
                <StatusDot color={e.color} />
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-text">{e.actor} {e.action.toLowerCase()}</span>
                  <span className="text-xs text-faint ml-2">{e.date}</span>
                  {e.note && <p className="text-xs text-muted mt-0.5 italic">{e.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </PanelBody>
      </Panel>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   ARTICLE 9: TIMELINE VIEW (3 mockups)
   ═══════════════════════════════════════════════════════════ */

function TimelineBar({ title, left, width, color }: { title: string; left: string; width: string; color: string }) {
  return (
    <div className="relative h-8">
      <div className={cn("absolute top-0 h-full rounded-full flex items-center px-3", color)} style={{ left, width }}>
        <span className="text-xs font-medium text-white truncate">{title}</span>
      </div>
    </div>
  );
}

function TimelineFullMockup() {
  return (
    <>
      <Panel className="m-4">
        <PanelBody className="pt-6">
          <div className="flex mb-2">
            {["Jan", "Feb", "Mar", "Apr"].map((m) => (
              <span key={m} className="flex-1 text-xs text-faint text-center">{m}</span>
            ))}
          </div>
          <div className="relative border-t border-border">
            <div className="absolute inset-0 flex">
              {["Jan", "Feb", "Mar", "Apr"].map((m) => (
                <div key={m} className="flex-1 border-r border-border last:border-r-0" />
              ))}
            </div>
            <div className="absolute top-0 bottom-0 left-[38%] w-px bg-signal z-10" />
            <div className="relative space-y-2 py-3 px-2">
              <TimelineBar title="Late Night EP" left="5%" width="55%" color="bg-status-green" />
              <TimelineBar title="Summer Single" left="30%" width="40%" color="bg-status-orange" />
              <TimelineBar title="Demo Reel" left="60%" width="30%" color="bg-status-blue" />
            </div>
          </div>
        </PanelBody>
      </Panel>
    </>
  );
}

function TimelineNavigateMockup() {
  return (
    <>
      <Panel className="m-4">
        <PanelBody className="pt-6">
          <div className="flex mb-2">
            {["Jan", "Feb", "Mar", "Apr"].map((m) => (
              <span key={m} className="flex-1 text-xs text-faint text-center">{m}</span>
            ))}
          </div>
          <div className="relative border-t border-border">
            <div className="absolute inset-0 flex">
              {["Jan", "Feb", "Mar", "Apr"].map((m) => (
                <div key={m} className="flex-1 border-r border-border last:border-r-0" />
              ))}
            </div>
            <div className="absolute top-0 bottom-0 left-[38%] w-0.5 bg-signal z-10" />
            <div className="absolute -top-5 left-[38%] -translate-x-1/2 bg-signal text-signal-on text-xs font-medium px-2 py-0.5 rounded">Today</div>
            <div className="relative space-y-2 py-3 px-2">
              <TimelineBar title="Late Night EP" left="5%" width="55%" color="bg-status-green" />
              <TimelineBar title="Summer Single" left="30%" width="40%" color="bg-status-orange" />
            </div>
          </div>
        </PanelBody>
      </Panel>
    </>
  );
}

function TimelineDatesMockup() {
  return (
    <>
      <Panel className="m-4">
        <PanelBody className="pt-6">
          <div className="flex mb-2">
            {["Jan", "Feb", "Mar", "Apr"].map((m) => (
              <span key={m} className="flex-1 text-xs text-faint text-center">{m}</span>
            ))}
          </div>
          <div className="relative border-t border-border py-4 px-2">
            <div className="relative h-8">
              <div className="absolute top-0 h-full rounded-full bg-status-orange flex items-center px-3" style={{ left: "15%", width: "50%" }}>
                <span className="text-xs font-medium text-white truncate">Summer Single</span>
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 w-3 h-8 rounded-sm border-2 border-signal bg-panel cursor-ew-resize" style={{ left: "14%" }} />
              <div className="absolute top-1/2 -translate-y-1/2 w-3 h-8 rounded-sm border-2 border-signal bg-panel cursor-ew-resize" style={{ left: "64%" }} />
            </div>
            <div className="flex justify-between mt-2 px-2" style={{ marginLeft: "13%", width: "53%" }}>
              <span className="text-xs text-signal font-medium">Jan 20</span>
              <span className="text-xs text-signal font-medium">Mar 15</span>
            </div>
          </div>
        </PanelBody>
      </Panel>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   ARTICLE 10: TEMPLATES (3 mockups)
   ═══════════════════════════════════════════════════════════ */

function TemplateContentsMockup() {
  const sections = [
    { name: "Basics", items: ["Template name", "Description", "Default template", "Artist / Client"] },
    { name: "Release Settings", items: ["Release type", "Format", "Genre tags"] },
    { name: "Technical Specs", items: ["Sample rate", "Bit depth", "Delivery formats", "Special requirements"] },
    { name: "Intent Defaults", items: ["Emotional quality tags"] },
    { name: "Distribution Metadata", items: ["Distributor", "Record label", "Copyright", "Rights & publishing"] },
    { name: "Payment Defaults", items: ["Payment status", "Currency", "Payment notes"] },
  ];
  return (
    <>
      <Panel className="m-4">
        <PanelHeader>
          <div className="flex items-center gap-2">
            <LayoutTemplate size={18} className="text-signal" />
            <span className="text-base font-semibold text-text">Template Sections</span>
          </div>
        </PanelHeader>
        <PanelBody className="pt-6 space-y-3">
          {sections.map((s) => (
            <div key={s.name} className="rounded-md bg-panel-2 px-3 py-2.5">
              <div className="text-sm font-medium text-text">{s.name}</div>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {s.items.map((item) => (
                  <span key={item} className="text-xs text-muted bg-panel rounded px-2 py-0.5">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </PanelBody>
      </Panel>
    </>
  );
}

function TemplateCreateMockup() {
  return (
    <>
      <Panel className="m-4">
        <PanelHeader><span className="text-base font-semibold text-text">New Template</span></PanelHeader>
        <PanelBody className="pt-6 space-y-4">
          <div>
            <label className="label text-xs text-faint mb-1.5 block">TEMPLATE NAME</label>
            <MockInput text="Stereo Master" className="w-full" />
          </div>
          <div>
            <label className="label text-xs text-faint mb-1.5 block">DESCRIPTION</label>
            <MockInput text="Standard stereo single release" className="w-full" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted">
            <div className="w-4 h-4 rounded border border-border bg-signal flex items-center justify-center">
              <Check size={12} className="text-white" />
            </div>
            Set as default template
          </div>
          <Rule />
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="label text-xs text-faint mb-1.5 block">FORMAT</label>
              <MockSelect text="Stereo" />
            </div>
            <div className="flex-1">
              <label className="label text-xs text-faint mb-1.5 block">SAMPLE RATE</label>
              <MockSelect text="44.1 kHz" />
            </div>
            <div className="flex-1">
              <label className="label text-xs text-faint mb-1.5 block">BIT DEPTH</label>
              <MockSelect text="16-bit" />
            </div>
          </div>
          <div>
            <label className="label text-xs text-faint mb-1.5 block">DELIVERY FORMATS</label>
            <div className="flex flex-wrap gap-2">
              <Pill active>WAV</Pill>
              <Pill active>FLAC</Pill>
              <Pill>MP3</Pill>
              <Pill>AAC</Pill>
            </div>
          </div>
          <Button variant="primary" className="w-full">Create Template</Button>
        </PanelBody>
      </Panel>
    </>
  );
}

function TemplateUseMockup() {
  return (
    <>
      <Panel className="m-4">
        <PanelHeader>
          <div className="flex items-center gap-2">
            <LayoutTemplate size={18} className="text-signal" />
            <span className="text-base font-semibold text-text">Start from a template</span>
          </div>
          <p className="text-xs text-muted mt-1">Pre-fill your release settings, or start from scratch.</p>
        </PanelHeader>
        <PanelBody className="pt-6 space-y-4">
          <div className="rounded-md border border-signal bg-signal-muted px-4 py-3">
            <div className="text-sm font-medium text-text">Stereo Master</div>
            <div className="text-xs text-muted mt-1">Single, Stereo, 44.1 kHz / 16-bit, 2 delivery formats</div>
          </div>
          <div className="rounded-md border border-border px-4 py-3">
            <div className="text-sm font-medium text-text">Atmos EP</div>
            <div className="text-xs text-muted mt-1">EP, Stereo + Atmos, 48 kHz / 24-bit, 4 delivery formats</div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="primary">Use Template</Button>
            <span className="text-sm text-muted">Start from scratch</span>
          </div>
        </PanelBody>
      </Panel>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   ARTICLE 11: PAYMENT TRACKING (3 mockups)
   ═══════════════════════════════════════════════════════════ */

function PaymentDashboardMockup() {
  return (
    <>
      <div className="p-4 space-y-4">
        <span className="text-lg font-semibold text-text">Payments</span>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "OUTSTANDING", value: "$2,400", highlight: true, count: "3 releases" },
            { label: "EARNED", value: "$8,600", highlight: false, count: "5 paid" },
            { label: "TOTAL FEES", value: "$11,000", highlight: false, count: "8 releases" },
          ].map((s) => (
            <Panel key={s.label} variant="flat" className="px-4 py-3 border border-border">
              <span className="text-[10px] uppercase tracking-wide text-faint font-medium">{s.label}</span>
              <div className={cn("text-lg font-semibold mt-1", s.highlight ? "text-signal" : "text-text")}>{s.value}</div>
              <span className="text-xs text-muted">{s.count}</span>
            </Panel>
          ))}
        </div>
      </div>
    </>
  );
}

function PaymentReleaseFeesMockup() {
  return (
    <>
      <Panel className="m-4">
        <PanelBody className="pt-6">
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-3 py-2 font-medium text-faint text-xs">
              <span className="flex-1">Release</span>
              <span className="w-20 text-right">Fee</span>
              <span className="w-20 text-right">Paid</span>
              <span className="w-16 text-right">Status</span>
            </div>
            <Rule />
            {[
              { title: "Late Night EP", fee: "$3,000", paid: "$3,000", status: "paid" as const },
              { title: "Summer Single", fee: "$1,200", paid: "$600", status: "partial" as const },
              { title: "Demo Reel", fee: "$2,400", paid: "$0", status: "unpaid" as const },
            ].map((r) => (
              <div key={r.title} className="flex items-center gap-3 py-2.5">
                <span className="text-sm font-medium text-text flex-1 truncate">{r.title}</span>
                <span className="w-20 text-right text-sm text-text">{r.fee}</span>
                <span className="w-20 text-right text-sm text-text">{r.paid}</span>
                <span className={cn(
                  "w-16 text-right text-[10px] font-medium uppercase tracking-wide",
                  r.status === "paid" && "text-status-green",
                  r.status === "partial" && "text-status-orange",
                  r.status === "unpaid" && "text-faint",
                )}>{r.status}</span>
              </div>
            ))}
          </div>
        </PanelBody>
      </Panel>
    </>
  );
}

function PaymentTrackFeesMockup() {
  return (
    <>
      <Panel className="m-4">
        <PanelBody className="pt-6 space-y-0">
          <div className="flex items-center gap-3 py-2.5">
            <ChevronDown size={14} className="text-muted" />
            <span className="text-sm font-medium text-text flex-1">Summer Single</span>
            <span className="text-sm text-text w-20 text-right">$1,200</span>
            <span className="text-sm text-text w-20 text-right">$600</span>
            <Pill className="bg-status-orange/10 text-status-orange border-status-orange/20">Partial</Pill>
          </div>
          <div className="ml-7 border-l border-border pl-4 space-y-0">
            {[
              { num: "01", title: "Midnight Drive", fee: "$600", paid: true },
              { num: "02", title: "Golden Hour", fee: "$600", paid: false },
            ].map((t) => (
              <div key={t.num} className="flex items-center gap-3 py-2 text-xs">
                <span className="text-faint">{t.num}</span>
                <span className="text-muted flex-1">{t.title}</span>
                <span className="text-muted w-20 text-right">{t.fee}</span>
                <span className={cn("w-20 text-right", t.paid ? "text-status-green" : "text-faint")}>
                  {t.paid ? t.fee : "$0"}
                </span>
                <StatusDot color={t.paid ? "green" : "blue"} />
              </div>
            ))}
          </div>
        </PanelBody>
      </Panel>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   ARTICLE 12: EXPORT DATA (3 mockups)
   ═══════════════════════════════════════════════════════════ */

function ExportContentsMockup() {
  return (
    <>
      <Panel className="m-4">
        <PanelBody className="pt-6 space-y-2">
          <span className="text-sm font-semibold text-text">Export includes:</span>
          {[
            "Profile information",
            "All releases and metadata",
            "Track details (names, versions, notes)",
            "Audio files and versions",
            "Collaborator lists",
            "Comments and feedback",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 py-1.5">
              <Check size={16} className="text-signal shrink-0" />
              <span className="text-sm text-text">{item}</span>
            </div>
          ))}
        </PanelBody>
      </Panel>
    </>
  );
}

function ExportProgressMockup() {
  return (
    <>
      <Panel className="m-4">
        <PanelBody className="pt-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <StatTile label="Releases" value="12" />
            <StatTile label="Tracks" value="47" />
            <StatTile label="Audio Files" value="23" />
          </div>
          <div className="space-y-2">
            <div className="h-2 bg-panel2 rounded-full overflow-hidden">
              <div className="h-full w-[65%] bg-signal rounded-full" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-faint">Preparing export...</span>
              <Button variant="primary"><Download size={14} /> Download</Button>
            </div>
          </div>
        </PanelBody>
      </Panel>
    </>
  );
}

function ExportPrivacyMockup() {
  return (
    <>
      <div className="p-4">
        <AccentPanel>
          <div className="flex items-center gap-3 mb-4">
            <Shield size={24} className="text-white" />
            <span className="text-lg font-semibold text-white">Your Data is Private</span>
          </div>
          <div className="space-y-2">
            {[
              "Export contains only data you own or created",
              "Generated on-demand, not stored on servers",
              "Collaborator comments included, not their private data",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <Check size={14} className="text-white/70 shrink-0" />
                <span className="text-sm text-white/80">{item}</span>
              </div>
            ))}
          </div>
        </AccentPanel>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   ARTICLE 13: MANAGE SUBSCRIPTION (3 mockups)
   ═══════════════════════════════════════════════════════════ */

function PlanCurrentMockup() {
  return (
    <>
      <Panel className="m-4">
        <PanelHeader>
          <div className="flex items-center gap-3">
            <Pill active>Pro</Pill>
            <span className="text-sm text-muted">Current Plan</span>
          </div>
        </PanelHeader>
        <PanelBody className="pt-6 space-y-4">
          <DataGrid>
            <DataCell label="Billing Cycle" value="Monthly" size="small" />
            <DataCell label="Next Payment" value="Mar 15" size="small" />
            <DataCell label="Price" value="$14" unit="/mo" size="small" />
          </DataGrid>
          <Button variant="secondary">Manage Subscription</Button>
        </PanelBody>
      </Panel>
    </>
  );
}

function UpgradeProMockup() {
  return (
    <>
      <Panel className="m-4">
        <PanelBody className="pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <Pill>Free</Pill>
            <ArrowRight size={16} className="text-faint" />
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-signal text-signal-on">
              <Sparkles size={12} /> Pro
            </span>
            <span className="text-sm text-muted">$14/month</span>
          </div>
          <div className="space-y-2">
            {["Unlimited releases", "Audio format conversion", "Priority support", "Advanced export options"].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <Check size={16} className="text-signal shrink-0" />
                <span className="text-sm text-text">{f}</span>
              </div>
            ))}
          </div>
          <Button variant="primary"><ArrowUpCircle size={14} /> Upgrade to Pro</Button>
        </PanelBody>
      </Panel>
    </>
  );
}

function ManagePaymentMockup() {
  return (
    <>
      <Panel className="m-4">
        <PanelBody className="pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <CreditCard size={18} className="text-muted" />
            <div className="flex-1">
              <span className="text-sm font-medium text-text">Visa ending in 4242</span>
              <span className="text-xs text-muted ml-2">Expires 12/27</span>
            </div>
          </div>
          <Rule />
          <DataGrid>
            <DataCell label="Last Payment" value="Feb 15" size="small" />
            <DataCell label="Amount" value="$14.00" size="small" />
            <DataCell label="Next Billing" value="Mar 15" size="small" />
          </DataGrid>
          <Button variant="secondary"><Link2 size={14} /> Open Billing Portal</Button>
        </PanelBody>
      </Panel>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   ARTICLE 14: CANCEL / RESUBSCRIBE (3 mockups)
   ═══════════════════════════════════════════════════════════ */

function CancelSubscriptionMockup() {
  return (
    <>
      <Panel className="m-4 border-status-orange/30">
        <PanelBody className="pt-6 space-y-3">
          <StatusIndicator color="orange" label="Subscription Cancelled" />
          <p className="text-sm text-muted">Your Pro access continues until March 15, 2026. After that, your account reverts to the Free plan.</p>
          <div className="flex items-center gap-2">
            <Check size={14} className="text-signal" />
            <span className="text-sm text-muted">All your data is preserved</span>
          </div>
        </PanelBody>
      </Panel>
    </>
  );
}

function DataAfterCancelMockup() {
  return (
    <>
      <Panel className="m-4">
        <PanelBody className="pt-6 space-y-4">
          <div>
            <span className="label text-xs text-faint mb-2 block">PRESERVED</span>
            {["All releases and tracks", "Audio files and versions", "Notes and comments", "Collaborator lists", "Audio format conversion", "Advanced export options"].map((item) => (
              <div key={item} className="flex items-center gap-3 py-1.5">
                <Check size={16} className="text-signal shrink-0" />
                <span className="text-sm text-text">{item}</span>
              </div>
            ))}
          </div>
        </PanelBody>
      </Panel>
    </>
  );
}

function ResubscribeMockup() {
  return (
    <>
      <div className="p-4">
        <AccentPanel>
          <div className="flex items-center gap-3 mb-3">
            <Sparkles size={20} className="text-white" />
            <span className="text-lg font-semibold text-white">Welcome Back</span>
          </div>
          <p className="text-sm text-white/80 mb-4">Your previous data and settings are intact. Resubscribe to Pro to regain access to all features.</p>
          <div className="flex items-center gap-2 mb-4">
            <Check size={14} className="text-white/70" />
            <span className="text-sm text-white/80">No double charge within the same billing cycle</span>
          </div>
          <Button variant="secondary"><ArrowUpCircle size={14} /> Resubscribe to Pro</Button>
        </AccentPanel>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   ARTICLE 15: DISTRIBUTION TRACKER (6 mockups)
   Matches: src/app/app/releases/[releaseId]/distribution-panel.tsx
   ═══════════════════════════════════════════════════════════ */

/** Platform icon placeholder matching real app's <img> from /icons/streaming/ */
function MockPlatformIcon({ color }: { color: string }) {
  return (
    <span
      className="w-4 h-4 rounded-sm shrink-0 flex items-center justify-center"
      style={{ background: color }}
    >
      <Music size={9} className="text-white" />
    </span>
  );
}

function DistributionAddPlatformMockup() {
  return (
    <>
      <Panel className="m-4">
        <PanelBody className="py-5">
          {/* Header — matches real panel header */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">Distribution Tracker</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[11px] text-muted"><Send size={12} /> Mark as Submitted</span>
              <span className="flex items-center gap-1 text-[11px] text-signal font-medium"><Plus size={12} /> Add Platform</span>
            </div>
          </div>

          {/* Inline add form — matches real bordered div with select + button */}
          <div className="border border-border rounded-lg p-3 flex items-center gap-3 mb-4">
            <MockSelect text="YouTube Music" className="flex-1 text-xs" />
            <Button variant="primary" className="h-7 text-xs">Add</Button>
            <span className="text-xs text-muted">Cancel</span>
          </div>

          {/* Existing rows preview */}
          <div className="space-y-0.5">
            {[
              { name: "Spotify", color: "#1DB954", status: "Live", sColor: "green" as const },
              { name: "Apple Music", color: "#FA243C", status: "Submitted", sColor: "orange" as const },
            ].map((p) => (
              <div key={p.name} className="flex items-center gap-3 py-2 px-1">
                <MockPlatformIcon color={p.color} />
                <span className="text-sm text-text w-[120px]">{p.name}</span>
                <StatusIndicator color={p.sColor} label={p.status} className="text-xs" />
              </div>
            ))}
          </div>
        </PanelBody>
      </Panel>
    </>
  );
}

function DistributionStatusMockup() {
  const rows: { name: string; color: string; status: string; sColor: "green" | "orange" | "blue"; dist?: string }[] = [
    { name: "Spotify", color: "#1DB954", status: "Live", sColor: "green", dist: "DistroKid" },
    { name: "Apple Music", color: "#FA243C", status: "Processing", sColor: "orange", dist: "DistroKid" },
    { name: "Tidal", color: "#000000", status: "Submitted", sColor: "orange", dist: "DistroKid" },
    { name: "Amazon Music", color: "#25D1DA", status: "Submitted", sColor: "orange", dist: "DistroKid" },
    { name: "YouTube Music", color: "#FF0000", status: "Not Submitted", sColor: "blue" },
  ];
  return (
    <>
      <Panel className="m-4">
        <PanelBody className="py-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">Distribution Tracker</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[11px] text-muted"><Send size={12} /> Mark as Submitted</span>
              <span className="flex items-center gap-1 text-[11px] text-muted"><Plus size={12} /> Add Platform</span>
            </div>
          </div>

          {/* Spotify section */}
          <div className="mb-3">
            <div className="flex items-center gap-1.5 text-[11px] text-muted mb-2">
              <Sparkles size={11} className="text-signal" />
              Updates automatically
            </div>
            <div className="flex items-center gap-3 py-2 px-1">
              <MockPlatformIcon color="#1DB954" />
              <span className="text-sm text-text w-[120px]">Spotify</span>
              <span className="w-[80px]"><StatusIndicator color="green" label="Live" className="text-xs" /></span>
              <Pill className="text-[10px]">DistroKid</Pill>
              <span className="flex-1" />
              <ExternalLink size={13} className="text-muted" />
            </div>
          </div>

          {/* Manual section */}
          <div className="flex items-center gap-1.5 text-[11px] text-muted mb-2">Manually updated</div>
          <div className="space-y-0.5">
            {rows.slice(1).map((r) => (
              <div key={r.name} className="flex items-center gap-3 py-2 px-1">
                <MockPlatformIcon color={r.color} />
                <span className="text-sm text-text w-[120px]">{r.name}</span>
                <span className="w-[80px]"><StatusIndicator color={r.sColor} label={r.status} className="text-xs" /></span>
                {r.dist && <Pill className="text-[10px]">{r.dist}</Pill>}
                <span className="flex-1" />
                {r.status !== "Not Submitted" && <ExternalLink size={13} className="text-muted" />}
              </div>
            ))}
          </div>
        </PanelBody>
      </Panel>
    </>
  );
}

function DistributionSpotifyMockup() {
  return (
    <>
      <Panel className="m-4">
        <PanelBody className="py-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">Distribution Tracker</span>
          </div>

          {/* Auto section header with Check Now */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-[11px] text-muted">
              <Sparkles size={11} className="text-signal" />
              Updates automatically
            </div>
            <span className="flex items-center gap-1 text-[11px] text-muted"><Search size={12} /> Check Now</span>
          </div>

          {/* Check result feedback */}
          <div className="text-xs text-muted bg-panel2 rounded-md px-3 py-2 mb-3 flex items-center justify-between">
            <span>Found on Spotify!</span>
            <X size={12} className="text-faint" />
          </div>

          {/* Spotify row with live status and auto-detected sparkle */}
          <div className="flex items-center gap-3 py-2 px-1">
            <MockPlatformIcon color="#1DB954" />
            <span className="text-sm text-text w-[120px]">Spotify</span>
            <span className="w-[80px]"><StatusIndicator color="green" label="Live" className="text-xs" /></span>
            <Pill className="text-[10px]">DistroKid</Pill>
            <Sparkles size={12} className="text-signal shrink-0" />
            <span className="flex-1" />
            <ExternalLink size={13} className="text-muted" />
          </div>
        </PanelBody>
      </Panel>
    </>
  );
}

function DistributionEditMockup() {
  return (
    <>
      <Panel className="m-4">
        <PanelBody className="py-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">Distribution Tracker</span>
          </div>

          {/* Platform row */}
          <div className="flex items-center gap-3 py-2 px-1 mb-1">
            <MockPlatformIcon color="#FA243C" />
            <span className="text-sm text-text w-[120px]">Apple Music</span>
            <span className="w-[80px]">
              <span className="flex items-center gap-1">
                <StatusIndicator color="orange" label="Processing" className="text-xs" />
                <ChevronDown size={10} className="text-faint" />
              </span>
            </span>
            <Pill className="text-[10px]">DistroKid</Pill>
            <span className="flex-1" />
            <span className="text-[11px] text-muted">Add link</span>
          </div>

          {/* Inline status dropdown expanded */}
          <div className="flex items-center gap-1 pl-8 pb-2">
            {(["Not Submitted", "Submitted", "Processing", "Live"] as const).map((s, i) => (
              <span
                key={s}
                className={cn(
                  "flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md",
                  i === 2 ? "bg-panel2 text-text" : "text-muted",
                )}
              >
                <StatusIndicator
                  color={i === 3 ? "green" : i >= 1 ? "orange" : "blue"}
                  label={s}
                  className="text-[10px]"
                />
              </span>
            ))}
          </div>

          {/* Inline URL input */}
          <div className="flex items-center gap-2 pl-8 pt-1">
            <MockInput text="https://music.apple.com/album/..." className="flex-1 text-xs" />
            <span
              className="inline-flex items-center justify-center rounded-sm text-[11px] font-semibold text-white px-2.5 py-1"
              style={{ background: "var(--signal)" }}
            >Save</span>
            <span className="text-[11px] text-muted">Cancel</span>
          </div>
        </PanelBody>
      </Panel>
    </>
  );
}

function DistributionBulkMockup() {
  const platforms = [
    { name: "Spotify", color: "#1DB954", checked: true },
    { name: "Apple Music", color: "#FA243C", checked: true },
    { name: "Tidal", color: "#000000", checked: true },
    { name: "Amazon Music", color: "#25D1DA", checked: true },
    { name: "YouTube Music", color: "#FF0000", checked: true },
    { name: "Deezer", color: "#A238FF", checked: true },
  ];
  return (
    <>
      <Panel className="m-4">
        <PanelBody className="py-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">Distribution Tracker</span>
          </div>

          {/* Bordered inline form — matches real BulkSubmitForm */}
          <div className="border border-border rounded-lg p-3 space-y-3">
            <span className="text-xs font-medium text-text">Mark as Submitted</span>

            <div className="space-y-1">
              <label className="text-[11px] text-muted">Distributor</label>
              <MockSelect text="DistroKid" className="text-xs" />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-muted">Platforms</label>
              <div className="grid grid-cols-2 gap-1">
                {platforms.map((p) => (
                  <div key={p.name} className="flex items-center gap-2 text-xs py-1 px-1">
                    <div className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center",
                      p.checked ? "bg-signal border-signal" : "border-border bg-panel",
                    )}>
                      {p.checked && <Check size={10} className="text-signal-on" />}
                    </div>
                    <MockPlatformIcon color={p.color} />
                    <span className="text-text">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="primary" className="h-7 text-xs">Submit 6 Platforms</Button>
              <span className="text-xs text-muted">Cancel</span>
            </div>
          </div>
        </PanelBody>
      </Panel>
    </>
  );
}

function DistributionDistributorMockup() {
  const entries: { name: string; color: string; dist: string; status: string; sColor: "green" | "orange" }[] = [
    { name: "Spotify", color: "#1DB954", dist: "DistroKid", status: "Live", sColor: "green" },
    { name: "Apple Music", color: "#FA243C", dist: "DistroKid", status: "Processing", sColor: "orange" },
    { name: "Bandcamp", color: "#1DA0C3", dist: "Self-released", status: "Live", sColor: "green" },
    { name: "SoundCloud", color: "#FF5500", dist: "Self-released", status: "Live", sColor: "green" },
  ];
  return (
    <>
      <Panel className="m-4">
        <PanelBody className="py-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">Distribution Tracker</span>
          </div>
          <div className="space-y-0.5">
            {entries.map((e) => (
              <div key={e.name} className="flex items-center gap-3 py-2 px-1">
                <MockPlatformIcon color={e.color} />
                <span className="text-sm text-text w-[120px]">{e.name}</span>
                <span className="w-[80px]"><StatusIndicator color={e.sColor} label={e.status} className="text-xs" /></span>
                <Pill className="text-[10px]">{e.dist}</Pill>
                <span className="flex-1" />
                <ExternalLink size={13} className="text-muted" />
              </div>
            ))}
          </div>
        </PanelBody>
      </Panel>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   ARTICLE 16: USER ANALYTICS (5 mockups)
   Matches: src/app/app/analytics/analytics-dashboard.tsx
   ═══════════════════════════════════════════════════════════ */

/** StatCard clone matching real analytics StatCard (Link with icon+label, value, sub) */
function MockStatCard({ icon: Icon, label, value, sub }: {
  icon: typeof BarChart3; label: string; value: string; sub: string;
}) {
  return (
    <div className="px-4 py-3 rounded-lg border border-border bg-panel">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} strokeWidth={1.5} className="text-muted" />
        <span className="text-[10px] uppercase tracking-wide text-faint font-medium">{label}</span>
      </div>
      <div className="text-lg font-semibold text-text">{value}</div>
      <div className="text-xs text-muted mt-0.5">{sub}</div>
    </div>
  );
}

/** ChartCard clone matching real analytics ChartCard (bg-panel border p-4, title + description) */
function MockChartCard({ title, description, children, className }: {
  title: string; description: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={cn("bg-panel border border-border rounded-lg p-4", className)}>
      <h3 className="text-sm font-semibold text-text mb-0.5">{title}</h3>
      <p className="text-xs text-muted mb-4">{description}</p>
      {children}
    </div>
  );
}

function AnalyticsOverviewMockup() {
  return (
    <>
      <div className="p-4 space-y-4">
        {/* Header matches real: h1 + DateRangeSelector */}
        <div className="flex items-center justify-between">
          <span className="text-2xl font-semibold text-text">Analytics</span>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs text-muted">
            <Calendar size={12} />
            <span>Last 90 days</span>
            <ChevronDown size={12} />
          </div>
        </div>

        {/* KPI cards — matches real 4-col StatCard grid */}
        <div className="grid grid-cols-2 gap-3">
          <MockStatCard icon={BarChart3} label="Completed Releases" value="24" sub="4/mo avg" />
          <MockStatCard icon={Clock} label="Avg Turnaround" value="6.2d" sub="3d fastest, 12d slowest" />
          <MockStatCard icon={DollarSign} label="Total Revenue" value="$18,400" sub="$2,100 outstanding" />
          <MockStatCard icon={Users} label="Clients" value="8" sub="24 releases total" />
        </div>
      </div>
    </>
  );
}

function AnalyticsVelocityMockup() {
  const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
  const values = [2, 4, 3, 5, 4, 6];
  const max = Math.max(...values);
  return (
    <>
      <div className="p-4">
        <MockChartCard title="Release Velocity" description="Completed releases per month">
          <div className="flex items-end gap-2 h-[120px]">
            {months.map((m, i) => (
              <div key={m} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full max-w-[32px] mx-auto"
                  style={{
                    height: `${(values[i] / max) * 100}px`,
                    background: "var(--signal)",
                    borderRadius: "3px 3px 0 0",
                  }}
                />
                <span className="text-[10px] text-faint">{m}</span>
              </div>
            ))}
          </div>
        </MockChartCard>
      </div>
    </>
  );
}

function AnalyticsRevenueMockup() {
  const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
  const values = [2400, 3100, 2800, 4200, 3600, 5100];
  const max = Math.max(...values);
  return (
    <>
      <div className="p-4">
        <MockChartCard title="Revenue" description="Total fee earned per month (USD)">
          {/* Simplified area chart — gradient bars mimic the real AreaChart fill */}
          <div className="relative h-[120px]">
            {/* Horizontal grid lines */}
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="absolute left-0 right-0 border-t border-border"
                style={{ top: `${i * 33.3}%`, borderStyle: "dashed" }}
              />
            ))}
            <div className="flex items-end gap-2 h-full relative z-10">
              {months.map((m, i) => (
                <div key={m} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full relative" style={{ height: `${(values[i] / max) * 100}px` }}>
                    <div
                      className="absolute inset-0 rounded-t-sm"
                      style={{
                        background: "linear-gradient(to bottom, var(--signal), transparent)",
                        opacity: 0.3,
                      }}
                    />
                    <div
                      className="absolute top-0 left-0 right-0 h-0.5 rounded-full"
                      style={{ background: "var(--signal)" }}
                    />
                  </div>
                  <span className="text-[10px] text-faint">{m}</span>
                </div>
              ))}
            </div>
          </div>
        </MockChartCard>
      </div>
    </>
  );
}

function AnalyticsClientsMockup() {
  const clients = [
    { name: "Alex Rivera", releases: 6, revenue: "$5,400", paid: "$5,400", turnaround: "4d" },
    { name: "Jordan Lee", releases: 4, revenue: "$3,800", paid: "$2,600", turnaround: "7d" },
    { name: "Sam Chen", releases: 3, revenue: "$2,700", paid: "$2,700", turnaround: "5d" },
    { name: "Morgan Hayes", releases: 2, revenue: "$1,800", paid: "$0", turnaround: "9d" },
  ];
  return (
    <>
      {/* Matches real: bg-panel border rounded-lg with table */}
      <div className="m-4 bg-panel border border-border rounded-lg">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-text">Client Breakdown</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wide text-faint">
              <th className="px-4 py-2 font-medium">Client</th>
              <th className="px-4 py-2 font-medium text-right">Releases</th>
              <th className="px-4 py-2 font-medium text-right">Revenue</th>
              <th className="px-4 py-2 font-medium text-right">Paid</th>
              <th className="px-4 py-2 font-medium text-right">Avg Turn.</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.name} className="border-t border-border">
                <td className="px-4 py-2.5 text-text font-medium">{c.name}</td>
                <td className="px-4 py-2.5 text-right text-muted">{c.releases}</td>
                <td className="px-4 py-2.5 text-right text-text">{c.revenue}</td>
                <td className="px-4 py-2.5 text-right text-muted">{c.paid}</td>
                <td className="px-4 py-2.5 text-right text-muted">{c.turnaround}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function AnalyticsDateRangeMockup() {
  const presets = [
    { label: "Today", key: "today" },
    { label: "Last 7 days", key: "7d" },
    { label: "Last 30 days", key: "30d" },
    { label: "Last 90 days", key: "90d", active: true },
    { label: "Year to date", key: "ytd" },
    { label: "All time", key: "all" },
  ];
  return (
    <>
      <div className="p-4 space-y-3">
        {/* Trigger button — matches real DateRangeSelector trigger */}
        <div className="flex justify-end">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs"
            style={{ borderColor: "var(--signal)", color: "var(--signal)", background: "var(--signal-muted)" }}>
            <Calendar size={12} />
            <span>Last 90 days</span>
            <ChevronDown size={12} />
          </div>
        </div>

        {/* Dropdown — matches real preset list + calendar area */}
        <div className="border border-border rounded-lg bg-panel overflow-hidden">
          <div className="p-3 space-y-0.5">
            {presets.map((p) => (
              <div
                key={p.key}
                className={cn(
                  "flex items-center justify-between px-3 py-1.5 rounded-md text-xs",
                  p.active ? "font-medium" : "text-muted",
                )}
                style={p.active ? { background: "var(--signal-muted)", color: "var(--signal)" } : undefined}
              >
                <span>{p.label}</span>
                {p.active && <Check size={12} style={{ color: "var(--signal)" }} />}
              </div>
            ))}
          </div>
          <Rule />
          <div className="p-3">
            <div className="text-[11px] text-faint mb-2 font-medium">Custom range</div>
            <div className="grid grid-cols-2 gap-2">
              <MockInput text="Dec 14, 2025" className="text-xs" />
              <MockInput text="Mar 14, 2026" className="text-xs" />
            </div>
            <div className="mt-3 flex justify-end">
              <span
                className="px-3 py-1.5 rounded-md text-xs font-medium"
                style={{ background: "var(--signal-muted)", color: "var(--signal)" }}
              >Apply</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ───────────────────────────────────────────────────────
   Article 17: User Settings
   ─────────────────────────────────────────────────────── */

function SettingsOverviewMockup() {
  const panels = [
    "Profile",
    "Subscription",
    "Appearance",
    "Region & Currency",
    "Persona",
    "Payment Tracking",
    "Email Preferences",
    "Mix Defaults",
    "Calendar",
    "Data",
  ];
  return (
    <>
      <div className="m-4 space-y-2">
        <div className="flex items-center gap-3 mb-4">
          <Settings size={18} className="text-signal" />
          <span className="text-sm font-semibold text-text">User Settings</span>
        </div>
        {panels.map((p) => (
          <div
            key={p}
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-lg border text-sm",
              p === "Email Preferences"
                ? "border-signal/40 bg-signal/5 text-text font-medium"
                : "border-border bg-panel text-muted",
            )}
          >
            {p}
            <ChevronDown size={14} className="text-faint -rotate-90" />
          </div>
        ))}
      </div>
    </>
  );
}

function SettingsEmailPrefsMockup() {
  const prefs = [
    { label: "Release Live Alerts", help: "When your release goes live on a platform", on: true },
    { label: "New Comment Alerts", help: "When someone comments on your release", on: true },
    { label: "Weekly Digest", help: "A weekly summary of activity across your releases", on: true },
    { label: "Payment Reminders", help: "When a subscription payment fails", on: false },
    { label: "Payment Confirmations", help: "When a subscription payment is processed", on: true },
    { label: "Subscription Confirmations", help: "When your subscription is activated", on: true },
    { label: "Cancellation Notices", help: "When your subscription is cancelled", on: true },
  ];
  return (
    <>
      <Panel className="m-4">
        <PanelHeader>
          <div className="flex items-center gap-2">
            <Send size={16} className="text-muted" />
            <span className="text-sm font-semibold text-text">Email Preferences</span>
          </div>
          <p className="text-xs text-muted mt-1">Choose which emails you receive from Mix Architect.</p>
        </PanelHeader>
        <Rule />
        <PanelBody className="pt-4 space-y-0.5">
          {prefs.map((p) => (
            <div key={p.label} className="flex items-center justify-between py-2">
              <div>
                <div className="text-xs font-medium text-text">{p.label}</div>
                <div className="text-[10px] text-muted mt-0.5">{p.help}</div>
              </div>
              <div
                className={cn(
                  "relative w-9 h-5 rounded-full transition-colors shrink-0",
                  p.on ? "bg-signal" : "bg-black/20 dark:bg-white/20",
                )}
              >
                <div
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
                  style={{ left: p.on ? 18 : 2 }}
                />
              </div>
            </div>
          ))}
        </PanelBody>
      </Panel>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   ARTICLE 17b: USER SETTINGS (expanded)
   ═══════════════════════════════════════════════════════════ */

function SettingsProfileMockup() {
  return (
    <Panel className="m-4">
      <PanelHeader>
        <span className="text-sm font-semibold text-text">Profile</span>
      </PanelHeader>
      <Rule />
      <PanelBody className="pt-4 space-y-3">
        <div className="space-y-1">
          <span className="text-[10px] text-muted">Display Name</span>
          <div className="rounded-md px-3 py-1.5 text-xs text-text" style={{ background: "var(--panel2)" }}>Jordan Rivera</div>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] text-muted">Company Name</span>
          <div className="rounded-md px-3 py-1.5 text-xs text-text" style={{ background: "var(--panel2)" }}>Riverstone Audio</div>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] text-muted">Email</span>
          <div className="rounded-md px-3 py-1.5 text-xs text-muted opacity-60" style={{ background: "var(--panel2)" }}>jordan@riverstone.audio</div>
        </div>
        <Button variant="primary" className="text-xs px-3 py-1.5">Save</Button>
      </PanelBody>
    </Panel>
  );
}

function SettingsSubscriptionMockup() {
  return (
    <Panel className="m-4">
      <PanelHeader>
        <span className="text-sm font-semibold text-text">Subscription</span>
        <p className="text-xs text-muted mt-1">Manage your Mix Architect plan.</p>
      </PanelHeader>
      <Rule />
      <PanelBody className="pt-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-text">$14/month</span>
              <Pill className="bg-signal/20 text-signal text-[10px]">PRO</Pill>
            </div>
            <p className="text-xs text-muted mt-0.5">Unlimited releases</p>
          </div>
          <Button variant="secondary" className="text-xs px-3 py-1.5">Manage Billing</Button>
        </div>
      </PanelBody>
    </Panel>
  );
}

function SettingsRegionMockup() {
  return (
    <Panel className="m-4">
      <PanelHeader>
        <span className="text-sm font-semibold text-text">Region & Currency</span>
      </PanelHeader>
      <Rule />
      <PanelBody className="pt-4 space-y-3">
        <div className="space-y-1">
          <span className="text-[10px] text-muted">Locale</span>
          <div className="rounded-md px-3 py-1.5 text-xs text-text flex items-center justify-between" style={{ background: "var(--panel2)" }}>
            <span>🇺🇸 English</span>
            <ChevronDown size={12} className="text-muted" />
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] text-muted">Currency</span>
          <div className="rounded-md px-3 py-1.5 text-xs text-text flex items-center justify-between" style={{ background: "var(--panel2)" }}>
            <span>$ USD</span>
            <ChevronDown size={12} className="text-muted" />
          </div>
        </div>
        <div className="rounded-lg px-3 py-2" style={{ background: "var(--panel2)" }}>
          <span className="text-[10px] text-muted">Preview: </span>
          <span className="text-xs font-medium text-text">$1,234.56</span>
        </div>
      </PanelBody>
    </Panel>
  );
}

function SettingsAppearanceMockup() {
  return (
    <Panel className="m-4">
      <PanelHeader>
        <span className="text-sm font-semibold text-text">Appearance</span>
        <p className="text-xs text-muted mt-1">Choose how Mix Architect looks to you.</p>
      </PanelHeader>
      <Rule />
      <PanelBody className="pt-4">
        <div className="flex gap-2">
          {[
            { icon: Sun, label: "Light", active: false },
            { icon: Moon, label: "Dark", active: true },
            { icon: Monitor, label: "System", active: false },
          ].map((opt) => (
            <div
              key={opt.label}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md"
              style={
                opt.active
                  ? { background: "var(--signal)", color: "var(--signal-on)" }
                  : { background: "var(--panel2)", color: "var(--text-muted)" }
              }
            >
              <opt.icon size={14} />
              {opt.label}
            </div>
          ))}
        </div>
      </PanelBody>
    </Panel>
  );
}

function SettingsPersonaMockup() {
  return (
    <Panel className="m-4">
      <PanelHeader>
        <span className="text-sm font-semibold text-text">Persona</span>
      </PanelHeader>
      <Rule />
      <PanelBody className="pt-4 space-y-2">
        {[
          { label: "Artist", active: false },
          { label: "Engineer", active: true },
          { label: "Both", active: false },
          { label: "Other", active: false },
        ].map((opt) => (
          <label key={opt.label} className="flex items-center gap-2.5">
            <div className={cn("w-3.5 h-3.5 rounded-full border-2", opt.active ? "border-signal bg-signal" : "border-muted")} />
            <span className="text-xs text-text">{opt.label}</span>
          </label>
        ))}
        <p className="text-[10px] text-muted pt-1">Your persona tailors default settings like payment tracking.</p>
      </PanelBody>
    </Panel>
  );
}

function SettingsPaymentTrackingMockup() {
  return (
    <Panel className="m-4">
      <PanelHeader>
        <span className="text-sm font-semibold text-text">Payment Tracking</span>
        <p className="text-xs text-muted mt-1">Show payment stats on your dashboard and releases.</p>
      </PanelHeader>
      <Rule />
      <PanelBody className="pt-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-text">Enable payment tracking</div>
            <div className="text-[10px] text-muted mt-0.5">Show fees, payments, and balance on releases</div>
          </div>
          <div className="relative w-10 h-[22px] rounded-full bg-signal shrink-0">
            <div className="absolute top-[3px] w-4 h-4 rounded-full bg-white shadow" style={{ left: 20 }} />
          </div>
        </div>
      </PanelBody>
    </Panel>
  );
}

function SettingsMixDefaultsMockup() {
  return (
    <Panel className="m-4">
      <PanelHeader>
        <span className="text-sm font-semibold text-text">Mix Defaults</span>
        <p className="text-xs text-muted mt-1">Set default values for new releases.</p>
      </PanelHeader>
      <Rule />
      <PanelBody className="pt-4 space-y-3">
        <div className="space-y-1">
          <span className="text-[10px] text-muted">Format</span>
          <div className="flex gap-1.5">
            {["Stereo", "Dolby Atmos", "Stereo + Atmos"].map((f, i) => (
              <div
                key={f}
                className="px-2.5 py-1 text-[10px] font-medium rounded-md"
                style={
                  i === 0
                    ? { background: "var(--signal)", color: "var(--signal-on)" }
                    : { background: "var(--panel2)", color: "var(--text-muted)" }
                }
              >
                {f}
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <span className="text-[10px] text-muted">Sample Rate</span>
            <div className="rounded-md px-3 py-1.5 text-xs text-text flex items-center justify-between" style={{ background: "var(--panel2)" }}>
              <span>48kHz</span>
              <ChevronDown size={12} className="text-muted" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-muted">Bit Depth</span>
            <div className="rounded-md px-3 py-1.5 text-xs text-text flex items-center justify-between" style={{ background: "var(--panel2)" }}>
              <span>24-bit</span>
              <ChevronDown size={12} className="text-muted" />
            </div>
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] text-muted">Default Elements</span>
          <div className="flex gap-1.5 flex-wrap">
            {["Vocals", "Bass", "Drums"].map((tag) => (
              <Pill key={tag} className="text-[10px]">{tag}</Pill>
            ))}
          </div>
        </div>
      </PanelBody>
    </Panel>
  );
}

function SettingsCalendarMockup() {
  return (
    <Panel className="m-4">
      <PanelHeader>
        <span className="text-sm font-semibold text-text">Calendar</span>
      </PanelHeader>
      <Rule />
      <PanelBody className="pt-4 space-y-3">
        <div className="space-y-1">
          <span className="text-[10px] text-muted">Feed URL</span>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-md px-3 py-1.5 text-[10px] text-muted truncate" style={{ background: "var(--panel2)" }}>
              https://mixarchitect.com/api/cal/abc123...
            </div>
            <button className="shrink-0 p-1.5 rounded-md" style={{ background: "var(--panel2)" }}>
              <Copy size={12} className="text-muted" />
            </button>
          </div>
        </div>
        <div className="rounded-lg px-3 py-2 text-[10px] text-muted space-y-1" style={{ background: "var(--panel2)" }}>
          <p>Add this URL to your calendar app:</p>
          <p>Google Calendar, Apple Calendar, Outlook</p>
        </div>
        <button className="flex items-center gap-1.5 text-[10px] text-muted hover:text-text">
          <RefreshCw size={12} />
          Regenerate feed URL
        </button>
      </PanelBody>
    </Panel>
  );
}

function SettingsDataMockup() {
  return (
    <Panel className="m-4">
      <PanelHeader>
        <span className="text-sm font-semibold text-text">Your Data</span>
        <p className="text-xs text-muted mt-1">Download a copy of all your data.</p>
      </PanelHeader>
      <Rule />
      <PanelBody className="pt-4 space-y-3">
        <div className="text-xs text-muted">
          Estimated export size: <span className="font-medium text-text">~2.4 MB</span>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" className="text-xs px-3 py-1.5 flex items-center gap-1.5">
            <Download size={12} />
            Download Export
          </Button>
        </div>
      </PanelBody>
    </Panel>
  );
}

/* ═══════════════════════════════════════════════════════════
   ARTICLE 18: RELEASE SETTINGS
   ═══════════════════════════════════════════════════════════ */

function ReleaseSettingsOverviewMockup() {
  const sections = [
    { icon: Music, label: "Release Details", desc: "Title, artist, type, format, status, genre, date" },
    { icon: User, label: "Client Information", desc: "Client name, email, phone, delivery notes" },
    { icon: Globe, label: "Distribution", desc: "Distributor, label, UPC, copyright" },
    { icon: CreditCard, label: "Payment", desc: "Status, fee, paid amount, balance" },
    { icon: Users, label: "Team Management", desc: "Invite and manage collaborators" },
  ];
  return (
    <Panel className="m-4">
      <PanelHeader>
        <div className="flex items-center gap-2">
          <Settings size={14} className="text-muted" />
          <span className="text-sm font-semibold text-text">Release Settings</span>
        </div>
      </PanelHeader>
      <Rule />
      <PanelBody className="pt-3 space-y-0.5">
        {sections.map((s) => (
          <div key={s.label} className="flex items-center gap-2.5 px-2 py-2 rounded-md" style={{ background: "var(--panel2)" }}>
            <s.icon size={14} className="text-muted shrink-0" />
            <div>
              <div className="text-xs font-medium text-text">{s.label}</div>
              <div className="text-[10px] text-muted">{s.desc}</div>
            </div>
          </div>
        ))}
      </PanelBody>
    </Panel>
  );
}

function ReleaseSettingsDetailsMockup() {
  return (
    <Panel className="m-4">
      <PanelHeader>
        <span className="text-sm font-semibold text-text">Release Details</span>
      </PanelHeader>
      <Rule />
      <PanelBody className="pt-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-14 h-14 rounded-md shrink-0 flex items-center justify-center" style={{ background: "var(--panel2)" }}>
            <Image size={20} className="text-muted opacity-30" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="space-y-1">
              <span className="text-[10px] text-muted">Title</span>
              <div className="rounded-md px-3 py-1.5 text-xs text-text" style={{ background: "var(--panel2)" }}>Midnight Sessions</div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-muted">Artist</span>
              <div className="rounded-md px-3 py-1.5 text-xs text-text" style={{ background: "var(--panel2)" }}>Luna Park</div>
            </div>
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] text-muted">Type</span>
          <div className="flex gap-1.5">
            {["Single", "EP", "Album"].map((t, i) => (
              <div key={t} className="px-2.5 py-1 text-[10px] font-medium rounded-md" style={i === 2 ? { background: "var(--signal)", color: "var(--signal-on)" } : { background: "var(--panel2)", color: "var(--text-muted)" }}>{t}</div>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] text-muted">Status</span>
          <div className="flex gap-1.5">
            {["Draft", "In Progress", "Ready"].map((s, i) => (
              <div key={s} className="px-2.5 py-1 text-[10px] font-medium rounded-md" style={i === 1 ? { background: "var(--signal)", color: "var(--signal-on)" } : { background: "var(--panel2)", color: "var(--text-muted)" }}>{s}</div>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] text-muted">Genre Tags</span>
          <div className="flex gap-1.5 flex-wrap">
            {["Electronic", "Ambient"].map((g) => <Pill key={g} className="text-[10px]">{g}</Pill>)}
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] text-muted">Target Date</span>
          <div className="rounded-md px-3 py-1.5 text-xs text-text" style={{ background: "var(--panel2)" }}>2026-04-15</div>
        </div>
      </PanelBody>
    </Panel>
  );
}

function ReleaseSettingsClientMockup() {
  return (
    <Panel className="m-4">
      <PanelHeader>
        <span className="text-sm font-semibold text-text">Client Information</span>
      </PanelHeader>
      <Rule />
      <PanelBody className="pt-4 space-y-3">
        {[
          { label: "Client Name", value: "Apex Records" },
          { label: "Client Email", value: "info@apexrecords.com" },
          { label: "Client Phone", value: "+1 (555) 012-3456" },
        ].map((f) => (
          <div key={f.label} className="space-y-1">
            <span className="text-[10px] text-muted">{f.label}</span>
            <div className="rounded-md px-3 py-1.5 text-xs text-text" style={{ background: "var(--panel2)" }}>{f.value}</div>
          </div>
        ))}
        <div className="space-y-1">
          <span className="text-[10px] text-muted">Delivery Notes</span>
          <div className="rounded-md px-3 py-2 text-xs text-text min-h-[48px]" style={{ background: "var(--panel2)" }}>
            WAV 48kHz/24-bit. Label copy needed by April 1.
          </div>
        </div>
      </PanelBody>
    </Panel>
  );
}

function ReleaseSettingsDistributionMockup() {
  return (
    <Panel className="m-4">
      <PanelHeader>
        <span className="text-sm font-semibold text-text">Distribution</span>
      </PanelHeader>
      <Rule />
      <PanelBody className="pt-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Distributor", value: "DistroKid" },
            { label: "Record Label", value: "Apex Records" },
            { label: "UPC / EAN", value: "0123456789012" },
            { label: "Catalog Number", value: "APX-2026-003" },
          ].map((f) => (
            <div key={f.label} className="space-y-1">
              <span className="text-[10px] text-muted">{f.label}</span>
              <div className="rounded-md px-3 py-1.5 text-[10px] text-text" style={{ background: "var(--panel2)" }}>{f.value}</div>
            </div>
          ))}
        </div>
        <div className="space-y-1">
          <span className="text-[10px] text-muted">Copyright Holder</span>
          <div className="rounded-md px-3 py-1.5 text-xs text-text" style={{ background: "var(--panel2)" }}>Apex Records LLC</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <span className="text-[10px] text-muted">Copyright Year</span>
            <div className="rounded-md px-3 py-1.5 text-[10px] text-text" style={{ background: "var(--panel2)" }}>2026</div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-muted">P-line</span>
            <div className="rounded-md px-3 py-1.5 text-[10px] text-text" style={{ background: "var(--panel2)" }}>Apex Records LLC</div>
          </div>
        </div>
      </PanelBody>
    </Panel>
  );
}

function ReleaseSettingsPaymentMockup() {
  return (
    <Panel className="m-4">
      <PanelHeader>
        <span className="text-sm font-semibold text-text">Payment</span>
      </PanelHeader>
      <Rule />
      <PanelBody className="pt-4 space-y-3">
        <div className="space-y-1">
          <span className="text-[10px] text-muted">Payment Status</span>
          <div className="flex gap-1.5">
            {["No Fee", "Unpaid", "Partial", "Paid"].map((s, i) => (
              <div key={s} className="px-2.5 py-1 text-[10px] font-medium rounded-md" style={i === 2 ? { background: "var(--signal)", color: "var(--signal-on)" } : { background: "var(--panel2)", color: "var(--text-muted)" }}>{s}</div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <span className="text-[10px] text-muted">Project Fee</span>
            <div className="rounded-md px-3 py-1.5 text-xs text-text" style={{ background: "var(--panel2)" }}>$2,500.00</div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-muted">Paid Amount</span>
            <div className="rounded-md px-3 py-1.5 text-xs text-text" style={{ background: "var(--panel2)" }}>$1,000.00</div>
          </div>
        </div>
        <div className="rounded-lg px-3 py-2" style={{ background: "var(--panel2)" }}>
          <span className="text-[10px] text-muted">Balance Due: </span>
          <span className="text-xs font-semibold text-text">$1,500.00</span>
        </div>
      </PanelBody>
    </Panel>
  );
}

function ReleaseSettingsTeamMockup() {
  return (
    <Panel className="m-4">
      <PanelHeader>
        <span className="text-sm font-semibold text-text">Team Management</span>
      </PanelHeader>
      <Rule />
      <PanelBody className="pt-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-md px-3 py-1.5 text-xs text-muted" style={{ background: "var(--panel2)" }}>
            Email address
          </div>
          <div className="rounded-md px-3 py-1.5 text-xs text-text flex items-center gap-1" style={{ background: "var(--panel2)" }}>
            Collaborator
            <ChevronDown size={10} className="text-muted" />
          </div>
          <Button variant="primary" className="text-[10px] px-2 py-1 flex items-center gap-1">
            <UserPlus size={10} />
            Invite
          </Button>
        </div>
        <div className="space-y-1.5">
          {[
            { name: "Jordan Rivera", role: "Owner", color: "text-signal" },
            { name: "alex@studio.com", role: "Collaborator", color: "text-muted", pending: false },
            { name: "client@label.com", role: "Client", color: "text-muted", pending: true },
          ].map((m) => (
            <div key={m.name} className="flex items-center justify-between py-1.5 px-2 rounded-md" style={{ background: "var(--panel2)" }}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium" style={{ background: "var(--border)" }}>
                  {m.name[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-xs text-text">{m.name}</div>
                  <div className={cn("text-[10px]", m.color)}>{m.role}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {m.pending && <Pill className="text-[10px] bg-orange-500/20 text-orange-400">Invited</Pill>}
                {m.role !== "Owner" && <Trash2 size={12} className="text-muted opacity-50" />}
              </div>
            </div>
          ))}
        </div>
      </PanelBody>
    </Panel>
  );
}

/* ═══════════════════════════════════════════════════════════
   ARTICLE 19: TRACKING EXPENSES (5 mockups)
   ═══════════════════════════════════════════════════════════ */

function ExpenseFinancialsTabMockup() {
  return (
    <div className="p-4 space-y-4">
      {/* Tab bar */}
      <div className="flex gap-0 border-b border-border">
        {["Tracks", "Globals", "Distribution", "Financials"].map((t) => (
          <span
            key={t}
            className={cn(
              "px-4 py-2.5 text-sm font-medium relative",
              t === "Financials" ? "text-text" : "text-muted",
            )}
          >
            {t}
            {t === "Financials" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-signal" />}
          </span>
        ))}
      </div>
      <p className="text-xs text-muted">Expenses are on the <span className="text-text font-medium">Financials</span> tab of each release, alongside your Financial Summary, Payment status, and Time Log.</p>
    </div>
  );
}

function ExpenseAddMockup() {
  return (
    <Panel className="m-4">
      <PanelBody className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="label-sm text-muted">EXPENSES</span>
          <span className="text-xs text-signal font-medium">+ Add</span>
        </div>
        <Rule />
        {/* Inline add form */}
        <div className="space-y-2">
          <MockInput text="Studio rental — 2 days" className="text-xs h-7" />
          <div className="grid grid-cols-3 gap-2">
            <MockInput text="$450.00" className="text-xs h-7" />
            <MockInput text="Mike G" className="text-xs h-7" />
            <MockInput text="Client" className="text-xs h-7" />
          </div>
          <div className="flex gap-2 justify-end">
            <span className="p-1"><X size={12} className="text-faint" /></span>
            <span className="p-1"><Check size={12} className="text-signal" /></span>
          </div>
        </div>
      </PanelBody>
    </Panel>
  );
}

function ExpenseListMockup() {
  return (
    <Panel className="m-4">
      <PanelBody className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="label-sm text-muted">EXPENSES</span>
          <span className="text-xs text-signal font-medium">+ Add</span>
        </div>
        <Rule />
        {[
          { desc: "Studio rental — 2 days", amount: "$450.00", by: "Mike G" },
          { desc: "Mastering reference tracks", amount: "$29.99", by: "Mike G" },
          { desc: "Session musician (bass)", amount: "$200.00", by: "Client" },
        ].map((e) => (
          <div key={e.desc} className="flex items-center gap-3 py-1.5 group">
            <div className="flex-1 min-w-0">
              <span className="text-sm text-text truncate block">{e.desc}</span>
              <span className="text-[10px] text-faint">Paid by {e.by}</span>
            </div>
            <span className="text-sm text-text font-medium tabular-nums">{e.amount}</span>
            <Pencil size={12} className="text-faint opacity-40" />
            <Trash2 size={12} className="text-faint opacity-40" />
          </div>
        ))}
        <Rule />
        <div className="flex justify-between text-xs">
          <span className="text-muted">3 items</span>
          <span className="text-text font-semibold">$679.99</span>
        </div>
      </PanelBody>
    </Panel>
  );
}

function ExpenseFinancialSummaryMockup() {
  return (
    <Panel className="m-4">
      <PanelBody className="space-y-2">
        <span className="label-sm text-muted">FINANCIAL SUMMARY</span>
        <Rule />
        <div className="flex justify-between text-sm"><span className="text-muted">Project fee</span><span className="text-text">$2,500.00</span></div>
        <div className="flex justify-between text-sm"><span className="text-muted">Time logged</span><span className="text-text"><span className="text-faint">6.5 hrs</span> $325.00</span></div>
        <div className="flex justify-between text-sm"><span className="text-muted">Expenses</span><span className="text-status-orange">3 items ($679.99)</span></div>
        <Rule />
        <div className="flex justify-between text-sm font-semibold"><span className="text-muted">Net</span><span className="text-text">$1,820.01</span></div>
      </PanelBody>
    </Panel>
  );
}

function ExpenseExportMockup() {
  return (
    <Panel className="m-4">
      <PanelBody className="space-y-2">
        <span className="label-sm text-muted">EXPORT INCLUDES</span>
        <Rule />
        {[
          { icon: FileText, label: "metadata.json", desc: "Release + track data with expenses array" },
          { icon: DollarSign, label: "expenses.csv", desc: "Description, amount, paid_by, owed_by, timestamps" },
          { icon: Clock, label: "time-entries.csv", desc: "Hours, rate, description, entry type, timestamps" },
        ].map((f) => (
          <div key={f.label} className="flex items-center gap-3 py-1.5">
            <f.icon size={14} className="text-signal shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-sm text-text block">{f.label}</span>
              <span className="text-[10px] text-faint">{f.desc}</span>
            </div>
          </div>
        ))}
      </PanelBody>
    </Panel>
  );
}

/* ═══════════════════════════════════════════════════════════
   ARTICLE 20: LOGGING TIME (5 mockups)
   ═══════════════════════════════════════════════════════════ */

function TimerSettingsMockup() {
  return (
    <Panel className="m-4">
      <PanelBody className="space-y-3">
        <span className="label-sm text-muted">PAYMENT TRACKING</span>
        <Rule />
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-text block">Enable payment tracking</span>
            <span className="text-xs text-faint">Track fees and payment status on releases</span>
          </div>
          <div className="w-9 h-5 rounded-full bg-signal relative">
            <span className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-white" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-text">Default hourly rate</span>
          <MockInput text="$50.00" className="text-xs h-7 w-24 text-right" />
        </div>
        <p className="text-[10px] text-faint">Pre-filled when logging timer or manual entries</p>
      </PanelBody>
    </Panel>
  );
}

function TimerFloatingMockup() {
  return (
    <div className="p-4 space-y-4">
      <p className="text-xs text-muted">The floating timer appears in the bottom-right of every release page when Payment Tracking is enabled.</p>
      <div className="flex items-center gap-4">
        {/* Collapsed state */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full border border-border bg-panel flex items-center justify-center">
            <Clock size={16} className="text-faint" />
          </div>
          <span className="text-[10px] text-faint">Idle</span>
        </div>
        <ArrowRight size={14} className="text-faint" />
        {/* Expanded state */}
        <div className="flex flex-col items-center gap-1">
          <div className="rounded-full border border-border bg-panel flex items-center gap-3 px-4 py-2">
            <Clock size={14} className="text-faint" />
            <span className="text-sm text-muted tabular-nums">00:00:00</span>
            <span className="px-3 py-1 rounded-full bg-signal/10 text-signal text-xs font-medium flex items-center gap-1"><Play size={10} /> Start</span>
          </div>
          <span className="text-[10px] text-faint">Expanded</span>
        </div>
        <ArrowRight size={14} className="text-faint" />
        {/* Running state */}
        <div className="flex flex-col items-center gap-1">
          <div className="rounded-xl border border-signal/30 bg-panel flex items-center gap-3 px-4 py-2">
            <Clock size={14} className="text-signal" />
            <span className="text-sm text-signal tabular-nums font-medium">01:23:45</span>
            <span className="p-1"><Pause size={12} className="text-muted" /></span>
            <span className="p-1"><Square size={12} className="text-muted" /></span>
          </div>
          <span className="text-[10px] text-faint">Running</span>
        </div>
      </div>
    </div>
  );
}

function TimerLogFormMockup() {
  return (
    <Panel className="m-4 max-w-xs">
      <PanelBody className="space-y-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted">Log this session</span>
          <X size={12} className="text-faint" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-faint uppercase">Hours</span>
            <MockInput text="1.5" className="text-xs h-7" />
          </div>
          <div>
            <span className="text-[10px] text-faint uppercase">Rate/hr</span>
            <MockInput text="$50.00" className="text-xs h-7" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-sm bg-signal flex items-center justify-center"><Check size={10} className="text-white" /></div>
          <span className="text-xs text-muted">Billable</span>
        </div>
        <p className="text-xs text-faint">Total: $75.00</p>
        <MockInput text="Mix revisions for track 3" className="text-xs h-7" />
        <div className="flex gap-2 justify-end pt-1">
          <span className="text-xs text-muted">Discard</span>
          <span className="text-xs text-signal font-medium">Save Entry</span>
        </div>
      </PanelBody>
    </Panel>
  );
}

function TimeEntryListMockup() {
  return (
    <Panel className="m-4">
      <PanelBody className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="label-sm text-muted">TIME LOG</span>
          <span className="text-xs text-signal font-medium">+ Add</span>
        </div>
        <Rule />
        {[
          { icon: Clock, desc: "Mix revisions for track 3", hrs: "1.50", rate: "$50", total: "$75.00", type: "timer" },
          { icon: Pencil, desc: "Initial session — rough mix", hrs: "3.00", rate: "$50", total: "$150.00", type: "manual" },
          { icon: Clock, desc: "Mastering pass", hrs: "2.00", rate: "$50", total: "$100.00", type: "timer" },
        ].map((e) => (
          <div key={e.desc} className="flex items-center gap-3 py-1.5">
            <e.icon size={12} className="text-faint shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-sm text-text truncate block">{e.desc}</span>
              <span className="text-[10px] text-faint">{e.hrs} hrs × {e.rate}/hr</span>
            </div>
            <span className="text-sm text-text font-medium tabular-nums">{e.total}</span>
          </div>
        ))}
        <Rule />
        <div className="flex justify-between text-xs">
          <span className="text-muted">6.50 hrs total</span>
          <span className="text-text font-semibold">$325.00</span>
        </div>
      </PanelBody>
    </Panel>
  );
}

function TimeExportMockup() {
  return (
    <Panel className="m-4">
      <PanelBody className="space-y-2">
        <span className="label-sm text-muted">TIME ENTRIES IN EXPORT</span>
        <Rule />
        <div className="overflow-x-auto">
          <div className="text-[10px] font-medium text-faint flex gap-4 py-1">
            <span className="w-16">Hours</span><span className="w-16">Rate</span><span className="flex-1">Description</span><span className="w-14">Type</span>
          </div>
          <Rule />
          {[
            { hrs: "1.50", rate: "$50.00", desc: "Mix revisions for track 3", type: "timer" },
            { hrs: "3.00", rate: "$50.00", desc: "Initial session — rough mix", type: "manual" },
            { hrs: "2.00", rate: "$50.00", desc: "Mastering pass", type: "timer" },
          ].map((r) => (
            <div key={r.desc} className="text-xs text-muted flex gap-4 py-1.5">
              <span className="w-16 tabular-nums text-text">{r.hrs}</span>
              <span className="w-16 tabular-nums text-text">{r.rate}</span>
              <span className="flex-1 truncate">{r.desc}</span>
              <span className="w-14"><Pill className="text-[9px]">{r.type}</Pill></span>
            </div>
          ))}
        </div>
      </PanelBody>
    </Panel>
  );
}

/* ═══════════════════════════════════════════════════════════
   SIGN IN PAGE MOCKUPS
   ═══════════════════════════════════════════════════════════ */

function SignInMockup() {
  return (
    <div className="m-4 max-w-xs mx-auto space-y-4">
      <div className="text-center space-y-1">
        <p className="text-lg font-bold text-text">Mix Architect</p>
        <p className="text-xs text-muted">Sign in to your account</p>
      </div>
      <div className="space-y-3">
        <div>
          <span className="label-sm text-muted mb-1 block">EMAIL</span>
          <MockInput text="you@email.com" className="text-xs h-8 flex items-center" placeholder />
        </div>
        <div>
          <span className="label-sm text-muted mb-1 block">PASSWORD</span>
          <MockInput text="••••••••" className="text-xs h-8 flex items-center" />
        </div>
        <div className="rounded-sm bg-signal text-signal-on text-xs font-semibold h-9 flex items-center justify-center">
          Sign In
        </div>
      </div>
      <div className="relative">
        <Rule />
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-panel2 px-3 text-[10px] text-faint">or</span>
      </div>
      <div className="rounded-sm bg-white text-zinc-800 text-xs font-semibold h-9 flex items-center justify-center gap-2 border border-zinc-300">
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Continue with Google
      </div>
      <p className="text-center text-[10px] text-faint">
        Don&apos;t have an account? <span className="text-signal">Create one</span>
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STRIPE CONNECT MOCKUPS
   ═══════════════════════════════════════════════════════════ */

function StripeConnectSetupMockup() {
  return (
    <Panel className="m-4">
      <PanelHeader>Payment Collection</PanelHeader>
      <PanelBody className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-[#635bff]/10 flex items-center justify-center">
            <CreditCard size={20} className="text-[#635bff]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text">Stripe</p>
            <p className="text-xs text-muted">Accept payments from clients</p>
          </div>
        </div>
        <Button variant="primary" className="w-full">Connect Stripe Account</Button>
        <p className="text-[10px] text-faint text-center">1% platform fee on transactions &middot; Stripe processing fees apply</p>
      </PanelBody>
    </Panel>
  );
}

function StripeCreateQuoteMockup() {
  return (
    <Panel className="m-4">
      <PanelHeader>New Quote</PanelHeader>
      <PanelBody className="space-y-3">
        {[
          { desc: "Mixing — 6 tracks", amount: "$1,200" },
          { desc: "Mastering", amount: "$600" },
        ].map((item) => (
          <div key={item.desc} className="flex items-center justify-between py-2 px-3 rounded-md border border-border bg-panel">
            <span className="text-sm text-text">{item.desc}</span>
            <span className="text-sm font-semibold text-text">{item.amount}</span>
          </div>
        ))}
        <Rule />
        <div className="flex items-center justify-between px-3">
          <span className="text-sm font-semibold text-text">Total</span>
          <span className="text-base font-bold text-text">$1,800</span>
        </div>
        <Rule />
        <div>
          <span className="label-sm text-muted mb-2 block">PAYMENT SCHEDULE</span>
          <div className="flex flex-wrap gap-1.5">
            <Pill>Single</Pill>
            <Pill className="!bg-signal-muted !text-signal ring-1 ring-signal/30">Deposit + Balance</Pill>
            <Pill>50/50</Pill>
            <Pill>Custom</Pill>
          </div>
        </div>
      </PanelBody>
    </Panel>
  );
}

function StripeSendQuoteMockup() {
  return (
    <Panel className="m-4">
      <PanelHeader>Quote #1024</PanelHeader>
      <PanelBody className="space-y-3">
        <div className="flex items-center justify-between">
          <StatusIndicator color="blue" label="Sent" />
          <span className="text-xs text-muted">client@email.com</span>
        </div>
        <div className="space-y-2">
          {[
            { label: "Deposit", amount: "$900", status: "green" as const, statusLabel: "Paid" },
            { label: "Balance", amount: "$900", status: "orange" as const, statusLabel: "Pending" },
          ].map((inst) => (
            <div key={inst.label} className="flex items-center justify-between py-2 px-3 rounded-md border border-border bg-panel">
              <div className="flex items-center gap-2">
                <StatusDot color={inst.status} />
                <span className="text-sm text-text">{inst.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-text">{inst.amount}</span>
                <Pill className={inst.status === "green" ? "!bg-emerald-500/10 !text-emerald-500" : "!bg-amber-500/10 !text-amber-500"}>{inst.statusLabel}</Pill>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1 gap-1.5"><Copy size={14} /> Copy Link</Button>
        </div>
      </PanelBody>
    </Panel>
  );
}

function StripePaymentFlowMockup() {
  return (
    <div className="m-4 p-4">
      <div className="flex items-center justify-between gap-2">
        {[
          { icon: Send, label: "Quote Sent" },
          { icon: CreditCard, label: "Client Pays" },
          { icon: CheckCircle2, label: "Status Updated" },
          { icon: Download, label: "Files Unlocked" },
        ].map((step, i, arr) => (
          <div key={step.label} className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div className="w-8 h-8 rounded-full bg-signal-muted flex items-center justify-center">
                <step.icon size={14} className="text-signal" />
              </div>
              <span className="text-[10px] text-muted text-center whitespace-nowrap">{step.label}</span>
            </div>
            {i < arr.length - 1 && <ArrowRight size={14} className="text-faint shrink-0 mb-5" />}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   EMAIL PREFERENCES MOCKUPS
   ═══════════════════════════════════════════════════════════ */

function EmailTypesMockup() {
  return (
    <Panel className="m-4">
      <PanelHeader>Email Notifications</PanelHeader>
      <PanelBody className="divide-y divide-border">
        {[
          { label: "Release Live Alerts", desc: "When a release goes live on a platform" },
          { label: "New Comment Alerts", desc: "When someone comments on your release" },
          { label: "Weekly Digest", desc: "Activity summary across your releases" },
          { label: "Client Feedback", desc: "When a client approves or requests changes" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3 py-3">
            <div className="w-7 h-7 rounded-md bg-signal-muted flex items-center justify-center shrink-0">
              <Mail size={14} className="text-signal" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text">{item.label}</p>
              <p className="text-xs text-muted truncate">{item.desc}</p>
            </div>
          </div>
        ))}
      </PanelBody>
    </Panel>
  );
}

function EmailTogglesMockup() {
  return (
    <Panel className="m-4">
      <PanelHeader>Email Preferences</PanelHeader>
      <PanelBody className="divide-y divide-border">
        {[
          { label: "Activity", on: true },
          { label: "Billing", on: true },
          { label: "Comments", on: false },
          { label: "Digest", on: true },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between py-3">
            <span className="text-sm text-text">{item.label}</span>
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", item.on ? "bg-emerald-500" : "bg-border")} />
              <span className="text-xs text-muted">{item.on ? "On" : "Off"}</span>
            </div>
          </div>
        ))}
      </PanelBody>
    </Panel>
  );
}

/* ═══════════════════════════════════════════════════════════
   PERSONA ONBOARDING MOCKUPS
   ═══════════════════════════════════════════════════════════ */

function PersonaSelectionMockup() {
  return (
    <div className="m-4 grid grid-cols-2 gap-3">
      {[
        { icon: Music, label: "Artist", desc: "I'm releasing my own music", selected: false },
        { icon: Users, label: "Engineer", desc: "I work with clients", selected: true },
      ].map((card) => (
        <div
          key={card.label}
          className={cn(
            "rounded-lg border-2 p-4 text-center space-y-2 transition-colors",
            card.selected ? "border-signal bg-signal-muted" : "border-border bg-panel",
          )}
        >
          <div className="w-10 h-10 mx-auto rounded-full bg-panel2 flex items-center justify-center">
            <card.icon size={20} className={card.selected ? "text-signal" : "text-muted"} />
          </div>
          <p className="text-sm font-semibold text-text">{card.label}</p>
          <p className="text-xs text-muted">{card.desc}</p>
        </div>
      ))}
    </div>
  );
}

function PersonaComparisonMockup() {
  return (
    <div className="m-4 grid grid-cols-2 gap-3">
      {[
        { label: "Artist", items: ["Releases", "Audio", "Distribution"] },
        { label: "Engineer", items: ["Releases", "Audio", "Distribution", "Payments", "Portal", "Analytics", "Time"] },
      ].map((col) => (
        <Panel key={col.label}>
          <PanelHeader>{col.label}</PanelHeader>
          <PanelBody className="space-y-1">
            {col.items.map((item) => (
              <div key={item} className="flex items-center gap-2 py-1.5 px-2 rounded-md text-xs text-muted">
                <div className="w-1.5 h-1.5 rounded-full bg-signal shrink-0" />
                {item}
              </div>
            ))}
          </PanelBody>
        </Panel>
      ))}
    </div>
  );
}

function PersonaFeatureTogglesMockup() {
  return (
    <Panel className="m-4">
      <PanelHeader>Feature Visibility</PanelHeader>
      <PanelBody className="divide-y divide-border">
        {[
          { label: "Payment Tracking", on: true },
          { label: "Client Portal", on: true },
          { label: "Distribution Tracker", on: true },
          { label: "Time Tracking", on: false },
          { label: "Analytics", on: true },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between py-3">
            <span className="text-sm text-text">{item.label}</span>
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", item.on ? "bg-emerald-500" : "bg-border")} />
              <span className="text-xs text-muted">{item.on ? "On" : "Off"}</span>
            </div>
          </div>
        ))}
      </PanelBody>
    </Panel>
  );
}

/* ═══════════════════════════════════════════════════════════
   SUBMIT FOR FEATURE MOCKUPS
   ═══════════════════════════════════════════════════════════ */

function SubmitFeatureModalMockup() {
  return (
    <Panel className="m-4">
      <PanelHeader>Submit for Feature</PanelHeader>
      <PanelBody className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-md border border-border bg-panel">
          <div className="w-12 h-12 rounded-md shrink-0 flex items-center justify-center" style={{ background: "var(--panel2)" }}>
            <Music size={20} className="text-muted opacity-30" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text">Album Title</p>
            <p className="text-xs text-muted">Artist Name</p>
            <p className="text-[10px] text-faint mt-0.5">6 tracks &middot; Album</p>
          </div>
        </div>
        <div>
          <span className="label-sm text-muted mb-1 block">PITCH NOTE</span>
          <div className="input min-h-[60px] text-xs text-faint" style={{ pointerEvents: "none" }}>
            Why should we feature this release?
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="w-4 h-4 mt-0.5 rounded border border-signal bg-signal-muted flex items-center justify-center shrink-0">
            <Check size={10} className="text-signal" />
          </div>
          <span className="text-xs text-muted">I grant permission to feature this release</span>
        </div>
        <Button variant="primary" className="w-full">Submit for Review</Button>
      </PanelBody>
    </Panel>
  );
}

function SubmitFeatureStatusMockup() {
  return (
    <div className="m-4 p-4">
      <div className="flex items-center justify-between gap-4">
        {[
          { icon: Clock, label: "Submitted", color: "text-amber-500", bg: "bg-amber-500/10" },
          { icon: Star, label: "Featured", color: "text-signal", bg: "bg-signal-muted" },
          { icon: X, label: "Declined", color: "text-faint", bg: "bg-panel2" },
        ].map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-1.5 flex-1">
            <div className={cn("w-9 h-9 rounded-full flex items-center justify-center", s.bg)}>
              <s.icon size={16} className={s.color} />
            </div>
            <span className="text-xs text-muted">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MOCKUP REGISTRY
   ═══════════════════════════════════════════════════════════ */

const MOCKUPS: Record<string, () => React.ReactNode> = {
  /* Article 1: Welcome */
  "dashboard": DashboardMockup,
  "nav-rail": NavRailMockup,
  "key-concepts": KeyConceptsMockup,
  /* Article 2: First Release */
  "create-release": CreateReleaseMockup,
  "cover-art-upload": CoverArtUploadMockup,
  "track-upload": TrackUploadMockup,
  "release-status": ReleaseStatusMockup,
  /* Article 3: Collaborators */
  "invite-collaborator": InviteCollaboratorMockup,
  "collaborator-roles": CollaboratorRolesMockup,
  "accept-invitation": AcceptInvitationMockup,
  "portal-sharing": PortalSharingMockup,
  /* Article 4: Track Tabs (one per tab) */
  "track-tab-intent": TrackTabIntentMockup,
  "track-tab-specs": TrackTabSpecsMockup,
  "track-tab-audio": TrackTabAudioMockup,
  "track-tab-lufs": TrackTabLufsMockup,
  "track-tab-distribution": TrackTabDistributionMockup,
  "track-tab-portal": TrackTabPortalMockup,
  "track-tab-notes": TrackTabNotesMockup,
  /* Article 5: Audio Upload */
  "audio-upload": AudioUploadMockup,
  "track-versions": TrackVersionsMockup,
  "waveform-player": WaveformPlayerMockup,
  /* Article 6: Delivery Formats */
  "format-convert": FormatConvertMockup,
  "export-download": ExportDownloadMockup,
  "supported-formats": SupportedFormatsMockup,
  /* Article 7: Timestamped Comments */
  "comment-waveform": CommentWaveformMockup,
  "portal-comments": PortalCommentsMockup,
  "resolve-feedback": ResolveFeedbackMockup,
  /* Article 8: Client Portal */
  "portal-settings": PortalSettingsMockup,
  "portal-track-visibility": PortalTrackVisibilityMockup,
  "portal-approval": PortalApprovalMockup,
  /* Article 9: Timeline */
  "timeline-full": TimelineFullMockup,
  "timeline-navigate": TimelineNavigateMockup,
  "timeline-dates": TimelineDatesMockup,
  /* Article 10: Templates */
  "template-contents": TemplateContentsMockup,
  "template-create": TemplateCreateMockup,
  "template-use": TemplateUseMockup,
  /* Article 11: Payment Tracking */
  "payment-dashboard": PaymentDashboardMockup,
  "payment-release-fees": PaymentReleaseFeesMockup,
  "payment-track-fees": PaymentTrackFeesMockup,
  /* Article 12: Export */
  "export-contents": ExportContentsMockup,
  "export-progress": ExportProgressMockup,
  "export-privacy": ExportPrivacyMockup,
  /* Article 13: Subscription */
  "plan-current": PlanCurrentMockup,
  "upgrade-pro": UpgradeProMockup,
  "manage-payment": ManagePaymentMockup,
  /* Article 14: Cancel */
  "cancel-subscription": CancelSubscriptionMockup,
  "data-after-cancel": DataAfterCancelMockup,
  "resubscribe": ResubscribeMockup,
  /* Article 15: Distribution Tracker */
  "distribution-add-platform": DistributionAddPlatformMockup,
  "distribution-status": DistributionStatusMockup,
  "distribution-spotify": DistributionSpotifyMockup,
  "distribution-edit": DistributionEditMockup,
  "distribution-bulk": DistributionBulkMockup,
  "distribution-distributor": DistributionDistributorMockup,
  /* Article 16: User Analytics */
  "analytics-overview": AnalyticsOverviewMockup,
  "analytics-velocity": AnalyticsVelocityMockup,
  "analytics-revenue": AnalyticsRevenueMockup,
  "analytics-clients": AnalyticsClientsMockup,
  "analytics-date-range": AnalyticsDateRangeMockup,
  /* Article 17: User Settings */
  "settings-overview": SettingsOverviewMockup,
  "settings-profile": SettingsProfileMockup,
  "settings-subscription": SettingsSubscriptionMockup,
  "settings-region": SettingsRegionMockup,
  "settings-appearance": SettingsAppearanceMockup,
  "settings-persona": SettingsPersonaMockup,
  "settings-payment-tracking": SettingsPaymentTrackingMockup,
  "settings-email-prefs": SettingsEmailPrefsMockup,
  "settings-mix-defaults": SettingsMixDefaultsMockup,
  "settings-calendar": SettingsCalendarMockup,
  "settings-data": SettingsDataMockup,
  /* Article 18: Release Settings */
  "release-settings-overview": ReleaseSettingsOverviewMockup,
  "release-settings-details": ReleaseSettingsDetailsMockup,
  "release-settings-client": ReleaseSettingsClientMockup,
  "release-settings-distribution": ReleaseSettingsDistributionMockup,
  "release-settings-payment": ReleaseSettingsPaymentMockup,
  "release-settings-team": ReleaseSettingsTeamMockup,
  /* Article 19: Tracking Expenses */
  "expense-financials-tab": ExpenseFinancialsTabMockup,
  "expense-add": ExpenseAddMockup,
  "expense-list": ExpenseListMockup,
  "expense-financial-summary": ExpenseFinancialSummaryMockup,
  "expense-export": ExpenseExportMockup,
  /* Article 20: Logging Time */
  "timer-settings": TimerSettingsMockup,
  "timer-floating": TimerFloatingMockup,
  "timer-log-form": TimerLogFormMockup,
  "time-entry-list": TimeEntryListMockup,
  "time-export": TimeExportMockup,
  /* Article 21: Signing In */
  "sign-in-page": SignInMockup,
  /* Article: Stripe Connect */
  "stripe-connect-setup": StripeConnectSetupMockup,
  "stripe-create-quote": StripeCreateQuoteMockup,
  "stripe-send-quote": StripeSendQuoteMockup,
  "stripe-payment-flow": StripePaymentFlowMockup,
  /* Article: Email Preferences */
  "email-types": EmailTypesMockup,
  "email-toggles": EmailTogglesMockup,
  /* Article: Persona Onboarding */
  "persona-selection": PersonaSelectionMockup,
  "persona-comparison": PersonaComparisonMockup,
  "persona-feature-toggles": PersonaFeatureTogglesMockup,
  /* Article: Submit for Feature */
  "submit-feature-modal": SubmitFeatureModalMockup,
  "submit-feature-status": SubmitFeatureStatusMockup,
};

/* ═══════════════════════════════════════════════════════════
   PUBLIC COMPONENT
   ═══════════════════════════════════════════════════════════ */

export function ScreenMockup({ mockupId }: { mockupId: string }) {
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
