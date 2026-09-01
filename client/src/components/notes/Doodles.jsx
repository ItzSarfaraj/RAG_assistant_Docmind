// Small hand-drawn-feeling doodles. Paths use slightly irregular points
// (not perfectly smooth curves) which is what reads as "sketched" rather
// than "vector icon" at a glance.

export function SparkleIcon({ className = "", color = "#1F5C4C" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke={color}
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3c.4 3.1 1.1 4.9 2.4 6.3 1.3 1.4 3.1 2 6.1 2.4-3 .4-4.8 1-6.1 2.4-1.3 1.4-2 3.2-2.4 6.3-.4-3.1-1.1-4.9-2.4-6.3-1.3-1.4-3.1-2-6.1-2.4 3-.4 4.8-1 6.1-2.4C10.9 7.9 11.6 6.1 12 3Z" />
    </svg>
  );
}

export function MagnifyingGlassIcon({ className = "", color = "#22201A" }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
    >
      <circle cx="17" cy="17" r="10.5" />
      <path d="M25 25.5 33 34" />
      <path d="M13 14c1.2-1.6 2.7-2.4 4.6-2.5" opacity="0.5" />
    </svg>
  );
}

export function StarDoodle({ className = "", color = "#22201A" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke={color}
      strokeWidth={1.4}
      strokeLinejoin="round"
    >
      <path d="M12 2.5 14 9l6.5.3-5.1 4 1.9 6.2L12 15.8l-5.3 3.7 1.9-6.2-5.1-4L10 9Z" />
    </svg>
  );
}

// A hand-drawn wavy underline, meant to sit right under a title.
// Stretches to fill its container width via viewBox + preserveAspectRatio.
export function WavyUnderline({ className = "", color = "#1F5C4C" }) {
  return (
    <svg
      viewBox="0 0 300 14"
      className={className}
      preserveAspectRatio="none"
      fill="none"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
    >
      <path d="M2 8c15-7 25 7 40 0s25-7 40 0 25 7 40 0 25-7 40 0 25 7 40 0 25-7 40 0 25 7 38 0" />
    </svg>
  );
}

// The double-chevron used in "⇒ Page 9 ⇐" style footers.
export function PageArrow({ direction = "right", className = "", color = "#8A8473" }) {
  const d = direction === "right" ? "M2 2l8 6-8 6M9 2l8 6-8 6" : "M18 2l-8 6 8 6M11 2l-8 6 8 6";
  return (
    <svg viewBox="0 0 20 16" className={className} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}