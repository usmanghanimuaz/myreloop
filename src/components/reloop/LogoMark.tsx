import { cn } from "@/lib/utils";

/**
 * Three circular reuse arrows with a small leaf tilted 45 degrees.
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
        <g key={angle} transform={`rotate(${angle} 32 32)`}>
          <path
            d="M18 14 A23 23 0 0 1 51 19"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path d="M55 11 L55 26 L41 22 Z" fill="currentColor" />
        </g>
      ))}
      <g transform="rotate(45 32 32)" fill="currentColor">
        <path d="M32 21 C22 26 22 36 30.5 41 L30.5 31 L32 28 L33.5 31 L33.5 41 C42 36 42 26 32 21 Z" />
        <path d="M30.5 39 H33.5 V45 H30.5 Z" />
      </g>
    </svg>
  );
}
