import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Clock3,
  FileText,
  NotebookPen,
  Plus,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getDocuments } from "../services/documentService";
import { getNotes } from "../services/noteService";

function Dashboard() {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) return;

        const [documentsData, notesData] = await Promise.all([
          getDocuments(token),
          getNotes(token),
        ]);

        setDocuments(documentsData.documents || []);
        setNotes(notesData.notes || []);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const recentDocuments = documents.slice(0, 4);
  const recentNotes = notes.slice(0, 4);

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#F7F4EC]">
        <div className="flex items-center gap-2 text-xs text-[#8A8473]">
          <Clock3 size={15} className="animate-pulse" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[#F7F4EC]">
      <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 sm:py-9">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-px w-5 bg-[#BD7B24]" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#BD7B24]">
                Overview
              </p>
            </div>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#22201A] sm:text-[27px]">
              Welcome back
            </h1>

            <p className="mt-1.5 max-w-xl text-xs leading-5 text-[#8A8473]">
              Continue your research, explore your sources, or review your
              generated notes.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/workspace")}
            className="group flex items-center justify-center gap-2 rounded-lg bg-[#22201A] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#3A362C]"
          >
            <Plus
              size={14}
              className="transition-transform group-hover:rotate-90"
            />
            New research
          </button>
        </header>

        <section className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <button
            type="button"
            onClick={() => navigate("/documents")}
            className="group rounded-xl border border-[#E6E1D3] bg-white p-4 text-left shadow-[0_1px_2px_rgba(34,32,26,0.02)] transition duration-200 hover:-translate-y-0.5 hover:border-[#D4C5AA] hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F3EFE4] text-[#BD7B24]">
                <FileText size={17} strokeWidth={1.8} />
              </div>

              <ArrowUpRight
                size={15}
                className="text-[#B1AA9A] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#BD7B24]"
              />
            </div>

            <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.12em] text-[#8A8473]">
              Sources
            </p>

            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#22201A]">
              {documents.length}
            </p>

            <p className="mt-1 text-[10px] text-[#A09A8B]">
              Documents and videos
            </p>
          </button>

          <button
            type="button"
            onClick={() => navigate("/notes")}
            className="group rounded-xl border border-[#E6E1D3] bg-white p-4 text-left shadow-[0_1px_2px_rgba(34,32,26,0.02)] transition duration-200 hover:-translate-y-0.5 hover:border-[#D4C5AA] hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F3EFE4] text-[#BD7B24]">
                <NotebookPen size={17} strokeWidth={1.8} />
              </div>

              <ArrowUpRight
                size={15}
                className="text-[#B1AA9A] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#BD7B24]"
              />
            </div>

            <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.12em] text-[#8A8473]">
              Generated notes
            </p>

            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#22201A]">
              {notes.length}
            </p>

            <p className="mt-1 text-[10px] text-[#A09A8B]">
              AI-generated study notes
            </p>
          </button>

          <button
            type="button"
            onClick={() => navigate("/search")}
            className="group rounded-xl border border-[#E6E1D3] bg-white p-4 text-left shadow-[0_1px_2px_rgba(34,32,26,0.02)] transition duration-200 hover:-translate-y-0.5 hover:border-[#D4C5AA] hover:shadow-md sm:col-span-2 lg:col-span-1"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F3EFE4] text-[#BD7B24]">
                <Search size={17} strokeWidth={1.8} />
              </div>

              <ArrowUpRight
                size={15}
                className="text-[#B1AA9A] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#BD7B24]"
              />
            </div>

            <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.12em] text-[#8A8473]">
              Research
            </p>

            <p className="mt-1 text-sm font-semibold text-[#22201A]">
              Search your knowledge
            </p>

            <p className="mt-1 text-[10px] text-[#A09A8B]">
              Find information across your workspace
            </p>
          </button>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          <div className="overflow-hidden rounded-2xl border border-[#E6E1D3] bg-white shadow-[0_1px_2px_rgba(34,32,26,0.02)]">
            <div className="flex items-center justify-between border-b border-[#E6E1D3] px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-[#22201A]">
                  Recent sources
                </h2>
                <p className="mt-0.5 text-[10px] text-[#8A8473]">
                  Your latest uploaded sources
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/documents")}
                className="flex items-center gap-1 text-[10px] font-semibold text-[#BD7B24] transition hover:text-[#8C5A19]"
              >
                View all
                <ArrowUpRight size={11} />
              </button>
            </div>

            {recentDocuments.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3EFE4] text-[#A09A8B]">
                  <FileText size={19} />
                </div>

                <p className="mt-3 text-xs font-semibold text-[#22201A]">
                  No sources yet
                </p>

                <p className="mx-auto mt-1 max-w-xs text-[10px] leading-4 text-[#8A8473]">
                  Add your first source to begin researching.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/workspace")}
                  className="mt-4 rounded-lg bg-[#22201A] px-3.5 py-2 text-[10px] font-semibold text-white transition hover:bg-[#3A362C]"
                >
                  Add source
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#E6E1D3]">
                {recentDocuments.map((document) => (
                  <button
                    key={document._id}
                    type="button"
                    onClick={() => navigate("/workspace")}
                    className="group flex w-full items-center gap-3 px-5 py-3.5 text-left transition hover:bg-[#FBF7EE]"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F3EFE4] text-[#BD7B24]">
                      <FileText size={16} strokeWidth={1.8} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-[#22201A]">
                        {document.name}
                      </p>

                      <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.08em] text-[#A09A8B]">
                        {document.sourceType ||
                          document.contentType ||
                          "Source"}
                      </p>
                    </div>

                    <span className="shrink-0 text-[9px] text-[#A09A8B]">
                      {formatDate(document.createdAt)}
                    </span>

                    <ArrowUpRight
                      size={12}
                      className="hidden text-[#B1AA9A] transition group-hover:text-[#BD7B24] sm:block"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#E6E1D3] bg-white shadow-[0_1px_2px_rgba(34,32,26,0.02)]">
            <div className="flex items-center justify-between border-b border-[#E6E1D3] px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-[#22201A]">
                  Recent notes
                </h2>
                <p className="mt-0.5 text-[10px] text-[#8A8473]">
                  Your latest generated notes
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/notes")}
                className="flex items-center gap-1 text-[10px] font-semibold text-[#BD7B24] transition hover:text-[#8C5A19]"
              >
                View all
                <ArrowUpRight size={11} />
              </button>
            </div>

            {recentNotes.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3EFE4] text-[#A09A8B]">
                  <NotebookPen size={19} />
                </div>

                <p className="mt-3 text-xs font-semibold text-[#22201A]">
                  No notes yet
                </p>

                <p className="mx-auto mt-1 max-w-xs text-[10px] leading-4 text-[#8A8473]">
                  Generate notes from your video sources.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#E6E1D3]">
                {recentNotes.map((note) => (
                  <button
                    key={note._id}
                    type="button"
                    onClick={() => navigate(`/notes/${note._id}`)}
                    className="group flex w-full items-center gap-3 px-5 py-3.5 text-left transition hover:bg-[#FBF7EE]"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F3EFE4] text-[#BD7B24]">
                      <NotebookPen size={16} strokeWidth={1.8} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-[#22201A]">
                        {note.title || "Generated Notes"}
                      </p>

                      <p className="mt-0.5 truncate text-[9px] text-[#A09A8B]">
                        {note.document?.name || "Study notes"}
                      </p>
                    </div>

                    <span className="shrink-0 text-[9px] text-[#A09A8B]">
                      {formatDate(note.createdAt)}
                    </span>

                    <ArrowUpRight
                      size={12}
                      className="hidden text-[#B1AA9A] transition group-hover:text-[#BD7B24] sm:block"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-[#39362D] bg-[#22201A] px-5 py-5 shadow-sm sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-px w-4 bg-[#E3B368]" />
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#E3B368]">
                  Continue researching
                </p>
              </div>

              <h2 className="mt-1.5 text-sm font-semibold text-[#F3EFE4]">
                Ask questions about your sources
              </h2>

              <p className="mt-1 text-[10px] leading-5 text-[#F3EFE4]/45">
                Open your workspace and continue where you left off.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/workspace")}
              className="group flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#E3B368] px-4 py-2.5 text-[10px] font-semibold text-[#22201A] transition hover:bg-[#EDC17E]"
            >
              Open workspace
              <ArrowUpRight
                size={13}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;