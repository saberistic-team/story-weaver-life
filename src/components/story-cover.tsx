import { cn } from "@/lib/utils";

const GENRE_ANGLE: Record<string, number> = {
  Fantasy: 285,
  "Science Fiction": 205,
  Horror: 20,
  Mystery: 265,
  Thriller: 12,
  Romance: 340,
  Literary: 76,
  Adventure: 150,
  Historical: 60,
};

function hash(text: string) {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) % 100000;
  return h;
}

export function StoryCover({
  title,
  genre,
  className,
  ratio = "portrait",
}: {
  title: string;
  genre: string;
  className?: string;
  ratio?: "portrait" | "wide";
}) {
  const angle = GENRE_ANGLE[genre] ?? 240;
  const seed = hash(title);
  const shift = (seed % 40) - 20;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border",
        ratio === "portrait" ? "aspect-2/3" : "aspect-16/9",
        className,
      )}
      style={{
        backgroundImage: `radial-gradient(120% 90% at ${30 + (seed % 40)}% 0%, oklch(0.5 0.16 ${angle}) 0%, oklch(0.2 0.05 ${angle + shift}) 55%, oklch(0.14 0.03 268) 100%)`,
      }}
      aria-hidden
    >
      <div className="absolute inset-0 opacity-40 mix-blend-overlay [background-image:repeating-linear-gradient(115deg,transparent_0_9px,oklch(1_0_0_/_6%)_9px_10px)]" />
      <div className="absolute inset-0 flex flex-col justify-end p-4">
        <span className="text-[0.6rem] font-semibold tracking-[0.22em] text-primary/90 uppercase">
          {genre}
        </span>
        <span className="font-display mt-1 line-clamp-3 text-lg leading-tight text-foreground">
          {title}
        </span>
      </div>
    </div>
  );
}
