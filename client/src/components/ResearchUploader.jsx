import { useState } from "react";
import {
  FileText,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { uploadDocument } from "../services/documentService";

const ALLOWED_EXTENSIONS = [".pdf", ".txt", ".docx"];

// Research papers and textbooks routinely run well past a typical 20MB cap —
// keep this in sync with whatever limit your upload endpoint / multer config
// actually enforces server-side, since a client-side number alone won't stop
// a large request from being rejected upstream.
const MAX_FILE_SIZE = 75 * 1024 * 1024;

let nextId = 0;

function formatSize(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function validateFile(file) {
  const isValidType = ALLOWED_EXTENSIONS.some((extension) =>
    file.name.toLowerCase().endsWith(extension),
  );

  if (!isValidType) {
    return "Only PDF, DOCX, and TXT files are supported.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return `File is too large. Maximum size is ${formatSize(MAX_FILE_SIZE)}.`;
  }

  return null;
}

// Search-page-only uploader for adding a batch of papers/documents to the
// research library. This is a separate component from SourceUploader (which
// stays single-file, tabbed file/web/video for the main upload + chat page)
// because the two features have genuinely different jobs: chat is "pick one
// source to talk to," search is "index a pile of papers I'll query later."
//
// `compact` drops the page-level heading/padding so this can be embedded
// inside another card (e.g. the Search page's "Add to your research" panel)
// without stacking two headings.
function ResearchUploader({ onUploaded, compact = false }) {
  const [queue, setQueue] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [formError, setFormError] = useState("");

  const isBusy = queue.some((item) => item.status === "uploading");
  const hasPending = queue.some((item) => item.status === "pending");

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList || []);
    if (incoming.length === 0) return;

    setFormError("");

    const nextItems = incoming.map((file) => {
      const error = validateFile(file);
      return {
        id: `f${nextId++}`,
        file,
        status: error ? "error" : "pending",
        message: error || "",
      };
    });

    setQueue((prev) => [...prev, ...nextItems]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  };

  const removeItem = (id) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (id, patch) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  const handleProcessAll = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setFormError("Please login before uploading.");
      return;
    }

    const pendingItems = queue.filter((item) => item.status === "pending");
    if (pendingItems.length === 0) return;

    // Uploaded and indexed one at a time — large PDFs can take real time to
    // process, and running them sequentially keeps status per file legible
    // and avoids piling concurrent heavy requests on the indexing service.
    for (const item of pendingItems) {
      updateItem(item.id, { status: "uploading", message: "Uploading and indexing…" });

      try {
        const data = await uploadDocument(item.file, token, {
          saveToLibrary: false,
        });
        updateItem(item.id, { status: "done", message: "Indexed" });
        onUploaded?.(data.document);
      } catch (error) {
        updateItem(item.id, {
          status: "error",
          message: error.message || "Upload failed.",
        });
      }
    }
  };

  const clearFinished = () => {
    setQueue((prev) => prev.filter((item) => item.status !== "done"));
  };

  return (
    <div
      className={
        compact
          ? "mx-auto w-full"
          : "mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 sm:py-12"
      }
    >
      {!compact && (
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-[#E6E1D3] bg-white text-[#BD7B24] shadow-sm">
            <Upload size={18} strokeWidth={1.8} />
          </div>

          <p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#BD7B24]">
            Add to research
          </p>

          <h1 className="mt-1.5 text-2xl font-medium tracking-tight text-[#22201A] sm:text-[27px]">
            Build your research library
          </h1>

          <p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-[#8A8473]">
            Add papers or documents and turn them into a searchable knowledge
            base.
          </p>
        </div>
      )}

      <div
        className={
          compact
            ? "overflow-hidden rounded-xl border border-[#E6E1D3] bg-white p-3"
            : "overflow-hidden rounded-2xl border border-[#E6E1D3] bg-white p-3 shadow-sm"
        }
      >
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`rounded-xl border-2 border-dashed text-center transition ${
            compact ? "px-4 py-8" : "px-5 py-12"
          } ${
            dragging
              ? "border-[#BD7B24] bg-[#F7F1E5]"
              : "border-[#E6E1D3] hover:border-[#D4C5AA] hover:bg-[#FDFBF7]"
          }`}
        >
          <div
            className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl transition ${
              dragging
                ? "bg-[#EAD8B8] text-[#BD7B24]"
                : "bg-[#F3EFE4] text-[#8A8473]"
            }`}
          >
            <Upload size={19} strokeWidth={1.7} />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-[#22201A]">
            Drop papers or documents here
          </h3>

          <p className="mt-1 text-[11px] text-[#8A8473]">
            Add as many as you like — you can queue several at once
          </p>

          <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#22201A] px-4 py-2.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-[#3A362C]">
            <FileText size={14} />
            Choose files

            <input
              type="file"
              hidden
              multiple
              accept=".pdf,.txt,.docx"
              onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = "";
              }}
            />
          </label>

          <p className="mt-4 text-[10px] text-[#A09A8B]">
            PDF, DOCX or TXT · Up to {formatSize(MAX_FILE_SIZE)} each
          </p>
        </div>

        {queue.length > 0 && (
          <div className="mt-3 space-y-2">
            {queue.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-[#E6E1D3] bg-[#FBF9F4] p-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#BD7B24] shadow-sm">
                  {item.status === "uploading" ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : item.status === "done" ? (
                    <CheckCircle2 size={17} className="text-[#607653]" />
                  ) : item.status === "error" ? (
                    <AlertCircle size={17} className="text-[#A46B22]" />
                  ) : (
                    <FileText size={17} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-[#22201A]">
                    {item.file.name}
                  </p>

                  <p
                    className={`mt-0.5 text-[10px] ${
                      item.status === "error" ? "text-[#A46B22]" : "text-[#8A8473]"
                    }`}
                  >
                    {item.message || formatSize(item.file.size)}
                  </p>
                </div>

                {item.status !== "uploading" && (
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#A09A8B] transition hover:bg-[#F0EDE4] hover:text-[#22201A]"
                    aria-label={`Remove ${item.file.name}`}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {formError && (
          <div className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-[#FBF1EE] px-3 py-2.5 text-[10px] text-[#9B4C3D]">
            <AlertCircle size={13} />
            {formError}
          </div>
        )}

        {queue.length > 0 && (
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleProcessAll}
              disabled={isBusy || !hasPending}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#22201A] px-4 py-3 text-[11px] font-semibold text-white transition hover:bg-[#3A362C] disabled:cursor-not-allowed disabled:opacity-35"
            >
              {isBusy ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  {hasPending
                    ? `Process ${queue.filter((i) => i.status === "pending").length} document${
                        queue.filter((i) => i.status === "pending").length === 1 ? "" : "s"
                      }`
                    : "All processed"}
                  <Upload size={13} />
                </>
              )}
            </button>

            {queue.some((item) => item.status === "done") && !isBusy && (
              <button
                type="button"
                onClick={clearFinished}
                className="rounded-xl border border-[#E6E1D3] px-4 py-3 text-[11px] font-semibold text-[#8A8473] transition hover:bg-[#F3EFE4]"
              >
                Clear indexed
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResearchUploader;