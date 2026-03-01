/**
 * Filled icon variants for use on accent-colored (bg-signal) backgrounds.
 * Solid fills maximize legibility at small sizes against the gold surface.
 * Standard stroked lucide icons should be used everywhere else.
 */

type IconProps = {
  size?: number;
  className?: string;
};

export function FilledPlay({ size = 18, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
      className={className}
    >
      <polygon points="6,3 20,12 6,21" />
    </svg>
  );
}

export function FilledPause({ size = 18, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
      className={className}
    >
      <rect x="5" y="3" width="4" height="18" rx="1" />
      <rect x="15" y="3" width="4" height="18" rx="1" />
    </svg>
  );
}

export function FilledUpload({ size = 16, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
      className={className}
    >
      <path d="M12 2L6 8h4v8h4V8h4L12 2z" />
      <rect x="4" y="18" width="16" height="2" rx="1" />
    </svg>
  );
}

export function FilledArrowRight({ size = 18, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
      className={className}
    >
      <path d="M4 11h12.17l-4.88-4.88a1 1 0 011.42-1.42l6.59 6.59a1 1 0 010 1.42l-6.59 6.59a1 1 0 01-1.42-1.42L16.17 13H4a1 1 0 010-2z" />
    </svg>
  );
}
