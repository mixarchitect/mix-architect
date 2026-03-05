"use client";

/* ═══════════════════════════════════════════════════════════
   SCREEN MOCKUP — Help article visual aids using real components
   47 mockups (14 articles, ~3 each; Article 4 has 6)
   ═══════════════════════════════════════════════════════════ */

import {
  Home, Search, LayoutTemplate, Settings, HelpCircle,
  Image, Music, Play, ChevronDown, Send, ArrowRight,
  MessageSquare, MessageCircle, Plus, Check, X,
  Disc3, Download, ArrowUpCircle, Globe, Share2,
  Calendar, Upload, GripVertical, Copy, Link2,
  Shield, CreditCard, CheckCircle2, Clock,
  ClipboardList, FileText, Users, Sparkles, Eye,
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

function MockAvatar({ initials, size = "md" }: { initials: string; size?: "sm" | "md" }) {
  return (
    <span className={cn(
      "rounded-full bg-signal text-signal-on font-bold flex items-center justify-center shrink-0",
      size === "sm" ? "w-5 h-5 text-[8px]" : "w-6 h-6 text-[10px]",
    )}>
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

function WaveformBars({ highlight, className }: { highlight?: number; className?: string }) {
  return (
    <div className={cn("flex items-end gap-[2px] h-8", className)}>
      {BAR_HEIGHTS.map((h, i) => (
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
        <PanelBody className="space-y-4">
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
      <div className="p-4">
        <div className="w-48 mx-auto aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 bg-panel2">
          <Image size={32} className="text-muted" />
          <span className="text-sm font-medium text-muted">Click to upload</span>
          <span className="text-xs text-faint">JPEG or PNG, min 1400x1400</span>
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
        <PanelBody className="space-y-4">
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
        <PanelBody className="space-y-3">
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
        <PanelBody>
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
        <PanelBody className="space-y-4">
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
          <PanelBody className="space-y-3">
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
          <PanelBody className="space-y-3">
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
                <div key={f} className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-signal/30 bg-signal-muted">
                  <Check size={12} className="text-signal" />
                  <span className="text-sm font-medium text-text">{f}</span>
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

function TrackTabAudioMockup() {
  return (
    <>
      <div className="p-4 space-y-4">
        <TrackTabBar active="Audio" />
        <Panel>
          <PanelBody className="space-y-4">
            <MockSelect text="v3 - mix-v3-final.wav (latest)" />
            <div className="bg-panel2 rounded-md p-3">
              <WaveformBars highlight={14} />
            </div>
            <div className="flex items-center gap-3">
              <button type="button" className="w-9 h-9 rounded-full bg-signal text-signal-on flex items-center justify-center">
                <Play size={16} fill="currentColor" />
              </button>
              <span className="text-sm text-muted">1:24 / 3:42</span>
              <span className="flex-1" />
              <span className="text-xs text-faint font-medium">-14.2 LUFS</span>
            </div>
            <Rule />
            <div className="flex items-center gap-2">
              <MockInput text="Add comment at 1:24..." className="flex-1" placeholder />
              <Button variant="primary"><Send size={14} /></Button>
            </div>
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
          <PanelBody className="space-y-3">
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
          <PanelBody className="space-y-3">
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
          <PanelBody className="space-y-1">
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
        <PanelBody className="space-y-3">
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
        <PanelBody className="space-y-4">
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
        <PanelBody className="space-y-4">
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
        <PanelBody>
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
  return (
    <>
      <Panel className="m-4">
        <PanelBody className="space-y-4">
          <div>
            <span className="label text-xs text-faint">CONVERTIBLE FORMATS</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {["WAV", "AIFF", "FLAC", "MP3", "AAC", "OGG", "ALAC"].map((f) => (
                <Pill key={f} active>{f}</Pill>
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
        <PanelBody className="space-y-3">
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
        <PanelBody>
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
        <PanelBody className="space-y-3">
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
        <PanelBody className="space-y-4">
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
        <PanelBody className="space-y-4">
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
        <PanelBody className="space-y-4">
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
        <PanelBody>
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
        <PanelBody>
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
        <PanelBody>
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
  return (
    <>
      <Panel className="m-4">
        <PanelHeader>
          <div className="flex items-center gap-2">
            <LayoutTemplate size={18} className="text-signal" />
            <span className="text-base font-semibold text-text">Album Master</span>
          </div>
        </PanelHeader>
        <PanelBody className="space-y-4">
          <div>
            <span className="label text-xs text-faint">MIX DEFAULTS</span>
            <DataGrid className="mt-2">
              <DataCell label="Format" value="Stereo" size="small" />
              <DataCell label="Sample Rate" value="48" unit="kHz" size="small" />
              <DataCell label="Bit Depth" value="24" unit="bit" size="small" />
            </DataGrid>
          </div>
          <Rule />
          <div>
            <span className="label text-xs text-faint">DEFAULT ELEMENTS</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {["Vocal stems", "Instrument bus", "Reference mix"].map((e) => <Pill key={e}>{e}</Pill>)}
            </div>
          </div>
          <Rule />
          <div>
            <span className="label text-xs text-faint">INCLUDED SETTINGS</span>
            <div className="mt-2 space-y-1 text-sm text-muted">
              {["Stereo format", "48 kHz / 24-bit", "WAV + FLAC delivery"].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <Check size={14} className="text-signal" />
                  {t}
                </div>
              ))}
            </div>
          </div>
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
        <PanelBody className="space-y-4">
          <div>
            <label className="label text-xs text-faint mb-1.5 block">TEMPLATE NAME</label>
            <MockInput text="Single Release" className="w-full" />
          </div>
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
          <Button variant="primary" className="w-full">Save Template</Button>
        </PanelBody>
      </Panel>
    </>
  );
}

function TemplateUseMockup() {
  return (
    <>
      <Panel className="m-4">
        <PanelHeader><span className="text-base font-semibold text-text">New Release</span></PanelHeader>
        <PanelBody className="space-y-4">
          <div>
            <label className="label text-xs text-faint mb-1.5 block">TEMPLATE</label>
            <MockSelect text="Album Master" />
          </div>
          <div className="bg-signal-muted rounded-md px-4 py-3">
            <span className="text-xs text-signal font-medium">Pre-filled from template:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              <Pill>Stereo</Pill>
              <Pill>48 kHz</Pill>
              <Pill>24-bit</Pill>
              <Pill>WAV + FLAC</Pill>
            </div>
          </div>
          <div>
            <label className="label text-xs text-faint mb-1.5 block">TITLE</label>
            <MockInput text="My New Album" className="w-full" />
          </div>
          <Button variant="primary" className="w-full">Create Release</Button>
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
        <PanelBody>
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
        <PanelBody className="space-y-0">
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
        <PanelBody className="space-y-2">
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
          <div className="flex items-center gap-3 py-1.5 opacity-50">
            <X size={16} className="text-faint shrink-0" />
            <span className="text-sm text-muted">Audio files (download individually)</span>
          </div>
        </PanelBody>
      </Panel>
    </>
  );
}

function ExportProgressMockup() {
  return (
    <>
      <Panel className="m-4">
        <PanelBody className="space-y-4">
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
        <PanelBody className="space-y-4">
          <DataGrid>
            <DataCell label="Billing Cycle" value="Monthly" size="small" />
            <DataCell label="Next Payment" value="Mar 15" size="small" />
            <DataCell label="Price" value="$12" unit="/mo" size="small" />
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
        <PanelBody className="space-y-4">
          <div className="flex items-center gap-3">
            <Pill>Free</Pill>
            <ArrowRight size={16} className="text-faint" />
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-signal text-signal-on">
              <Sparkles size={12} /> Pro
            </span>
            <span className="text-sm text-muted">$12/month</span>
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
        <PanelBody className="space-y-4">
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
            <DataCell label="Amount" value="$12.00" size="small" />
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
        <PanelBody className="space-y-3">
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
        <PanelBody className="space-y-4">
          <div>
            <span className="label text-xs text-faint mb-2 block">PRESERVED</span>
            {["All releases and tracks", "Audio files and versions", "Notes and comments", "Collaborator lists"].map((item) => (
              <div key={item} className="flex items-center gap-3 py-1.5">
                <Check size={16} className="text-signal shrink-0" />
                <span className="text-sm text-text">{item}</span>
              </div>
            ))}
          </div>
          <Rule />
          <div>
            <span className="label text-xs text-faint mb-2 block">UNAVAILABLE ON FREE</span>
            {["Audio format conversion", "Advanced export options"].map((item) => (
              <div key={item} className="flex items-center gap-3 py-1.5">
                <X size={16} className="text-status-orange shrink-0" />
                <span className="text-sm text-muted">{item}</span>
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
