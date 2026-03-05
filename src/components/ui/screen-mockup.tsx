"use client";

/* ═══════════════════════════════════════════════════════════
   SCREEN MOCKUP — Help article visual aids using real components
   44 mockups, one per article section
   ═══════════════════════════════════════════════════════════ */

import {
  Home, Search, LayoutTemplate, Settings, HelpCircle,
  Image, Music, Play, ChevronDown, Send, ArrowRight,
  RefreshCw, MessageSquare, Plus, Check, X,
  Disc3, Download, ArrowUpCircle, Bell, MapPin,
  Calendar, Upload, GripVertical, Copy, Link2,
  Shield, CreditCard, CheckCircle2, Clock, Eye,
  ClipboardList, FileText, Users, Sparkles,
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
import { SegmentedControl } from "@/components/ui/segmented-control";

/* ───────────────────────────────────────────────────────
   SHARED: Scale wrapper
   ─────────────────────────────────────────────────────── */

function MockupScale({ children }: { children: React.ReactNode }) {
  return (
    <div className="origin-top-left scale-75" style={{ width: "133.33%" }}>
      {children}
    </div>
  );
}

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

function MockAvatar({ initials, className }: { initials: string; className?: string }) {
  return (
    <span className={cn("w-6 h-6 rounded-full bg-signal text-signal-on text-[10px] font-bold flex items-center justify-center shrink-0", className)}>
      {initials}
    </span>
  );
}

function MockInput({ text, className }: { text: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center px-4 py-2.5 rounded-sm border border-border bg-panel text-sm text-faint flex-1 min-w-0 truncate", className)}>
      {text}
    </span>
  );
}

function MockSelect({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-sm border border-border bg-panel text-sm text-text whitespace-nowrap">
      {text}
      <ChevronDown size={14} className="text-faint" />
    </span>
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

function MockNoteEntry({ author, initials, time, content, isClient }: {
  author: string; initials: string; time: string; content: string; isClient?: boolean;
}) {
  return (
    <div className={cn("py-4", isClient && "pl-4 border-l-2 border-signal/40")}>
      <div className="flex items-center gap-2 text-xs text-muted mb-2">
        <MockAvatar initials={initials} className="w-5 h-5 text-[8px]" />
        <span className="font-medium text-text">{author}</span>
        {isClient && <span className="text-[10px] font-medium text-signal bg-signal-muted px-1.5 py-0.5 rounded-full">Client</span>}
        <span className="text-faint">{time}</span>
      </div>
      <p className="text-sm text-muted leading-relaxed">{content}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ARTICLE 1: WELCOME TO MIX ARCHITECT (3 mockups)
   ═══════════════════════════════════════════════════════════ */

function DashboardMockup() {
  return (
    <MockupScale>
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
    </MockupScale>
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
    <MockupScale>
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
    </MockupScale>
  );
}

function KeyConceptsMockup() {
  return (
    <MockupScale>
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
              { icon: ClipboardList, label: "Tasks", desc: "Assignments and checklists" },
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
    </MockupScale>
  );
}

/* ═══════════════════════════════════════════════════════════
   ARTICLE 2: CREATING YOUR FIRST RELEASE (4 mockups)
   ═══════════════════════════════════════════════════════════ */

function CreateReleaseMockup() {
  return (
    <MockupScale>
      <Panel className="m-4">
        <PanelHeader><span className="text-base font-semibold text-text">New Release</span></PanelHeader>
        <PanelBody className="space-y-4">
          <div>
            <label className="label text-xs text-faint mb-1.5 block">TITLE</label>
            <MockInput text="Midnight Sessions" className="w-full text-text" />
          </div>
          <div>
            <label className="label text-xs text-faint mb-1.5 block">ARTIST</label>
            <MockInput text="Alex Rivera" className="w-full text-text" />
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
    </MockupScale>
  );
}

function CoverArtUploadMockup() {
  return (
    <MockupScale>
      <div className="p-4">
        <div className="w-48 mx-auto aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 bg-panel2">
          <Image size={32} className="text-muted" />
          <span className="text-sm font-medium text-muted">Click to upload</span>
          <span className="text-xs text-faint">JPEG or PNG, min 1400x1400</span>
        </div>
      </div>
    </MockupScale>
  );
}

function TrackUploadMockup() {
  return (
    <MockupScale>
      <div className="p-4">
        <EmptyState
          icon={Upload}
          title="Drop audio files here"
          description="WAV, AIFF, FLAC, or MP3 up to 500 MB"
          action={{ label: "Browse Files", onClick: () => {} }}
        />
      </div>
    </MockupScale>
  );
}

function ReleaseStatusMockup() {
  return (
    <MockupScale>
      <div className="p-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          {[
            { color: "blue" as const, label: "Draft" },
            { color: "orange" as const, label: "In Progress", active: true },
            { color: "orange" as const, label: "Review" },
            { color: "green" as const, label: "Complete" },
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
    </MockupScale>
  );
}

/* ═══════════════════════════════════════════════════════════
   ARTICLE 3: INVITING COLLABORATORS (4 mockups)
   ═══════════════════════════════════════════════════════════ */

function InviteCollaboratorMockup() {
  return (
    <MockupScale>
      <Panel className="m-4">
        <PanelBody className="space-y-4">
          <div className="flex items-center gap-3">
            <MockInput text="engineer@studio.com" />
            <MockSelect text="Engineer" />
            <Button variant="primary"><Send size={14} /> Invite</Button>
          </div>
          <Rule />
          {[
            { name: "Sarah Kim", role: "Producer", initials: "SK" },
            { name: "Marcus Lee", role: "Engineer", initials: "ML" },
          ].map((m) => (
            <div key={m.name} className="flex items-center gap-3 py-2">
              <MockAvatar initials={m.initials} />
              <span className="text-sm font-medium text-text flex-1">{m.name}</span>
              <Pill>{m.role}</Pill>
            </div>
          ))}
        </PanelBody>
      </Panel>
    </MockupScale>
  );
}

function CollaboratorRolesMockup() {
  return (
    <MockupScale>
      <Panel className="m-4">
        <PanelBody className="space-y-3">
          {[
            { role: "Artist", desc: "The performing artist or band on this release" },
            { role: "Engineer", desc: "Mixing or mastering engineer working on audio" },
            { role: "Producer", desc: "Oversees the creative direction of the project" },
            { role: "Label", desc: "Label representative reviewing for distribution" },
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
    </MockupScale>
  );
}

function AcceptInvitationMockup() {
  return (
    <MockupScale>
      <Panel className="m-4">
        <PanelBody>
          <div className="flex items-center gap-3">
            <MockAvatar initials="SK" />
            <div className="flex-1">
              <span className="text-sm font-semibold text-text">Sarah Kim</span>
              <span className="text-sm text-muted"> joined as </span>
              <Pill>Engineer</Pill>
            </div>
            <StatusDot color="green" />
            <span className="text-xs text-faint">Just now</span>
          </div>
        </PanelBody>
      </Panel>
    </MockupScale>
  );
}

function PortalSharingMockup() {
  return (
    <MockupScale>
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
    </MockupScale>
  );
}

/* ═══════════════════════════════════════════════════════════
   ARTICLE 4: UPLOADING AUDIO TRACKS (3 mockups)
   ═══════════════════════════════════════════════════════════ */

function AudioUploadMockup() {
  return (
    <MockupScale>
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
    </MockupScale>
  );
}

function TrackVersionsMockup() {
  return (
    <MockupScale>
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
    </MockupScale>
  );
}

function WaveformPlayerMockup() {
  return (
    <MockupScale>
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
    </MockupScale>
  );
}

/* ═══════════════════════════════════════════════════════════
   ARTICLE 5: CONVERTING AUDIO FORMATS (3 mockups)
   ═══════════════════════════════════════════════════════════ */

function FormatConvertMockup() {
  return (
    <MockupScale>
      <Panel className="m-4">
        <PanelBody className="space-y-4">
          <div className="flex items-center gap-3">
            <Pill active>WAV 48kHz / 24-bit</Pill>
            <ArrowRight size={16} className="text-faint" />
            <MockSelect text="FLAC" />
          </div>
          <div className="flex gap-3">
            <div>
              <label className="label text-xs text-faint mb-1.5 block">SAMPLE RATE</label>
              <MockSelect text="44.1 kHz" />
            </div>
            <div>
              <label className="label text-xs text-faint mb-1.5 block">BIT DEPTH</label>
              <MockSelect text="16-bit" />
            </div>
          </div>
          <Button variant="primary"><RefreshCw size={14} /> Convert</Button>
        </PanelBody>
      </Panel>
    </MockupScale>
  );
}

function ExportDownloadMockup() {
  return (
    <MockupScale>
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
    </MockupScale>
  );
}

function SupportedFormatsMockup() {
  return (
    <MockupScale>
      <Panel className="m-4">
        <PanelBody className="space-y-4">
          <div>
            <span className="label text-xs text-faint">INPUT FORMATS</span>
            <div className="flex gap-2 mt-2">
              {["WAV", "AIFF", "FLAC", "MP3"].map((f) => <Pill key={f}>{f}</Pill>)}
            </div>
          </div>
          <Rule />
          <div>
            <span className="label text-xs text-faint">OUTPUT FORMATS</span>
            <div className="mt-2 space-y-2">
              {[
                { fmt: "WAV", spec: "16/24/32-bit, 44.1-192 kHz" },
                { fmt: "AIFF", spec: "16/24-bit" },
                { fmt: "FLAC", spec: "16/24-bit" },
                { fmt: "MP3", spec: "128-320 kbps" },
              ].map((f) => (
                <div key={f.fmt} className="flex items-center gap-3">
                  <Pill active>{f.fmt}</Pill>
                  <span className="text-sm text-muted">{f.spec}</span>
                </div>
              ))}
            </div>
          </div>
        </PanelBody>
      </Panel>
    </MockupScale>
  );
}

/* ═══════════════════════════════════════════════════════════
   ARTICLE 6: TIMESTAMPED COMMENTS (3 mockups)
   ═══════════════════════════════════════════════════════════ */

function CommentWaveformMockup() {
  return (
    <MockupScale>
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
            <MockInput text="Add a comment at 2:05..." className="flex-1" />
            <Button variant="primary"><Send size={14} /></Button>
          </div>
        </PanelBody>
      </Panel>
    </MockupScale>
  );
}

function PortalCommentsMockup() {
  return (
    <MockupScale>
      <Panel className="m-4">
        <PanelBody>
          <MockNoteEntry author="Sarah Kim" initials="SK" time="2h ago" content="The vocal balance sounds great in the chorus. Can we bring up the backing vocals slightly in verse 2?" />
          <Rule />
          <MockNoteEntry author="Jordan Blake" initials="JB" time="1h ago" content="Love the overall direction. The guitar tone in the bridge needs a bit more warmth." isClient />
        </PanelBody>
      </Panel>
    </MockupScale>
  );
}

function ResolveFeedbackMockup() {
  return (
    <MockupScale>
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
    </MockupScale>
  );
}

/* ═══════════════════════════════════════════════════════════
   ARTICLE 7: CREATING TASKS (3 mockups)
   ═══════════════════════════════════════════════════════════ */

function TaskCreateMockup() {
  const tasks = [
    { title: "Record final vocal take", assignee: "SK", status: "To Do", color: "blue" as const },
    { title: "Mix bass and drums", assignee: "ML", status: "In Progress", color: "orange" as const },
    { title: "Export stems", assignee: "AR", status: "Done", color: "green" as const, done: true },
  ];
  return (
    <MockupScale>
      <Panel className="m-4">
        <PanelHeader>
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-text">Tasks</span>
            <Button variant="primary"><Plus size={14} /> Add Task</Button>
          </div>
        </PanelHeader>
        <PanelBody className="space-y-2">
          {tasks.map((t) => (
            <div key={t.title} className="flex items-center gap-3 px-4 py-3 rounded-md border border-border bg-panel">
              <span className={cn("w-5 h-5 rounded-sm border-2 flex items-center justify-center shrink-0", t.done ? "bg-signal border-signal" : "border-border")}>
                {t.done && <Check size={12} className="text-signal-on" />}
              </span>
              <span className={cn("text-sm flex-1 truncate", t.done ? "text-faint line-through" : "text-text")}>{t.title}</span>
              <MockAvatar initials={t.assignee} />
              <Pill className={cn(
                t.color === "blue" && "bg-status-blue/10 text-status-blue border-status-blue/20",
                t.color === "orange" && "bg-status-orange/10 text-status-orange border-status-orange/20",
                t.color === "green" && "bg-status-green/10 text-status-green border-status-green/20",
              )}>{t.status}</Pill>
            </div>
          ))}
        </PanelBody>
      </Panel>
    </MockupScale>
  );
}

function TaskAssignMockup() {
  return (
    <MockupScale>
      <Panel className="m-4">
        <PanelBody className="space-y-3">
          <div className="flex items-center gap-3 px-4 py-3 rounded-md border border-border bg-panel">
            <span className="w-5 h-5 rounded-sm border-2 border-border shrink-0" />
            <span className="text-sm text-text flex-1">Mix bass and drums</span>
            <span className="text-xs text-signal font-medium">Assign</span>
          </div>
          <Panel variant="flat" className="border border-signal/30 shadow-lg p-2 space-y-1">
            {[
              { name: "Sarah Kim", initials: "SK", role: "Producer" },
              { name: "Marcus Lee", initials: "ML", role: "Engineer" },
              { name: "Alex Rivera", initials: "AR", role: "Artist" },
            ].map((c) => (
              <div key={c.name} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-panel2">
                <MockAvatar initials={c.initials} />
                <span className="text-sm text-text flex-1">{c.name}</span>
                <span className="text-xs text-faint">{c.role}</span>
              </div>
            ))}
          </Panel>
        </PanelBody>
      </Panel>
    </MockupScale>
  );
}

function TaskTemplatesMockup() {
  return (
    <MockupScale>
      <Panel className="m-4">
        <PanelBody className="space-y-3">
          <div className="flex items-center gap-2">
            <LayoutTemplate size={16} className="text-signal" />
            <span className="text-sm font-semibold text-text">Album Master</span>
            <Pill>Template</Pill>
          </div>
          <Rule />
          <span className="text-xs text-faint label">PRE-BUILT TASKS</span>
          {["Record vocals", "Mix and balance", "Master final", "Export stems", "Submit for distribution"].map((t) => (
            <div key={t} className="flex items-center gap-3 px-4 py-2.5 rounded-md border border-border bg-panel">
              <span className="w-5 h-5 rounded-sm border-2 border-border shrink-0" />
              <span className="text-sm text-text">{t}</span>
            </div>
          ))}
        </PanelBody>
      </Panel>
    </MockupScale>
  );
}

/* ═══════════════════════════════════════════════════════════
   ARTICLE 8: TASK STATUSES (3 mockups)
   ═══════════════════════════════════════════════════════════ */

function TaskKanbanMockup() {
  const cols = [
    { title: "To Do", color: "blue" as const, tasks: ["Update liner notes", "Finalize tracklist"] },
    { title: "In Progress", color: "orange" as const, tasks: ["Mix revisions"] },
    { title: "Done", color: "green" as const, tasks: ["Record vocals", "Export stems"] },
  ];
  return (
    <MockupScale>
      <div className="p-4 grid grid-cols-3 gap-3">
        {cols.map((col) => (
          <div key={col.title}>
            <div className="flex items-center gap-2 mb-3">
              <StatusDot color={col.color} />
              <span className="text-sm font-semibold text-text">{col.title}</span>
              <span className="text-xs text-faint">{col.tasks.length}</span>
            </div>
            <div className="space-y-2">
              {col.tasks.map((task) => (
                <Panel key={task} variant="flat" className="px-4 py-3 border border-border">
                  <span className="text-sm text-text">{task}</span>
                </Panel>
              ))}
            </div>
          </div>
        ))}
      </div>
    </MockupScale>
  );
}

function TaskProgressMockup() {
  return (
    <MockupScale>
      <Panel className="m-4">
        <PanelBody className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-text">Task Progress</span>
              <span className="text-sm font-semibold text-signal">67%</span>
            </div>
            <div className="h-2 bg-panel2 rounded-full overflow-hidden">
              <div className="h-full w-[67%] bg-signal rounded-full" />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2"><StatusDot color="blue" /><span className="text-sm text-muted">3 To Do</span></div>
            <div className="flex items-center gap-2"><StatusDot color="orange" /><span className="text-sm text-muted">2 In Progress</span></div>
            <div className="flex items-center gap-2"><StatusDot color="green" /><span className="text-sm text-muted">5 Done</span></div>
          </div>
        </PanelBody>
      </Panel>
    </MockupScale>
  );
}

function TaskFiltersMockup() {
  return (
    <MockupScale>
      <Panel className="m-4">
        <PanelBody className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <SegmentedControl
              options={[{ value: "all", label: "All" }, { value: "todo", label: "To Do" }, { value: "progress", label: "In Progress" }, { value: "done", label: "Done" }]}
              value="progress"
              onChange={() => {}}
            />
            <MockSelect text="All Members" />
          </div>
          <Rule />
          <div className="space-y-2">
            {["Mix bass and drums", "Balance synth levels"].map((t) => (
              <div key={t} className="flex items-center gap-3 px-4 py-3 rounded-md border border-border bg-panel">
                <span className="w-5 h-5 rounded-sm border-2 border-border shrink-0" />
                <span className="text-sm text-text flex-1">{t}</span>
                <Pill className="bg-status-orange/10 text-status-orange border-status-orange/20">In Progress</Pill>
              </div>
            ))}
          </div>
        </PanelBody>
      </Panel>
    </MockupScale>
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
    <MockupScale>
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
    </MockupScale>
  );
}

function TimelineNavigateMockup() {
  return (
    <MockupScale>
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
    </MockupScale>
  );
}

function TimelineDatesMockup() {
  return (
    <MockupScale>
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
    </MockupScale>
  );
}

/* ═══════════════════════════════════════════════════════════
   ARTICLE 10: MILESTONES (3 mockups)
   ═══════════════════════════════════════════════════════════ */

function MilestoneExamplesMockup() {
  const milestones = [
    { label: "Mix Due", pos: "20%" },
    { label: "Master Due", pos: "55%" },
    { label: "Release Date", pos: "85%" },
  ];
  return (
    <MockupScale>
      <Panel className="m-4">
        <PanelBody className="pt-2">
          <div className="flex mb-2">
            {["Jan", "Feb", "Mar", "Apr"].map((m) => (
              <span key={m} className="flex-1 text-xs text-faint text-center">{m}</span>
            ))}
          </div>
          <div className="relative h-4 bg-status-blue/20 rounded-full mx-4">
            <div className="absolute inset-y-0 left-0 w-[45%] bg-status-blue rounded-full" />
            {milestones.map((ms) => (
              <div key={ms.label} className="absolute top-1/2 -translate-y-1/2" style={{ left: ms.pos }}>
                <div className="w-4 h-4 rotate-45 rounded-sm bg-signal border-2 border-panel -translate-x-1/2" />
              </div>
            ))}
          </div>
          <div className="relative h-6 mx-4 mt-2">
            {milestones.map((ms) => (
              <span key={ms.label} className="absolute text-xs text-muted -translate-x-1/2 whitespace-nowrap" style={{ left: ms.pos }}>
                {ms.label}
              </span>
            ))}
          </div>
        </PanelBody>
      </Panel>
    </MockupScale>
  );
}

function MilestoneAddMockup() {
  return (
    <MockupScale>
      <Panel className="m-4">
        <PanelHeader><span className="text-base font-semibold text-text">Add Milestone</span></PanelHeader>
        <PanelBody className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="label text-xs text-faint mb-1.5 block">NAME</label>
              <MockInput text="Master Due" className="w-full" />
            </div>
            <div className="flex-1">
              <label className="label text-xs text-faint mb-1.5 block">DATE</label>
              <MockSelect text="Mar 10, 2026" />
            </div>
          </div>
          <Button variant="primary">Save Milestone</Button>
          <Rule />
          <span className="label text-xs text-faint">EXISTING MILESTONES</span>
          {[
            { name: "Mix Due", date: "Feb 15" },
            { name: "Artwork Due", date: "Feb 28" },
          ].map((m) => (
            <div key={m.name} className="flex items-center gap-3 py-2">
              <MapPin size={14} className="text-signal" />
              <span className="text-sm text-text flex-1">{m.name}</span>
              <span className="text-sm text-muted">{m.date}</span>
            </div>
          ))}
        </PanelBody>
      </Panel>
    </MockupScale>
  );
}

function MilestoneNotificationMockup() {
  return (
    <MockupScale>
      <Panel className="m-4">
        <PanelBody>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-status-orange/10 flex items-center justify-center shrink-0">
              <Bell size={16} className="text-status-orange" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-semibold text-text">Master Due in 3 days</span>
              <p className="text-sm text-muted mt-0.5">Late Night EP - March 10, 2026</p>
            </div>
            <span className="text-xs text-faint shrink-0">Just now</span>
          </div>
        </PanelBody>
      </Panel>
    </MockupScale>
  );
}

/* ═══════════════════════════════════════════════════════════
   ARTICLE 11: TEMPLATES (3 mockups)
   ═══════════════════════════════════════════════════════════ */

function TemplateContentsMockup() {
  return (
    <MockupScale>
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
            <span className="label text-xs text-faint">PRE-BUILT TASKS</span>
            <div className="mt-2 space-y-1 text-sm text-muted">
              {["Record vocals", "Mix and balance", "Master final"].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <ClipboardList size={14} className="text-faint" />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </PanelBody>
      </Panel>
    </MockupScale>
  );
}

function TemplateCreateMockup() {
  return (
    <MockupScale>
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
    </MockupScale>
  );
}

function TemplateUseMockup() {
  return (
    <MockupScale>
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
              <Pill>5 tasks</Pill>
            </div>
          </div>
          <div>
            <label className="label text-xs text-faint mb-1.5 block">TITLE</label>
            <MockInput text="My New Album" className="w-full" />
          </div>
          <Button variant="primary" className="w-full">Create Release</Button>
        </PanelBody>
      </Panel>
    </MockupScale>
  );
}

/* ═══════════════════════════════════════════════════════════
   ARTICLE 12: EXPORT DATA (3 mockups)
   ═══════════════════════════════════════════════════════════ */

function ExportContentsMockup() {
  return (
    <MockupScale>
      <Panel className="m-4">
        <PanelBody className="space-y-2">
          <span className="text-sm font-semibold text-text">Export includes:</span>
          {[
            "Profile information",
            "All releases and metadata",
            "Track details (names, versions, notes)",
            "Tasks and assignments",
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
    </MockupScale>
  );
}

function ExportProgressMockup() {
  return (
    <MockupScale>
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
    </MockupScale>
  );
}

function ExportPrivacyMockup() {
  return (
    <MockupScale>
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
    </MockupScale>
  );
}

/* ═══════════════════════════════════════════════════════════
   ARTICLE 13: MANAGE SUBSCRIPTION (3 mockups)
   ═══════════════════════════════════════════════════════════ */

function PlanCurrentMockup() {
  return (
    <MockupScale>
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
    </MockupScale>
  );
}

function UpgradeProMockup() {
  return (
    <MockupScale>
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
    </MockupScale>
  );
}

function ManagePaymentMockup() {
  return (
    <MockupScale>
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
    </MockupScale>
  );
}

/* ═══════════════════════════════════════════════════════════
   ARTICLE 14: CANCEL / RESUBSCRIBE (3 mockups)
   ═══════════════════════════════════════════════════════════ */

function CancelSubscriptionMockup() {
  return (
    <MockupScale>
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
    </MockupScale>
  );
}

function DataAfterCancelMockup() {
  return (
    <MockupScale>
      <Panel className="m-4">
        <PanelBody className="space-y-4">
          <div>
            <span className="label text-xs text-faint mb-2 block">PRESERVED</span>
            {["All releases and tracks", "Audio files and versions", "Tasks and comments", "Collaborator lists"].map((item) => (
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
    </MockupScale>
  );
}

function ResubscribeMockup() {
  return (
    <MockupScale>
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
    </MockupScale>
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
  /* Article 4: Audio Tracks */
  "audio-upload": AudioUploadMockup,
  "track-versions": TrackVersionsMockup,
  "waveform-player": WaveformPlayerMockup,
  /* Article 5: Audio Converter */
  "format-convert": FormatConvertMockup,
  "export-download": ExportDownloadMockup,
  "supported-formats": SupportedFormatsMockup,
  /* Article 6: Timestamped Comments */
  "comment-waveform": CommentWaveformMockup,
  "portal-comments": PortalCommentsMockup,
  "resolve-feedback": ResolveFeedbackMockup,
  /* Article 7: Tasks */
  "task-create": TaskCreateMockup,
  "task-assign": TaskAssignMockup,
  "task-templates": TaskTemplatesMockup,
  /* Article 8: Task Statuses */
  "task-kanban": TaskKanbanMockup,
  "task-progress": TaskProgressMockup,
  "task-filters": TaskFiltersMockup,
  /* Article 9: Timeline */
  "timeline-full": TimelineFullMockup,
  "timeline-navigate": TimelineNavigateMockup,
  "timeline-dates": TimelineDatesMockup,
  /* Article 10: Milestones */
  "milestone-examples": MilestoneExamplesMockup,
  "milestone-add": MilestoneAddMockup,
  "milestone-notification": MilestoneNotificationMockup,
  /* Article 11: Templates */
  "template-contents": TemplateContentsMockup,
  "template-create": TemplateCreateMockup,
  "template-use": TemplateUseMockup,
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
