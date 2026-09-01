import { useEffect, useState } from "react";
import {
  FileText,
  Trash2,
  Plus,
  Search,
  LoaderCircle,
} from "lucide-react";

import SourceUploader from "../components/SourceUploader";
import {
  getDocuments,
  deleteDocument,
} from "../services/documentService";

function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) return;

        const data = await getDocuments(token);

        setDocuments(data.documents || []);
      } catch (error) {
        console.error("Failed to load documents:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, []);

  const handleUploaded = (document) => {
    setDocuments((previous) => [document, ...previous]);
    setShowUploader(false);
  };

  const handleDelete = async (document) => {
    const confirmed = window.confirm(
      `Delete "${document.name}"?`,
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      await deleteDocument(document._id, token);

      setDocuments((previous) =>
        previous.filter((item) => item._id !== document._id),
      );
    } catch (error) {
      console.error("Failed to delete document:", error);

      alert(error.message || "Failed to delete document.");
    }
  };

  const filteredDocuments = documents.filter((document) =>
    document.name
      ?.toLowerCase()
      .includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#F7F4EC]">
        <div className="flex items-center gap-2 text-xs text-[#8A8473]">
          <LoaderCircle size={15} className="animate-spin" />
          Loading sources...
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[#F7F4EC]">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FileText
                size={19}
                className="text-[#BD7B24]"
              />

              <h1 className="text-xl font-semibold text-[#22201A]">
                Sources
              </h1>
            </div>

            <p className="mt-1.5 text-xs text-[#8A8473]">
              Manage the documents and videos used in your research.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowUploader((value) => !value)}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#22201A] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#3A362C]"
          >
            <Plus size={14} />

            {showUploader ? "Close" : "Add Source"}
          </button>
        </div>

        {showUploader && (
          <div className="mt-6 rounded-2xl border border-[#E6E1D3] bg-white p-5">
            <SourceUploader onUploaded={handleUploaded} />
          </div>
        )}

        <div className="mt-7 flex items-center gap-2 rounded-xl border border-[#E6E1D3] bg-white px-3 py-2.5">
          <Search
            size={15}
            className="shrink-0 text-[#A09A8B]"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search sources..."
            className="min-w-0 flex-1 bg-transparent text-xs text-[#22201A] outline-none placeholder:text-[#A09A8B]"
          />
        </div>

        {filteredDocuments.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-[#E6E1D3] bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#F3EFE4] text-[#BD7B24]">
              <FileText size={19} />
            </div>

            <h2 className="mt-4 text-sm font-semibold text-[#22201A]">
              No sources found
            </h2>

            <p className="mt-1.5 text-xs text-[#8A8473]">
              Add a document or video to start researching.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments.map((document) => (
              <div
                key={document._id}
                className="group rounded-xl border border-[#E6E1D3] bg-white p-4 transition hover:border-[#D8CDB7] hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F3EFE4] text-[#BD7B24]">
                    <FileText size={17} />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(document)}
                    className="rounded-md p-1.5 text-[#A09A8B] opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                    title="Delete source"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <h2 className="mt-4 truncate text-sm font-semibold text-[#22201A]">
                  {document.name}
                </h2>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-wide text-[#8A8473]">
                    {document.sourceType || document.contentType || "Source"}
                  </span>

                  <span className="text-[9px] text-[#A09A8B]">
                    {document.status || "Available"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Documents;