import { cn } from "@/lib/utils";

/**
 * Three angular recycling arrows forming a triangle, with an upward leaf.
 * Keep the favicon and installation icons derived from this same mark.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label="ReLoop logo"
      className={cn("size-5", className)}
      fill="none"
    >
      {[0, 120, 240].map((angle) => (
        <g key={angle} transform={`rotate(${angle} 32 34)`}>
          <path d="M38 10 L51 32 L56 29 L55 43 L43 37 L47 35 L34 13 Z" fill="currentColor" />
        </g>
      ))}
      <g transform="translate(32 34) rotate(45) scale(0.7) translate(-32 -34)" fill="currentColor">
        <path d="M32 24 C24 28 24 36 30.8 40 L30.8 32 L32 29 L33.2 32 L33.2 40 C40 36 40 28 32 24 Z" />
        <path d="M30.8 38 H33.2 V43 H30.8 Z" />
      </g>
    </svg>
  );
}
