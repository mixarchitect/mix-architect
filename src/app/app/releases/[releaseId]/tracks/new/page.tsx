type NewTrackPageProps = {
  params: { releaseId: string };
};

export default function NewTrackPage({ params }: NewTrackPageProps) {
  return (
    <main className="space-y-3 card p-5">
      <p className="text-xs text-subtle uppercase tracking-[0.2em]">Tracks</p>
      <h1 className="text-2xl font-semibold">New track</h1>
      <p className="text-subtle text-sm">
        This will be the Mix Architect wizard for release {params.releaseId}.
        For now it is just a placeholder.
      </p>
    </main>
  );
}

