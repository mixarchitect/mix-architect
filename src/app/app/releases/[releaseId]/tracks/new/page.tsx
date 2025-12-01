type NewTrackPageProps = {
  params: { releaseId: string };
};

export default function NewTrackPage({ params }: NewTrackPageProps) {
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">New track</h1>
      <p className="text-neutral-400 text-sm">
        This will be the Mix Architect wizard for release {params.releaseId}.
        For now it is just a placeholder.
      </p>
    </main>
  );
}

