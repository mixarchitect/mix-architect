export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-semibold">Mix Architect</h1>
        <p className="text-lg text-neutral-400">
          Design your mix before you touch a fader. Plan stereo and immersive
          mixes with clear blueprints your mixer will love.
        </p>
        <a
          href="/app"
          className="inline-flex items-center justify-center rounded-md border border-neutral-700 px-6 py-2 text-base font-medium hover:bg-neutral-900"
        >
          Enter app
        </a>
      </div>
    </main>
  );
}
