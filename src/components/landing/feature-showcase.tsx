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
        <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">
          {headline}
        </h3>
        <p className="mt-4 text-white/50 leading-relaxed max-w-lg">{body}</p>
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
          <div className="text-xs text-white/40 mb-1">EP &middot; Stereo</div>
          <div className="text-lg font-semibold text-white">
            Late Night Drive
          </div>
          <div className="text-sm text-white/50">Aria Voss</div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Calendar size={14} className="text-[#0D9488]" />
          <span className="text-white/50">Jun 15, 2026</span>
        </div>
      </div>
      <div className="space-y-2">
        {tracks.map((t) => (
          <div
            key={t.title}
            className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-white/4"
          >
            <div className="flex items-center gap-3">
              <Music size={14} className="text-white/30" />
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
          <div className="text-sm text-white/50">
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
                <Clock size={16} className="text-white/30" />
              )}
              <span className="text-sm text-white/80">{t.title}</span>
            </div>
            <span
              className={`text-xs font-medium ${
                t.approved ? "text-[#22C55E]" : "text-white/40"
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
        <span className="text-xs text-white/50">
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
                  : "bg-white/8 text-white/40"
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
            <div className="text-xs text-white/40">
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
            <div className="text-xs text-white/40">
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
          <div className="text-xs text-white/40 mb-1">Outstanding</div>
          <div className="text-lg font-bold text-[#FE5E0E]">$1,400</div>
        </div>
        <div className="rounded-lg bg-white/4 p-3 text-center">
          <div className="text-xs text-white/40 mb-1">Earned</div>
          <div className="text-lg font-bold text-[#22C55E]">$1,200</div>
        </div>
        <div className="rounded-lg bg-white/4 p-3 text-center">
          <div className="text-xs text-white/40 mb-1">Total</div>
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
              <div className="text-xs text-white/40">{r.client}</div>
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
                  <div className="text-xs text-white/40">{t.artist}</div>
                </div>
              </div>
              <button className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-white/8 text-white/50 hover:bg-white/12 transition-colors flex items-center gap-1">
                <Copy size={10} />
                Apply
              </button>
            </div>
            <div className="flex gap-2 ml-[42px]">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/6 text-white/40">
                {t.tracks} {t.tracks === 1 ? "track" : "tracks"}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/6 text-white/40">
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

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export function FeatureShowcase() {
  return (
    <section id="features" className="px-6">
      <div className="mx-auto max-w-6xl">
        <FeatureSection
          headline="Every release, organized from day one"
          body="Create a release, add your tracks, set your timeline. Mix Architect tracks everything from first rough mix to final delivery so nothing falls through the cracks."
          visual={<ReleasePlanningMock />}
        />

        <FeatureSection
          headline="Share work that looks as professional as it sounds"
          body="Give clients a web portal to review mixes, approve tracks, and download deliverables. Optionally gate downloads until payment is confirmed. Every shared link is a calling card for your business."
          badge="Client delivery, simplified"
          visual={<WebPortalMock />}
          reverse
        />

        <FeatureSection
          headline="Review mixes with precision, not paragraphs"
          body="Upload audio, see the waveform, drop timestamped comments exactly where you hear the issue. Switch between versions instantly. No more 'around the 2-minute mark' emails."
          visual={<AudioReviewMock />}
        />

        <FeatureSection
          headline="Know who owes what, at a glance"
          body="Track project fees, partial payments, and outstanding balances across every release. See your total revenue and what's still pending. Export for invoicing and tax time."
          badge="Built for freelance engineers and producers"
          badgeColor="orange"
          visual={<PaymentsMock />}
          reverse
        />

        <FeatureSection
          headline="Save your setup, skip the busywork"
          body="Create templates from your existing releases and apply them to new projects in one click. Pre-fill track counts, specs, and references for the artists you work with regularly."
          badge="Templates"
          badgeColor="blue"
          visual={<TemplatesMock />}
        />
      </div>
    </section>
  );
}
