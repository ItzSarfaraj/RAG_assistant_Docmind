import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  NotebookPen,
  FileText,
  Clock3,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";

import { getNotes } from "../services/noteService";

function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Please login to view your notes.");
        }

        const data = await getNotes(token);

        setNotes(data.notes || []);
      } catch (error) {
        console.error("Failed to load notes:", error);
        setError(error.message || "Failed to load notes.");
      } finally {
        setLoading(false);
      }
    };

    loadNotes();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#F7F4EC]">
        <div className="flex items-center gap-2 text-xs text-[#8A8473]">
          <LoaderCircle size={15} className="animate-spin" />
          Loading notes...
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[#F7F4EC]">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <NotebookPen size={19} className="text-[#BD7B24]" />

              <h1 className="text-xl font-semibold text-[#22201A]">
                My Notes
              </h1>
            </div>

            <p className="mt-1.5 text-xs text-[#8A8473]">
              Your generated study notes in one place.
            </p>
          </div>

          <div className="hidden rounded-lg border border-[#E6E1D3] bg-white px-3 py-2 sm:block">
            <p className="text-[9px] uppercase tracking-wide text-[#8A8473]">
              Total notes
            </p>

            <p className="mt-0.5 text-sm font-semibold text-[#22201A]">
              {notes.length}
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
            {error}
          </div>
        )}

        {!error && notes.length === 0 && (
          <div className="mt-8 rounded-2xl border border-[#E6E1D3] bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3EFE4] text-[#BD7B24]">
              <NotebookPen size={20} />
            </div>

            <h2 className="mt-4 text-sm font-semibold text-[#22201A]">
              No notes yet
            </h2>

            <p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-[#8A8473]">
              Generate notes from a video in your research workspace and they
              will appear here.
            </p>

            <Link
              to="/research"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#22201A] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#3A362C]"
            >
              Go to Research
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {notes.length > 0 && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => {
              const documentName =
                typeof note.document === "object"
                  ? note.document?.name
                  : "Video source";

              return (
                <Link
                  key={note._id}
                  to={`/notes/${note._id}`}
                  className="group flex min-h-[190px] flex-col rounded-2xl border border-[#E6E1D3] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#D8CDB7] hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F3EFE4] text-[#BD7B24]">
                      <FileText size={17} />
                    </div>

                    <ArrowRight
                      size={15}
                      className="text-[#A9A392] transition group-hover:translate-x-0.5 group-hover:text-[#BD7B24]"
                    />
                  </div>

                  <h2 className="mt-5 line-clamp-2 text-sm font-semibold leading-5 text-[#22201A]">
                    {note.title || "Generated Notes"}
                  </h2>

                  <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-[#8A8473]">
                    {documentName || "Video source"}
                  </p>

                  <div className="mt-auto flex items-center gap-1.5 pt-5 text-[9px] text-[#A09A8B]">
                    <Clock3 size={12} />

                    {note.createdAt
                      ? new Date(note.createdAt).toLocaleDateString()
                      : "Recently created"}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notes;