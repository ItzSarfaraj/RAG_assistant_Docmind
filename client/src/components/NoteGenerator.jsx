import { useState } from "react";
import { useNavigate } from "react-router-dom";

function NoteGenerator({ document, onGenerated }) {
  const navigate = useNavigate();
  const [detailLevel, setDetailLevel] = useState("detailed");
  const [explanationLevel, setExplanationLevel] = useState("intermediate");
  const [noteStructure, setNoteStructure] = useState("structured");
  const [faithfulToVideo, setFaithfulToVideo] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const [include, setInclude] = useState({
    summary: true,
    keyConcepts: true,
    examples: true,
    code: false,
    flowcharts: false,
    diagrams: false,
    tables: false,
    keyTakeaways: true,
    interviewQuestions: false,
  });

  const toggleInclude = (key) => {
    setInclude((previous) => ({ ...previous, [key]: !previous[key] }));
  };

  const handleGenerate = async () => {
    if (!document?._id) return setError("No video document selected.");

    const token = localStorage.getItem("token");
    if (!token) return setError("Please login before generating notes.");

    try {
      setGenerating(true);
      setError("");

      const response = await fetch("/api/notes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          documentId: document._id,
          detailLevel,
          explanationLevel,
          noteStructure,
          include,
          faithfulToVideo,
        }),
      });

      const text = await response.text();
      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Invalid server response (${response.status}).`);
      }

      if (!response.ok)
        throw new Error(data.message || "Failed to generate notes.");

      if (!data.note?._id)
        throw new Error("Notes generated but note ID was not returned.");

      onGenerated?.(data);

      navigate(`/notes/${data.note._id}`);
    } catch (error) {
      console.error("NOTE GENERATION ERROR:", error);
      setError(error.message || "Failed to generate notes.");
    } finally {
      setGenerating(false);
    }
  };

  const includeOptions = [
    ["summary", "Summary"],
    ["keyConcepts", "Key Concepts"],
    ["examples", "Examples"],
    ["code", "Code / Implementation"],
    ["flowcharts", "Flowcharts"],
    ["diagrams", "Diagrams"],
    ["tables", "Tables"],
    ["keyTakeaways", "Key Takeaways"],
    ["interviewQuestions", "Interview Questions"],
  ];

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold text-[#22201A]">
          Note Structure
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {[
            ["structured", "Structured"],
            ["study", "Study Notes"],
            ["handbook", "Detailed Handbook"],
            ["revision", "Quick Revision"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setNoteStructure(value)}
              className={`rounded-lg border px-3 py-2 text-left text-[10px] transition ${
                noteStructure === value
                  ? "border-[#BD7B24] bg-[#F3EFE4] text-[#BD7B24]"
                  : "border-[#E6E1D3] bg-white text-[#75705F] hover:bg-[#F7F4EC]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold text-[#22201A]">Detail Level</p>
        <div className="mt-2 flex gap-2">
          {[
            ["concise", "Concise"],
            ["moderate", "Moderate"],
            ["detailed", "Detailed"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setDetailLevel(value)}
              className={`flex-1 rounded-lg border px-3 py-2 text-[10px] transition ${
                detailLevel === value
                  ? "border-[#BD7B24] bg-[#F3EFE4] font-semibold text-[#BD7B24]"
                  : "border-[#E6E1D3] bg-white text-[#75705F] hover:bg-[#F7F4EC]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold text-[#22201A]">
          Explanation Level
        </p>
        <div className="mt-2 flex gap-2">
          {[
            ["beginner", "Beginner"],
            ["intermediate", "Intermediate"],
            ["advanced", "Advanced"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setExplanationLevel(value)}
              className={`flex-1 rounded-lg border px-3 py-2 text-[10px] transition ${
                explanationLevel === value
                  ? "border-[#BD7B24] bg-[#F3EFE4] font-semibold text-[#BD7B24]"
                  : "border-[#E6E1D3] bg-white text-[#75705F] hover:bg-[#F7F4EC]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold text-[#22201A]">
          Include in Notes
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {includeOptions.map(([key, label]) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#E6E1D3] bg-white px-3 py-2 text-[10px] text-[#75705F] hover:bg-[#F7F4EC]"
            >
              <input
                type="checkbox"
                checked={include[key]}
                onChange={() => toggleInclude(key)}
                className="accent-[#BD7B24]"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-[#E6E1D3] bg-[#F7F4EC] p-3">
        <label className="flex cursor-pointer items-start gap-2">
          <input
            type="checkbox"
            checked={faithfulToVideo}
            onChange={(e) => setFaithfulToVideo(e.target.checked)}
            className="mt-0.5 accent-[#BD7B24]"
          />
          <div>
            <p className="text-[10px] font-semibold text-[#22201A]">
              Use video content only
            </p>
            <p className="mt-1 text-[9px] leading-4 text-[#8A8473]">
              When disabled, the AI may use external knowledge to clarify
              concepts and add useful context.
            </p>
          </div>
        </label>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[10px] text-red-600">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleGenerate}
        disabled={generating}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#22201A] px-4 py-3 text-xs font-semibold text-white transition hover:bg-[#3A362C] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span>📝</span>
        {generating ? "Generating Notes..." : "Generate Notes"}
      </button>
    </div>
  );
}

export default NoteGenerator;
