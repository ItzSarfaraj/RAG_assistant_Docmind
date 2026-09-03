import { useState } from "react";
import {
  FileText,
  FileType,
  Link,
  Upload,
  Video,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { uploadDocument } from "../services/documentService";
import WebSource from "./WebSource";
import VideoSource from "./VideoSource";

// `compact` drops the page-level heading and outer padding so this can be
// embedded inside another card (e.g. the Search page's "Add to your
// research" panel) without stacking two headings or doubling the padding.
function SourceUploader({ onUploaded, compact = false }) {
  const [mode, setMode] = useState("file");
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const allowedExtensions = [".pdf", ".txt", ".docx"];
  const maxFileSize = 20 * 1024 * 1024;

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    const isValidType = allowedExtensions.some((extension) =>
      selectedFile.name.toLowerCase().endsWith(extension),
    );

    if (!isValidType) {
      setFile(null);
      setStatus("Only PDF, TXT and DOCX files are supported.");
      return;
    }

    if (selectedFile.size > maxFileSize) {
      setFile(null);
      setStatus("File size must be 20 MB or less.");
      return;
    }

    setFile(selectedFile);
    setStatus("");
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    handleFile(event.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus("Please select a document first.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setStatus("Please login before uploading.");
      return;
    }

    try {
      setLoading(true);
      setStatus("Uploading and indexing document...");

      const data = await uploadDocument(file, token);

      setStatus("Document indexed successfully.");
      setFile(null);

      if (onUploaded) {
        onUploaded(data.document);
      }
    } catch (error) {
      setStatus(error.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (newMode) => {
    if (loading) return;

    setMode(newMode);
    setStatus("");
    setFile(null);
  };

  const sourceTabs = [
    {
      id: "file",
      label: "File",
      icon: FileText,
    },
    {
      id: "web",
      label: "Web",
      icon: Link,
    },
    {
      id: "video",
      label: "Video",
      icon: Video,
    },
  ];

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
            New source
          </p>

          <h1 className="mt-1.5 font-[Fraunces] text-2xl font-medium tracking-tight text-[#22201A] sm:text-[27px]">
            What do you want to research?
          </h1>

          <p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-[#8A8473]">
            Add a document, webpage, or video and turn it into an intelligent
            knowledge source.
          </p>
        </div>
      )}

      <div
        className={
          compact
            ? "overflow-hidden rounded-xl border border-[#E6E1D3] bg-white p-2"
            : "overflow-hidden rounded-2xl border border-[#E6E1D3] bg-white p-2 shadow-sm"
        }
      >
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-[#F3EFE4] p-1">
          {sourceTabs.map(({ id, label, icon: Icon }) => {
            const active = mode === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => handleModeChange(id)}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold transition ${
                  active
                    ? "bg-white text-[#22201A] shadow-sm"
                    : "text-[#8A8473] hover:text-[#22201A]"
                }`}
              >
                <Icon size={14} strokeWidth={1.8} />
                {label}
              </button>
            );
          })}
        </div>

        {mode === "file" && (
          <div className="p-1">
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`mt-2 rounded-xl border-2 border-dashed text-center transition ${
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
                Drop your document here
              </h3>

              <p className="mt-1 text-[11px] text-[#8A8473]">
                or choose a file from your computer
              </p>

              <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#22201A] px-4 py-2.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-[#3A362C]">
                <FileText size={14} />
                Choose file

                <input
                  type="file"
                  hidden
                  accept=".pdf,.txt,.docx"
                  onChange={(event) => handleFile(event.target.files[0])}
                />
              </label>

              <p className="mt-4 text-[10px] text-[#A09A8B]">
                PDF, DOCX or TXT · Maximum 20 MB
              </p>
            </div>

            {file && (
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#E6E1D3] bg-[#FBF9F4] p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#BD7B24] shadow-sm">
                  <FileType size={17} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-[#22201A]">
                    {file.name}
                  </p>

                  <p className="mt-0.5 text-[10px] text-[#8A8473]">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setStatus("");
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-[#A09A8B] transition hover:bg-[#F0EDE4] hover:text-[#22201A]"
                  aria-label="Remove selected file"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleUpload}
              disabled={loading || !file}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#22201A] px-4 py-3 text-[11px] font-semibold text-white transition hover:bg-[#3A362C] disabled:cursor-not-allowed disabled:opacity-35"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Uploading and indexing...
                </>
              ) : (
                <>
                  Process document
                  <Upload size={13} />
                </>
              )}
            </button>
          </div>
        )}

        {mode === "web" && <WebSource onUploaded={onUploaded} />}

        {mode === "video" && <VideoSource onUploaded={onUploaded} />}

        {status && (
          <div className="mx-1 mb-1 flex items-center justify-center gap-2 rounded-lg bg-[#F7F4EC] px-3 py-2.5 text-[10px] text-[#756F61]">
            {status.includes("successfully") ? (
              <CheckCircle2 size={13} className="text-[#607653]" />
            ) : status.includes("Only") || status.includes("must") ? (
              <AlertCircle size={13} className="text-[#A46B22]" />
            ) : null}

            {status}
          </div>
        )}
      </div>

      {!compact && (
        <div className="mt-7 text-center">
          <p className="mb-3 text-[9px] font-semibold tracking-[0.18em] text-[#A09A8B]">
            SUPPORTED SOURCES
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {[
              [FileText, "PDF"],
              [FileType, "DOCX"],
              [FileText, "TXT"],
              [Link, "Web"],
              [Video, "Video URL"],
            ].map(([Icon, label]) => (
              <span
                key={label}
                className="flex items-center gap-1.5 rounded-full border border-[#E6E1D3] bg-white px-3 py-1.5 text-[10px] text-[#8A8473]"
              >
                <Icon size={11} />
                {label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SourceUploader;