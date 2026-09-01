import { useState } from "react";
import { uploadDocument } from "../services/documentService";

function SourceUploader({ onUploaded }) {
  const [mode, setMode] = useState("file");

  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");

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

  const handleUrlSubmit = async () => {
    if (!url.trim()) {
      setStatus("Please enter a URL.");
      return;
    }

    try {
      new URL(url);

      setLoading(true);
      setStatus("URL processing will be connected next.");
    } catch {
      setStatus("Please enter a valid URL.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-[92%] max-w-4xl px-0 py-12 sm:py-16">
      {/* =================================
                HEADING
            ================================= */}

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

      {/* =================================
                SOURCE CARD
            ================================= */}

      <div className="rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm">
        {/* =================================
                    SOURCE TABS
                ================================= */}

        <div className="grid grid-cols-3 gap-1 rounded-xl bg-zinc-100 p-1">
          {/* File */}

          <button
            onClick={() => {
              setMode("file");
              setStatus("");
            }}
            className={`
                            rounded-lg px-3 py-2.5
                            text-xs font-semibold
                            transition
                            ${
                              mode === "file"
                                ? "bg-white text-zinc-900 shadow-sm"
                                : "text-zinc-500 hover:text-zinc-800"
                            }
                        `}
          >
            <span className="mr-1">📄</span>
            File
          </button>

          {/* Web */}

          <button
            onClick={() => {
              setMode("web");
              setStatus("");
            }}
            className={`
                            rounded-lg px-3 py-2.5
                            text-xs font-semibold
                            transition
                            ${
                              mode === "web"
                                ? "bg-white text-zinc-900 shadow-sm"
                                : "text-zinc-500 hover:text-zinc-800"
                            }
                        `}
          >
            <span className="mr-1">🔗</span>
            Web
          </button>

          {/* Video */}

          <button
            onClick={() => {
              setMode("video");
              setStatus("");
            }}
            className={`
                            rounded-lg px-3 py-2.5
                            text-xs font-semibold
                            transition
                            ${
                              mode === "video"
                                ? "bg-white text-zinc-900 shadow-sm"
                                : "text-zinc-500 hover:text-zinc-800"
                            }
                        `}
          >
            <span className="mr-1">🎥</span>
            Video
          </button>
        </div>

        {/* =================================
                    FILE MODE
                ================================= */}

        {mode === "file" && (
          <div className="p-1">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`
                                mt-2 rounded-xl
                                border-2 border-dashed
                                px-5 py-14
                                text-center
                                transition
                                ${
                                  dragging
                                    ? "border-zinc-900 bg-zinc-50"
                                    : "border-zinc-200 hover:border-zinc-300"
                                }
                            `}
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

            {/* Selected File */}

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
                >
                  ×
                </button>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className="
                                mt-3 flex w-full
                                items-center justify-center
                                rounded-xl bg-zinc-900
                                px-4 py-3
                                text-xs font-semibold
                                text-white
                                transition
                                hover:bg-zinc-800
                                disabled:cursor-not-allowed
                                disabled:opacity-40
                            "
            >
              {loading ? "Uploading..." : "Process Document →"}
            </button>
          </div>
        )}

        {/* =================================
                    WEB MODE
                ================================= */}

        {mode === "web" && (
          <div className="px-4 py-14 text-center sm:px-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-2xl">
              🔗
            </div>

            <h3 className="mt-5 text-base font-semibold text-zinc-900">
              Add a webpage
            </h3>

            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-zinc-500">
              Paste the URL of an article, documentation page, or research
              paper.
            </p>

            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              className="
                                mt-6 w-full
                                rounded-xl
                                border border-zinc-200
                                bg-zinc-50
                                px-4 py-3
                                text-xs text-zinc-900
                                outline-none
                                placeholder:text-zinc-400
                                focus:border-zinc-400
                                focus:bg-white
                            "
            />

            <button
              onClick={handleUrlSubmit}
              disabled={!url || loading}
              className="
                                mt-3 w-full
                                rounded-xl
                                bg-zinc-900
                                px-4 py-3
                                text-xs font-semibold
                                text-white
                                transition
                                hover:bg-zinc-800
                                disabled:cursor-not-allowed
                                disabled:opacity-40
                            "
            >
              Process Webpage →
            </button>
          </div>
        )}

        {/* =================================
                    VIDEO MODE
                ================================= */}

        {mode === "video" && (
          <div className="px-4 py-14 text-center sm:px-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-2xl">
              🎥
            </div>

            <h3 className="mt-5 text-base font-semibold text-zinc-900">
              Add a video
            </h3>

            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-zinc-500">
              Paste a video URL and DocMind will use its transcript as a
              knowledge source.
            </p>

            <div className="mt-6 flex items-center gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="
                                    min-w-0 flex-1
                                    rounded-xl
                                    border border-zinc-200
                                    bg-zinc-50
                                    px-4 py-3
                                    text-xs text-zinc-900
                                    outline-none
                                    placeholder:text-zinc-400
                                    focus:border-zinc-400
                                    focus:bg-white
                                "
              />
            </div>

            <button
              onClick={handleUrlSubmit}
              disabled={!url || loading}
              className="
                                mt-3 w-full
                                rounded-xl
                                bg-zinc-900
                                px-4 py-3
                                text-xs font-semibold
                                text-white
                                transition
                                hover:bg-zinc-800
                                disabled:cursor-not-allowed
                                disabled:opacity-40
                            "
            >
              {loading ? "Processing..." : "Process Video →"}
            </button>

            <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-left">
              <p className="text-[10px] font-semibold text-zinc-600">
                How it works
              </p>

              <div className="mt-2 space-y-1.5 text-[10px] text-zinc-400">
                <p>1. Video transcript is extracted</p>

                <p>2. Transcript is split into chunks</p>

                <p>3. Chunks are converted into embeddings</p>

                <p>4. You can chat with the video</p>
              </div>
            </div>
          </div>
        )}

        {/* STATUS */}

        {status && (
          <div className="mx-1 mb-1 rounded-lg bg-zinc-50 px-3 py-2.5 text-center text-xs text-zinc-600">
            {status}
          </div>
        )}
      </div>

      {/* =================================
                SUPPORTED SOURCES
            ================================= */}

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
