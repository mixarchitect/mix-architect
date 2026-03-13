import Image from "next/image";
import { cn } from "@/lib/cn";
import { getCoverArtUrl } from "@/types/featured-release";

const sizes = {
  sm: { width: 80, height: 80, className: "w-20 h-20" },
  md: { width: 160, height: 160, className: "w-40 h-40" },
  lg: { width: 300, height: 300, className: "w-[300px] h-[300px]" },
  full: { width: 500, height: 500, className: "w-full max-w-[500px] aspect-square" },
};

interface CoverArtProps {
  path: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "full";
  className?: string;
}

export function CoverArt({ path, alt, size = "md", className }: CoverArtProps) {
  const s = sizes[size];
  const src = getCoverArtUrl(path);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg ring-1 ring-white/10 shrink-0",
        s.className,
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={s.width}
        height={s.height}
        className="object-cover w-full h-full"
        sizes={
          size === "full"
            ? "(max-width: 640px) 100vw, 500px"
            : size === "lg"
              ? "300px"
              : size === "md"
                ? "160px"
                : "80px"
        }
      />
    </div>
  );
}
