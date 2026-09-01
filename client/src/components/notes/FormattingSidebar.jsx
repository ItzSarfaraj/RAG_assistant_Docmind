import { X, Settings2, Download } from "lucide-react";

function FormattingSidebar({
  open,
  toggleOpen,
  font,
  setFont,
  fontSize,
  setFontSize,
  lineSpacing,
  setLineSpacing,
  noteWidth,
  setNoteWidth,
  paperStyle,
  setPaperStyle,
  noteStyle, // NEW: "classic" | "sketch"
  setNoteStyle, // NEW
  handleSavePDF,
}) {
  const fonts = [
    ["default", "Default"],
    ["serif", "Serif"],
    ["mono", "Mono"],
    ["handwritten", "Handwritten"],
  ];

  const sizes = [
    ["small", "Small"],
    ["medium", "Medium"],
    ["large", "Large"],
  ];

  const spacing = [
    ["compact", "Compact"],
    ["normal", "Normal"],
    ["relaxed", "Relaxed"],
  ];

  const widths = [
    ["normal", "Normal"],
    ["wide", "Wide"],
    ["extraWide", "Extra Wide"],
  ];

  const papers = [
    ["white", "White"],
    ["cream", "Warm Cream"],
    ["gray", "Soft Gray"],
    ["blue", "Cool Blue"],
    ["green", "Soft Green"],
    ["lavender", "Lavender"],
  ];

  // NEW: the two page templates
  const noteStyles = [
    ["classic", "Classic"],
    ["sketch", "Sketch Notebook"],
  ];

  const buttonClass = (active) =>
    `rounded-lg border px-2.5 py-2 text-[9px] transition ${
      active
        ? "border-[#BD7B24] bg-[#F3EFE4] font-semibold text-[#BD7B24]"
        : "border-[#E6E1D3] text-[#75705F] hover:bg-[#F7F4EC]"
    }`;

  return (
    <aside
      className={`print-hide relative z-30 flex h-screen shrink-0 border-l border-[#E6E1D3] bg-white transition-all duration-200 ${
        open ? "w-60" : "w-12"
      }`}
    >
      {!open ? (
        <button
          type="button"
          onClick={toggleOpen}
          className="flex h-full w-full items-start justify-center pt-5 text-[#75705F] hover:bg-[#F7F4EC]"
          title="Formatting"
        >
          <Settings2 size={18} strokeWidth={1.8} />
        </button>
      ) : (
        <div className="flex w-full flex-col">
          <div className="flex items-center justify-between border-b border-[#E6E1D3] px-4 py-4">
            <div>
              <h2 className="text-sm font-bold text-[#22201A]">Appearance</h2>
              <p className="mt-1 text-[9px] text-[#8A8473]">
                Change how the notes look.
              </p>
            </div>

            <button
              type="button"
              onClick={toggleOpen}
              className="rounded-md p-1 text-[#8A8473] hover:bg-[#F7F4EC]"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto p-4">
            {/* NEW: Note Style, placed first since it can override the
                look of everything below it (e.g. sketch style implies
                its own font/paper) */}
            <div>
              <p className="mb-2 text-[10px] font-semibold text-[#22201A]">
                Note Style
              </p>

              <div className="grid grid-cols-2 gap-1.5">
                {noteStyles.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setNoteStyle(value)}
                    className={buttonClass(noteStyle === value)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {noteStyle === "sketch" && (
                <p className="mt-2 text-[9px] leading-4 text-[#8A8473]">
                  Sketch Notebook uses its own handwritten font and paper
                  texture — the Font and Paper options below are ignored
                  while it's selected.
                </p>
              )}
            </div>

            <div className={noteStyle === "sketch" ? "opacity-40" : ""}>
              <p className="mb-2 text-[10px] font-semibold text-[#22201A]">
                Font
              </p>

              <div className="grid grid-cols-2 gap-1.5">
                {fonts.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    disabled={noteStyle === "sketch"}
                    onClick={() => setFont(value)}
                    className={`${buttonClass(font === value)} disabled:cursor-not-allowed`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-semibold text-[#22201A]">
                Text Size
              </p>

              <div className="grid grid-cols-3 gap-1.5">
                {sizes.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFontSize(value)}
                    className={buttonClass(fontSize === value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-semibold text-[#22201A]">
                Line Spacing
              </p>

              <div className="grid grid-cols-3 gap-1.5">
                {spacing.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setLineSpacing(value)}
                    className={buttonClass(lineSpacing === value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-semibold text-[#22201A]">
                Note Width
              </p>

              <div className="space-y-1.5">
                {widths.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setNoteWidth(value)}
                    className={`${buttonClass(
                      noteWidth === value
                    )} w-full text-left`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className={noteStyle === "sketch" ? "opacity-40" : ""}>
              <p className="mb-2 text-[10px] font-semibold text-[#22201A]">
                Paper
              </p>

              <div className="grid grid-cols-2 gap-1.5">
                {papers.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    disabled={noteStyle === "sketch"}
                    onClick={() => setPaperStyle(value)}
                    className={`${buttonClass(paperStyle === value)} disabled:cursor-not-allowed`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-[#E6E1D3] p-3">
            <button
              type="button"
              onClick={handleSavePDF}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#22201A] px-3 py-2.5 text-[10px] font-semibold text-white hover:bg-[#3A362C]"
            >
              <Download size={14} />
              Save as PDF
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

export default FormattingSidebar;