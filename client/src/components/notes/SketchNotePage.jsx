import { SparkleIcon, MagnifyingGlassIcon, WavyUnderline, PageArrow } from "./Doodles";

// The ink/paper palette pulled from the reference image: a slightly gray
// paper, near-black body ink, and a teal accent for headings/underlines.
const PAPER_BG = "#EFEFEA";
const INK = "#22201A";
const ACCENT = "#1F5C4C";

/**
 * Wraps note CONTENT (passed as children) with the notebook-page chrome:
 * dot-grid background, rotated tag badge, progress circle, title with a
 * wavy underline, and a page-number footer.
 *
 * This component only owns the chrome — headings, code blocks, and
 * callouts inside `children` should use the section helpers alongside it
 * (SketchCallout, or plain Tailwind classes styled to match — see the
 * usage example in SETUP_NOTES.md).
 */
function SketchNotePage({
  tag = "Notes",
  title,
  pageNumber,
  totalPages,
  maxWidthClass = "max-w-2xl",
  children,
}) {
  return (
    <div
      className={`relative mx-auto w-full ${maxWidthClass} overflow-hidden rounded-2xl border border-[#DFDDD3] p-8 font-['Kalam'] shadow-sm sm:p-10`}
      style={{
        backgroundColor: PAPER_BG,
        backgroundImage: `radial-gradient(#00000018 1px, transparent 1px)`,
        backgroundSize: "20px 20px",
        color: INK,
      }}
    >
      {/* Decorative doodles, absolutely positioned, non-interactive */}
      <MagnifyingGlassIcon
        className="pointer-events-none absolute right-8 top-16 h-8 w-8 opacity-70 sm:right-12"
        color={INK}
      />
      <SparkleIcon
        className="pointer-events-none absolute left-[7.5rem] top-6 h-3.5 w-3.5"
        color={ACCENT}
      />

      {/* Header row: tag badge + progress circle */}
      <div className="mb-6 flex items-start justify-between">
        <div
          className="inline-flex -rotate-3 items-center gap-1.5 rounded-md border-[1.6px] border-dashed px-3 py-1.5 text-[12px] font-bold"
          style={{ borderColor: ACCENT, color: ACCENT }}
        >
          {tag}
        </div>

        {pageNumber != null && totalPages != null && (
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
            style={{ backgroundColor: INK }}
          >
            {pageNumber}/{totalPages}
          </div>
        )}
      </div>

      {/* Title + wavy underline */}
      {title && (
        <div className="mb-2 text-center">
          <h1 className="text-2xl font-bold leading-snug sm:text-[26px]">
            {title}
          </h1>
          <WavyUnderline className="mx-auto mt-1 h-3 w-40" color={ACCENT} />
        </div>
      )}

      {pageNumber != null && totalPages != null && (
        <p className="mb-8 text-center text-[12px] text-[#8A8473]">
          • Page {pageNumber} / {totalPages} •
        </p>
      )}

      {/* Actual note content */}
      <div className="space-y-6">{children}</div>

      {/* Footer page number */}
      {pageNumber != null && (
        <div className="mt-10 flex items-center justify-center gap-2 text-[13px] text-[#8A8473]">
          <PageArrow direction="right" className="h-3.5 w-3.5" />
          <span>Page {pageNumber}</span>
          <PageArrow direction="left" className="h-3.5 w-3.5" />
        </div>
      )}
    </div>
  );
}

// A ready-made section heading matching the reference's underlined,
// teal-ink style ("Problem:", "Approach:", "Python Code:").
export function SketchHeading({ children }) {
  return (
    <h2
      className="inline-block border-b-2 pb-0.5 text-[16px] font-bold"
      style={{ borderColor: ACCENT, color: ACCENT }}
    >
      {children}
    </h2>
  );
}

// A monospace-ish code block styled to sit naturally inside a hand-drawn
// page (kept plain/typewriter rather than a dark IDE-style block, since a
// dark code panel would clash with the paper aesthetic).
export function SketchCodeBlock({ children }) {
  return (
    <pre
      className="overflow-x-auto rounded-lg border border-[#DFDDD3] bg-white/60 p-4 font-mono text-[12.5px] leading-6"
      style={{ color: INK }}
    >
      <code>{children}</code>
    </pre>
  );
}

export default SketchNotePage;