export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-3xl text-center space-y-5 card p-8">
        <p className="text-xs text-subtle uppercase tracking-[0.24em]">
          Mix Architect
        </p>
        <h1 className="text-4xl md:text-[42px] font-semibold leading-tight">
          Blueprint every mix before you touch a fader.
        </h1>
        <p className="text-base md:text-lg text-subtle max-w-2xl mx-auto">
          Plan stereo and immersive releases with clear intent. Organize assets,
          define outcomes, and brief mixers with confidence.
        </p>
        <div className="flex justify-center">
          <a href="/app" className="btn-primary">
            Enter the control room
          </a>
        </div>
      </div>
    </main>
  );
}
