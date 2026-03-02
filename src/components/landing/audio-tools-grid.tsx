import {
  Activity,
  RefreshCw,
  AudioWaveform,
  MessageSquare,
  FileText,
  GitBranch,
} from "lucide-react";

const tools = [
  {
    icon: <Activity size={22} />,
    title: "LUFS Measurement",
    description:
      "Check loudness against Spotify, Apple Music, YouTube, and 8 other platform targets.",
  },
  {
    icon: <RefreshCw size={22} />,
    title: "Audio Format Conversion",
    description:
      "Convert between WAV, AIFF, FLAC, and MP3 — right inside the app. No external tools needed.",
  },
  {
    icon: <AudioWaveform size={22} />,
    title: "Waveform Visualization",
    description:
      "See your audio, not just hear it. WaveSurfer-powered waveforms with zoom and seeking.",
  },
  {
    icon: <MessageSquare size={22} />,
    title: "Timestamped Comments",
    description:
      "Drop feedback at the exact moment in the track. Color-coded markers on the timeline.",
  },
  {
    icon: <FileText size={22} />,
    title: "Mix Brief Export",
    description:
      "Generate a shareable brief document from your intent, specs, and references.",
  },
  {
    icon: <GitBranch size={22} />,
    title: "Version Control",
    description:
      "Upload new versions, compare side by side, keep every revision accessible.",
  },
];

export function AudioToolsGrid() {
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <div className="text-xs font-semibold uppercase tracking-widest text-[#0D9488] mb-3">
            Audio Tools
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Professional tools, built in
          </h2>
          <p className="mt-4 text-white/50 max-w-xl mx-auto">
            Everything you need to manage audio — without switching apps.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <div
              key={tool.title}
              className="rounded-xl bg-[#1a1a1a] border border-white/8 p-6 hover:border-white/15 transition-colors"
            >
              <div className="w-11 h-11 rounded-lg bg-[#0D9488]/12 flex items-center justify-center text-[#0D9488] mb-4">
                {tool.icon}
              </div>
              <h3 className="text-base font-semibold text-white mb-2">
                {tool.title}
              </h3>
              <p className="text-sm text-white/50 leading-relaxed">
                {tool.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
