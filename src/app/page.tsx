export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-3xl text-center space-y-6 card p-10">
        <p className="text-sm text-subtle uppercase tracking-[0.2em]">
          Mix Architect
        </p>
        <h1 className="text-4xl md:text-5xl font-semibold">
          Blueprint every mix before you touch a fader.
        </h1>
        <p className="text-lg text-subtle">
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
