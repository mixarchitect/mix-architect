import {
  Activity,
  RefreshCw,
  AudioWaveform,
  MessageSquare,
  FileText,
  GitBranch,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

/* ------------------------------------------------------------------ */
/*  Mini visual elements for each tool card                            */
/* ------------------------------------------------------------------ */

function LufsMeter() {
  return (
    <div className="mt-4 rounded-lg bg-white/4 p-3">
      <div className="flex items-center justify-between text-[10px] text-white/60 mb-2">
        <span>-24</span>
        <span>-14</span>
        <span>-6</span>
      </div>
      <div className="relative h-3 rounded-full bg-white/8 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: "62%",
            background: "linear-gradient(90deg, #0D9488 0%, #22C55E 80%, #FE5E0E 100%)",
          }}
        />
        {/* Target line */}
        <div
          className="absolute inset-y-0 w-px bg-white/60"
          style={{ left: "62%" }}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] text-[#0D9488] font-semibold">-14.2 LUFS</span>
        <span className="text-[10px] text-white/60">Spotify target</span>
      </div>
    </div>
  );
}

function FormatConversion() {
  return (
    <div className="mt-4 flex items-center gap-2">
      {["WAV", "AIFF", "FLAC", "MP3"].map((fmt, i) => (
        <div key={fmt} className="flex items-center gap-2">
          <span
            className={`text-[10px] font-semibold px-2 py-1 rounded ${
              i === 0
                ? "bg-[#0D9488]/15 text-[#2dd4bf]"
                : "bg-white/6 text-white/60"
            }`}
          >
            {fmt}
          </span>
          {i < 3 && (
            <span className="text-white/60 text-[10px]">&rarr;</span>
          )}
        </div>
      ))}
    </div>
  );
}

function MiniWaveform() {
  return (
    <div className="mt-4 flex items-center gap-[2px] h-8 px-2 rounded-lg bg-white/4">
      {Array.from({ length: 32 }).map((_, i) => {
        const h = Math.sin(i * 0.4) * 0.35 + 0.45 + (i % 3) * 0.08;
        const isPast = i < 18;
        return (
          <div
            key={i}
            className="flex-1 rounded-full"
            style={{
              height: `${h * 100}%`,
              background: isPast
                ? "rgba(13,148,136,0.5)"
                : "rgba(255,255,255,0.12)",
            }}
          />
        );
      })}
    </div>
  );
}

function CommentTimeline() {
  return (
    <div className="mt-4 relative h-6 rounded-lg bg-white/4 overflow-hidden">
      <div className="absolute inset-y-0 left-0 w-[45%] bg-white/4 rounded-lg" />
      {[
        { pos: "22%", color: "#FE5E0E" },
        { pos: "45%", color: "#3B82F6" },
        { pos: "72%", color: "#0D9488" },
      ].map((m) => (
        <div
          key={m.pos}
          className="absolute top-1 w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold text-white"
          style={{ left: m.pos, background: m.color }}
        >
          &bull;
        </div>
      ))}
    </div>
  );
}

function BriefPreview() {
  return (
    <div className="mt-4 rounded-lg bg-white/4 p-3 space-y-2">
      <div className="h-2 w-20 rounded-full bg-white/12" />
      <div className="h-1.5 w-full rounded-full bg-white/6" />
      <div className="h-1.5 w-3/4 rounded-full bg-white/6" />
      <div className="flex gap-1.5 mt-1">
        {["Warm", "Punchy"].map((t) => (
          <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#0D9488]/12 text-[#0D9488]">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function VersionTabs() {
  return (
    <div className="mt-4 flex items-center gap-1.5">
      {["v1", "v2", "v3"].map((v, i) => (
        <span
          key={v}
          className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${
            i === 2
              ? "bg-[#0D9488] text-[#1a1a1a] font-semibold"
              : "bg-white/8 text-white/60"
          }`}
        >
          {v}
        </span>
      ))}
      <span className="ml-auto text-[10px] text-white/60">Latest</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tool definitions                                                    */
/* ------------------------------------------------------------------ */

export async function AudioToolsGrid() {
  const t = await getTranslations("landing");

  const tools: {
    icon: React.ReactNode;
    title: string;
    description: string;
    visual: React.ReactNode;
  }[] = [
    {
      icon: <Activity size={22} />,
      title: t("toolLufs"),
      description: t("toolLufsDesc"),
      visual: <LufsMeter />,
    },
    {
      icon: <RefreshCw size={22} />,
      title: t("toolFormatConversion"),
      description: t("toolFormatConversionDesc"),
      visual: <FormatConversion />,
    },
    {
      icon: <AudioWaveform size={22} />,
      title: t("toolWaveform"),
      description: t("toolWaveformDesc"),
      visual: <MiniWaveform />,
    },
    {
      icon: <MessageSquare size={22} />,
      title: t("toolComments"),
      description: t("toolCommentsDesc"),
      visual: <CommentTimeline />,
    },
    {
      icon: <FileText size={22} />,
      title: t("toolMixBrief"),
      description: t("toolMixBriefDesc"),
      visual: <BriefPreview />,
    },
    {
      icon: <GitBranch size={22} />,
      title: t("toolVersionControl"),
      description: t("toolVersionControlDesc"),
      visual: <VersionTabs />,
    },
  ];

  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <div className="text-xs font-semibold uppercase tracking-widest text-[#0D9488] mb-3">
            {t("audioToolsLabel")}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            {t("audioToolsHeadline")}
          </h2>
          <p className="mt-4 text-white/60 max-w-xl mx-auto">
            {t("audioToolsDesc")}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <div
              key={tool.title}
              className="rounded-xl bg-[#1a1a1a] border border-white/8 p-6 hover:border-white/15 transition-colors"
            >
              <div className="w-11 h-11 rounded-lg bg-[#0D9488]/12 flex items-center justify-center text-[#0D9488] mb-4" aria-hidden="true">
                {tool.icon}
              </div>
              <h3 className="text-base font-semibold text-white mb-2">
                {tool.title}
              </h3>
              <p className="text-sm text-white/60 leading-relaxed">
                {tool.description}
              </p>
              <div aria-hidden="true">{tool.visual}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
