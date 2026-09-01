import { Settings, X, ChevronLeft } from "lucide-react";

function NotesSidebar({ open, toggleOpen, navigate, noteStructure, setNoteStructure, detailLevel, setDetailLevel, explanationLevel, setExplanationLevel, faithfulToVideo, setFaithfulToVideo, include, toggleInclude, handleRegenerate, regenerating }) {
  const structures = [["structured", "Structured"], ["study", "Study"], ["handbook", "Handbook"], ["revision", "Revision"]];
  const details = [["concise", "Concise"], ["moderate", "Moderate"], ["detailed", "Detailed"]];
  const explanations = [["beginner", "Beginner"], ["intermediate", "Intermediate"], ["advanced", "Advanced"]];
  const includeOptions = [["summary", "Summary"], ["keyConcepts", "Key Concepts"], ["examples", "Examples"], ["code", "Code"], ["flowcharts", "Flowcharts"], ["diagrams", "Diagrams"], ["tables", "Tables"], ["keyTakeaways", "Key Takeaways"], ["interviewQuestions", "Interview Questions"]];

  const buttonClass = (active) => `rounded-lg border px-2.5 py-2 text-[9px] transition ${active ? "border-[#BD7B24] bg-[#F3EFE4] font-semibold text-[#BD7B24]" : "border-[#E6E1D3] text-[#75705F] hover:bg-[#F7F4EC]"}`;

  return (
    <aside className={`print-hide relative z-30 flex h-screen shrink-0 border-r border-[#E6E1D3] bg-white transition-all duration-200 ${open ? "w-64" : "w-12"}`}>
      {!open ? (
        <button type="button" onClick={toggleOpen} className="flex h-full w-full items-start justify-center pt-5 text-[#75705F] hover:bg-[#F7F4EC]" title="Regenerate notes">
          <Settings size={18} strokeWidth={1.8} />
        </button>
      ) : (
        <div className="flex w-full flex-col">
          <div className="flex items-center justify-between border-b border-[#E6E1D3] px-4 py-4">
            <div>
              <h2 className="text-sm font-bold text-[#22201A]">Generate Notes</h2>
              <p className="mt-1 text-[9px] text-[#8A8473]">Change AI-generated content.</p>
            </div>

            <button type="button" onClick={toggleOpen} className="rounded-md p-1 text-[#8A8473] hover:bg-[#F7F4EC]">
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto p-4">
            <div>
              <p className="mb-2 text-[10px] font-semibold text-[#22201A]">Structure</p>
              <div className="grid grid-cols-2 gap-1.5">
                {structures.map(([value, label]) => (
                  <button key={value} type="button" onClick={() => setNoteStructure(value)} className={buttonClass(noteStructure === value)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-semibold text-[#22201A]">Detail</p>
              <div className="grid grid-cols-3 gap-1.5">
                {details.map(([value, label]) => (
                  <button key={value} type="button" onClick={() => setDetailLevel(value)} className={buttonClass(detailLevel === value)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-semibold text-[#22201A]">Explanation</p>
              <div className="grid grid-cols-3 gap-1.5">
                {explanations.map(([value, label]) => (
                  <button key={value} type="button" onClick={() => setExplanationLevel(value)} className={buttonClass(explanationLevel === value)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-semibold text-[#22201A]">Content</p>
              <div className="space-y-0.5">
                {includeOptions.map(([key, label]) => (
                  <label key={key} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[9px] text-[#75705F] hover:bg-[#F7F4EC]">
                    <input type="checkbox" checked={include[key]} onChange={() => toggleInclude(key)} className="accent-[#BD7B24]" />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-[#E6E1D3] bg-[#F7F4EC] p-3">
              <input type="checkbox" checked={faithfulToVideo} onChange={(e) => setFaithfulToVideo(e.target.checked)} className="mt-0.5 accent-[#BD7B24]" />
              <span>
                <span className="block text-[9px] font-semibold text-[#22201A]">Video content only</span>
                <span className="mt-1 block text-[8px] leading-4 text-[#8A8473]">Use only information supported by the source.</span>
              </span>
            </label>
          </div>

          <div className="border-t border-[#E6E1D3] p-3">
            <button type="button" onClick={handleRegenerate} disabled={regenerating} className="w-full rounded-lg bg-[#22201A] px-3 py-2.5 text-[10px] font-semibold text-white hover:bg-[#3A362C] disabled:cursor-not-allowed disabled:opacity-50">
              {regenerating ? "Regenerating..." : "Regenerate Notes"}
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

export default NotesSidebar;