type NewTrackPageProps = {
  params: { releaseId: string };
};

export default function NewTrackPage({ params }: NewTrackPageProps) {
  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-md border border-border bg-panel px-6 py-5 shadow-paper">
        <div className="label text-faint">TRACKS</div>
        <h1 className="mt-2 text-2xl font-semibold h1">New track</h1>
        <p className="mt-2 text-sm text-muted">
          Wizard placeholder for release {params.releaseId}. Add track fields here.
        </p>
      </section>
    </div>
  );
}

