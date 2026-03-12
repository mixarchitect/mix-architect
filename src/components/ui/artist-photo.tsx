const SIZES = { sm: 40, md: 48, lg: 64 } as const;

type Props = {
  artistName: string;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function ArtistPhoto({ artistName, photoUrl, size = "sm", className = "" }: Props) {
  const px = SIZES[size];

  if (photoUrl) {
    return (
      <div
        className={`rounded-full overflow-hidden shrink-0 ${className}`}
        style={{ width: px, height: px }}
      >
        <img
          src={photoUrl}
          alt={artistName}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Initial circle fallback
  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-semibold shrink-0 ${className}`}
      style={{
        width: px,
        height: px,
        background: "var(--signal)",
        fontSize: px * 0.38,
      }}
    >
      {artistName[0]?.toUpperCase() ?? "?"}
    </div>
  );
}
