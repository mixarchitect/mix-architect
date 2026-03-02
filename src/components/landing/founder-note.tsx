export function FounderNote() {
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#0D9488]/12 border border-[#0D9488]/20 mb-6">
          <span className="text-2xl">🎛️</span>
        </div>
        <blockquote className="text-lg md:text-xl text-white/70 leading-relaxed italic">
          &quot;Built by an audio engineer who got tired of managing releases in
          spreadsheets and email threads. Mix Architect is the tool I wished I
          had on every project.&quot;
        </blockquote>
        <div className="mt-6 text-sm text-white/40">
          — The Mix Architect team
        </div>
      </div>
    </section>
  );
}
