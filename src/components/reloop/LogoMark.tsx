import { cn } from "@/lib/utils";

/**
 * ReLoop brand mark: two circular reuse arrows chasing each other around a
 * small leaf. Original SVG, drawn to stay readable at favicon size (16px):
 * thick strokes, no fine detail.
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
      {/* upper arrow: left → right over the top */}
      <path
        d="M14 26 A20 20 0 0 1 50 22"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path d="M50 12 L52 24 L40 22 Z" fill="currentColor" />
      {/* lower arrow: right → left under the bottom */}
      <path
        d="M50 38 A20 20 0 0 1 14 42"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path d="M14 52 L12 40 L24 42 Z" fill="currentColor" />
      {/* leaf at the centre */}
      <path d="M32 22 C24 28 23 37 32 43 C41 37 40 28 32 22 Z" fill="currentColor" opacity="0.92" />
      <path
        d="M32 25 L32 40"
        stroke="var(--color-sidebar-primary, #2f5d3a)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
