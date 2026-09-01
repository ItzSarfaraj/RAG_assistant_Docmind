import { useState } from "react";
import { uploadDocument } from "../services/documentService";
import WebSource from "./WebSource";
import VideoSource from "./VideoSource";

function SourceUploader({ onUploaded }) {
  const [mode, setMode] = useState("file");
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    const allowedExtensions = [".pdf", ".txt", ".docx"];

    const valid = allowedExtensions.some((extension) =>
      selectedFile.name.toLowerCase().endsWith(extension),
    );

    if (!valid) {
      setStatus("Only PDF, TXT and DOCX files are supported.");
      return;
    }

    setFile(selectedFile);
    setStatus("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
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
    setMode(newMode);
    setStatus("");
  };

  return (
    <div className="mx-auto w-[92%] max-w-4xl px-0 py-12 sm:py-16">
      {/* Heading */}
      <div className="mb-9 text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-xl text-white shadow-lg">
          ✦
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          What do you want to research?
        </h1>

        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-zinc-500">
          Add a document, webpage, or video and turn it into an intelligent
          knowledge source.
        </p>
      </div>

      {/* Source card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm">
        {/* Source tabs */}
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-zinc-100 p-1">
          <button
            type="button"
            onClick={() => handleModeChange("file")}
            className={`rounded-lg px-3 py-2.5 text-xs font-semibold transition ${
              mode === "file"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <span className="mr-1">📄</span>
            File
          </button>

          <button
            type="button"
            onClick={() => handleModeChange("web")}
            className={`rounded-lg px-3 py-2.5 text-xs font-semibold transition ${
              mode === "web"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <span className="mr-1">🔗</span>
            Web
          </button>

          <button
            type="button"
            onClick={() => handleModeChange("video")}
            className={`rounded-lg px-3 py-2.5 text-xs font-semibold transition ${
              mode === "video"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <span className="mr-1">🎥</span>
            Video
          </button>
        </div>

        {/* File mode */}
        {mode === "file" && (
          <div className="p-1">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`mt-2 rounded-xl border-2 border-dashed px-5 py-14 text-center transition ${
                dragging
                  ? "border-zinc-900 bg-zinc-50"
                  : "border-zinc-200 hover:border-zinc-300"
              }`}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-2xl">
                ↑
              </div>

              <h3 className="mt-5 text-base font-semibold text-zinc-900">
                Drop your document here
              </h3>

              <p className="mt-1 text-xs text-zinc-500">
                or choose a file from your computer
              </p>

              <label className="mt-5 inline-flex cursor-pointer items-center rounded-lg bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-zinc-800">
                Choose File
                <input
                  type="file"
                  hidden
                  accept=".pdf,.txt,.docx"
                  onChange={(e) => handleFile(e.target.files[0])}
                />
              </label>

              <p className="mt-4 text-[10px] text-zinc-400">
                PDF, DOCX or TXT · Max 20 MB
              </p>
            </div>

            {/* Selected file */}
            {file && (
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-lg shadow-sm">
                  📄
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-zinc-800">
                    {file.name}
                  </p>

                  <p className="mt-1 text-[10px] text-zinc-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setStatus("");
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-lg text-zinc-400 transition hover:bg-zinc-200 hover:text-zinc-700"
                  aria-label="Remove selected file"
                >
                  ×
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleUpload}
              disabled={loading || !file}
              className="mt-3 flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-xs font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Uploading..." : "Process Document →"}
            </button>
          </div>
        )}

        {/* Web mode */}
        {mode === "web" && <WebSource onUploaded={onUploaded} />}

        {/* Video mode */}
        {mode === "video" && <VideoSource onUploaded={onUploaded} />}

        {/* Status */}
        {status && (
          <div className="mx-1 mb-1 rounded-lg bg-zinc-50 px-3 py-2.5 text-center text-xs text-zinc-600">
            {status}
          </div>
        )}
      </div>

      {/* Supported sources */}
      <div className="mt-7 text-center">
        <p className="mb-3 text-[9px] font-semibold tracking-[0.18em] text-zinc-400">
          SUPPORTED SOURCES
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <span className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[10px] text-zinc-500">
            📄 PDF
          </span>

          <span className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[10px] text-zinc-500">
            📝 DOCX
          </span>

          <span className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[10px] text-zinc-500">
            📃 TXT
          </span>

          <span className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[10px] text-zinc-500">
            🔗 Web
          </span>

          <span className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[10px] text-zinc-500">
            🎥 Video URL
          </span>
        </div>
      </div>
    </div>
  );
}

export default SourceUploader;
