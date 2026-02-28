export function PortalFooter() {
  return (
    <footer className="mt-16 pb-12 text-center space-y-2">
      <a
        href="https://mixarchitect.com"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 group"
      >
        <img
          src="/mix-architect-logo.svg"
          alt="Mix Architect"
          className="h-4 w-auto opacity-40 group-hover:opacity-60 transition-opacity"
        />
        <span className="text-xs text-faint group-hover:text-muted transition-colors">
          Powered by Mix Architect
        </span>
      </a>
      <div>
        <a
          href="https://mixarchitect.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-faint/60 hover:text-muted transition-colors"
        >
          Manage your releases &rarr;
        </a>
      </div>
    </footer>
  );
}
