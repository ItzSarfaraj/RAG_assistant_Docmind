import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Download, LoaderCircle } from "lucide-react";
import NotesSidebar from "../components/notes/NotesSidebar";
import FormattingSidebar from "../components/notes/FormattingSidebar";
import NotesContent from "../components/notes/NotesContent";

function NotesPage() {
  const { noteId } = useParams();
  const navigate = useNavigate();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState("");
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  const [detailLevel, setDetailLevel] = useState("detailed");
  const [explanationLevel, setExplanationLevel] = useState("intermediate");
  const [noteStructure, setNoteStructure] = useState("structured");
  const [faithfulToVideo, setFaithfulToVideo] = useState(true);

  const [font, setFont] = useState("default");
  const [fontSize, setFontSize] = useState("medium");
  const [lineSpacing, setLineSpacing] = useState("normal");
  const [noteWidth, setNoteWidth] = useState("wide");
  const [paperStyle, setPaperStyle] = useState("paper");
  const [noteStyle, setNoteStyle] = useState("classic"); // NEW: "classic" | "sketch"

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

  useEffect(() => {
    const loadNote = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Please login to view this note.");

        const response = await fetch(`/api/notes/${noteId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to load note.");

        setNote(data.note);

        if (data.note?.detailLevel) setDetailLevel(data.note.detailLevel);
        if (data.note?.explanationLevel) setExplanationLevel(data.note.explanationLevel);
        if (data.note?.noteStructure) setNoteStructure(data.note.noteStructure);
        if (typeof data.note?.faithfulToVideo === "boolean") setFaithfulToVideo(data.note.faithfulToVideo);

        if (data.note?.include) {
          setInclude((previous) => ({ ...previous, ...data.note.include }));
        }
      } catch (error) {
        console.error("NOTE LOAD ERROR:", error);
        setError(error.message || "Failed to load note.");
      } finally {
        setLoading(false);
      }
    };

    loadNote();
  }, [noteId]);

  const toggleInclude = (key) => setInclude((previous) => ({ ...previous, [key]: !previous[key] }));

  const toggleLeft = () => {
    setLeftOpen((previous) => !previous);
    setRightOpen(false);
  };

  const toggleRight = () => {
    setRightOpen((previous) => !previous);
    setLeftOpen(false);
  };

  const handleSavePDF = () => window.print();

  const handleRegenerate = async () => {
    const documentId = note?.document?._id || note?.document;

    if (!documentId) {
      setError("Document information is not available.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login before regenerating notes.");
      return;
    }

    try {
      setRegenerating(true);
      setError("");

      const response = await fetch("/api/notes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ documentId, detailLevel, explanationLevel, noteStructure, include, faithfulToVideo }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to regenerate notes.");
      if (!data.note?._id) throw new Error("No note ID returned.");

      navigate(`/notes/${data.note._id}`);
    } catch (error) {
      console.error("NOTE REGENERATION ERROR:", error);
      setError(error.message || "Failed to regenerate notes.");
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F7F4EC]">
        <div className="text-center">
          <LoaderCircle size={26} className="mx-auto animate-spin text-[#BD7B24]" />
          <p className="mt-3 text-xs text-[#8A8473]">Loading notes...</p>
        </div>
      </div>
    );
  }

  if (error && !note) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F7F4EC] px-6">
        <div className="max-w-sm text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
            <AlertTriangle size={22} className="text-[#BD7B24]" />
          </div>

          <h2 className="mt-4 text-sm font-semibold text-[#22201A]">Unable to load notes</h2>
          <p className="mt-2 text-xs text-[#8A8473]">{error}</p>

          <button type="button" onClick={() => navigate(-1)} className="mt-5 flex mx-auto items-center gap-2 rounded-lg bg-[#22201A] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#3A362C]">
            <ArrowLeft size={14} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F4EC] text-[#22201A]">
      <NotesSidebar
        open={leftOpen}
        toggleOpen={toggleLeft}
        navigate={navigate}
        noteStructure={noteStructure}
        setNoteStructure={setNoteStructure}
        detailLevel={detailLevel}
        setDetailLevel={setDetailLevel}
        explanationLevel={explanationLevel}
        setExplanationLevel={setExplanationLevel}
        faithfulToVideo={faithfulToVideo}
        setFaithfulToVideo={setFaithfulToVideo}
        include={include}
        toggleInclude={toggleInclude}
        handleRegenerate={handleRegenerate}
        regenerating={regenerating}
      />

      <section className="min-w-0 flex-1 overflow-y-auto">
        <header className="print-hide sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#E6E1D3] bg-white/95 px-4 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button type="button" onClick={() => navigate(-1)} className="rounded-lg p-2 text-[#75705F] hover:bg-[#F7F4EC]" title="Go back">
              <ArrowLeft size={17} />
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold">{note?.title || "Generated Notes"}</h1>
              <p className="mt-0.5 text-[9px] text-[#8A8473]">AI-generated study notes</p>
            </div>
          </div>

          <button type="button" onClick={handleSavePDF} className="flex shrink-0 items-center gap-2 rounded-lg bg-[#22201A] px-3 py-2 text-xs font-semibold text-white hover:bg-[#3A362C]" title="Save as PDF">
            <Download size={14} />
            <span className="hidden sm:inline">Save as PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>
        </header>

        {error && (
          <div className="print-hide mx-auto max-w-4xl px-4 pt-4 sm:px-6">
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[10px] text-red-600">{error}</div>
          </div>
        )}

        <NotesContent
          note={note}
          font={font}
          fontSize={fontSize}
          lineSpacing={lineSpacing}
          noteWidth={noteWidth}
          paperStyle={paperStyle}
          noteStyle={noteStyle}
        />
      </section>

      <FormattingSidebar
        open={rightOpen}
        toggleOpen={toggleRight}
        font={font}
        setFont={setFont}
        fontSize={fontSize}
        setFontSize={setFontSize}
        lineSpacing={lineSpacing}
        setLineSpacing={setLineSpacing}
        noteWidth={noteWidth}
        setNoteWidth={setNoteWidth}
        paperStyle={paperStyle}
        setPaperStyle={setPaperStyle}
        noteStyle={noteStyle}
        setNoteStyle={setNoteStyle}
        handleSavePDF={handleSavePDF}
      />

      <style>{`
        @media print {
          @page { margin: 18mm; }
          body { background: white !important; }
          .print-hide, aside, header { display: none !important; }
          main { overflow: visible !important; padding: 0 !important; }
          article { max-width: none !important; border: none !important; box-shadow: none !important; padding: 0 !important; background: white !important; }
          h1,h2,h3,h4 { break-after: avoid; }
          p,li,pre,table { break-inside: avoid; }
          pre { white-space: pre-wrap !important; word-break: break-word !important; }
          svg { max-width: 100% !important; }
        }
      `}</style>
    </div>
  );
}

export default NotesPage;