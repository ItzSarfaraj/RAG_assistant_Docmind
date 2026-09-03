import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  FileText,
  Layers3,
  LoaderCircle,
  Search,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getDocuments, uploadDocument } from "../services/documentService";
import { generateFlashcards } from "../services/flashcardService";

function sourceIcon(document) {
  if (document.sourceType === "video") return "🎥";
  if (document.sourceType === "web") return "🔗";
  return null;
}

function CreateFlashcards() {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [search, setSearch] = useState("");

  const [title, setTitle] = useState("");
  const [titleTouched, setTitleTouched] = useState(false);
  const [count, setCount] = useState(15);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const busy = uploading || generating;

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Please login first.");

        const data = await getDocuments(token);
        setDocuments(data.documents || []);
      } catch (error) {
        console.error("Failed to load sources:", error);
        setError(error.message || "Failed to load sources.");
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, []);

  useEffect(() => {
    if (titleTouched) return;

    if (selectedDocuments.length === 1) {
      const document = documents.find((item) => item._id === selectedDocuments[0]);
      if (document?.name) {
        setTitle(`${document.name} — Flashcards`);
        return;
      }
    }

    setTitle("Flashcard Set");
  }, [selectedDocuments, documents, titleTouched]);

  const filteredDocuments = useMemo(() => {
    if (!search.trim()) return documents;
    return documents.filter((document) =>
      document.name?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [documents, search]);

  const toggleDocument = (id) => {
    setSelectedDocuments((previous) =>
      previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id],
    );
  };

  const selectAllVisible = () => {
    setSelectedDocuments((previous) => {
      const visibleIds = filteredDocuments.map((document) => document._id);
      return Array.from(new Set([...previous, ...visibleIds]));
    });
  };

  const clearSelection = () => setSelectedDocuments([]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setError("");
  };

  const handleUpload = async () => {
    if (!file) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login first.");
      return;
    }

    try {
      setUploading(true);
      setError("");

      const result = await uploadDocument(file, token);
      const document = result.document;

      if (!document?._id) {
        throw new Error("Document was not processed correctly.");
      }

      setDocuments((previous) => [document, ...previous]);
      setSelectedDocuments((previous) =>
        previous.includes(document._id) ? previous : [...previous, document._id],
      );

      setFile(null);
      setFileInputKey((key) => key + 1);
    } catch (error) {
      console.error("Document upload error:", error);
      setError(error.message || "Failed to process document.");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFileInputKey((key) => key + 1);
  };

  const handleGenerate = async () => {
    if (selectedDocuments.length === 0) {
      setError("Select at least one source or upload a document.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login first.");
      return;
    }

    try {
      setGenerating(true);
      setError("");

      const result = await generateFlashcards(
        { documentIds: selectedDocuments, title: title.trim() || "Flashcard Set", count },
        token,
      );

      if (!result?.flashcardSet?._id) {
        throw new Error("Flashcard set was not created.");
      }

      navigate(`/flashcards/${result.flashcardSet._id}`);
    } catch (error) {
      console.error("Flashcard generation error:", error);
      setError(error.message || "Failed to generate flashcards.");
    } finally {
      setGenerating(false);
    }
  };

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
    <div className="h-full w-full overflow-x-hidden overflow-y-auto bg-[#F7F4EC]">
      <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/ai-tools")}
            className="flex items-center gap-2 text-xs text-[#75705F] transition hover:text-[#22201A]"
          >
            <ArrowLeft size={14} />
            AI Tools
          </button>
        </div>

        <div className="mt-6 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F3EFE4] text-[#BD7B24]">
            <Layers3 size={20} />
          </div>

          <div>
            <h1 className="text-xl font-semibold text-[#22201A]">Create Flashcards</h1>
            <p className="mt-1 text-xs text-[#8A8473]">
              Turn your research sources into focused study cards.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-6 flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-600">
            <span>{error}</span>
            <button type="button" onClick={() => setError("")} className="shrink-0">
              <X size={13} />
            </button>
          </div>
        )}

        <div className="mt-7 grid w-full min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Sources */}
          <div className="min-w-0 rounded-2xl border border-[#E6E1D3] bg-white p-5 sm:p-6">
            <div>
              <h2 className="text-sm font-semibold text-[#22201A]">Choose your sources</h2>
              <p className="mt-1 text-[10px] text-[#8A8473]">
                Select existing sources or upload a new document.
              </p>
            </div>

            {/* Upload */}
            <div className="mt-5 w-full">
              <label
                htmlFor="flashcard-file"
                className={`box-border flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-[#D8CDB7] bg-[#FBF9F3] px-5 py-7 text-center transition ${
                  busy
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer hover:border-[#BD7B24] hover:bg-[#F7F4EC]"
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3EFE4] text-[#BD7B24]">
                  <Upload size={17} />
                </div>

                <p className="mt-3 text-xs font-semibold text-[#22201A]">Upload a new source</p>
                <p className="mt-1 text-[9px] text-[#8A8473]">PDF, DOCX, or TXT</p>

                <input
                  key={fileInputKey}
                  id="flashcard-file"
                  type="file"
                  accept=".pdf,.txt,.docx"
                  onChange={handleFileChange}
                  disabled={busy}
                  className="hidden"
                />
              </label>

              {file && (
                <div className="mt-3 flex w-full items-center gap-3 rounded-lg border border-[#E6E1D3] bg-[#F7F4EC] p-3">
                  <FileText size={16} className="shrink-0 text-[#BD7B24]" />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-medium text-[#22201A]">{file.name}</p>
                    <p className="mt-0.5 text-[8px] text-[#8A8473]">Ready to process</p>
                  </div>

                  <button
                    type="button"
                    onClick={removeFile}
                    disabled={uploading}
                    className="shrink-0 rounded-md p-1 text-[#A09A8B] hover:bg-white hover:text-[#22201A] disabled:opacity-40"
                  >
                    <X size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploading}
                    className="shrink-0 rounded-lg bg-[#22201A] px-3 py-2 text-[9px] font-semibold text-white hover:bg-[#3A362C] disabled:opacity-50"
                  >
                    {uploading ? "Processing..." : "Process"}
                  </button>
                </div>
              )}
            </div>

            {/* Existing sources */}
            <div className="mt-6 min-w-0">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-semibold text-[#22201A]">Existing sources</p>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-[9px] text-[#A09A8B]">
                    {selectedDocuments.length} selected
                  </span>

                  {documents.length > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={selectAllVisible}
                        className="text-[9px] font-medium text-[#BD7B24] hover:text-[#8C5A19]"
                      >
                        Select all
                      </button>
                      {selectedDocuments.length > 0 && (
                        <button
                          type="button"
                          onClick={clearSelection}
                          className="text-[9px] font-medium text-[#75705F] hover:text-[#22201A]"
                        >
                          Clear
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {documents.length > 4 && (
                <div className="mt-3 flex w-full items-center gap-2 rounded-lg border border-[#E6E1D3] bg-[#F7F4EC] px-3 py-2">
                  <Search size={13} className="shrink-0 text-[#A09A8B]" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search sources..."
                    className="min-w-0 flex-1 bg-transparent text-[11px] text-[#22201A] outline-none placeholder:text-[#A09A8B]"
                  />
                </div>
              )}

              {documents.length === 0 ? (
                <div className="mt-3 rounded-lg border border-[#E6E1D3] bg-[#F7F4EC] px-4 py-6 text-center">
                  <p className="text-[10px] text-[#8A8473]">No existing sources.</p>
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="mt-3 rounded-lg border border-[#E6E1D3] bg-[#F7F4EC] px-4 py-6 text-center">
                  <p className="text-[10px] text-[#8A8473]">No sources match "{search}".</p>
                </div>
              ) : (
                <div className="mt-3 h-[240px] w-full overflow-y-auto rounded-xl border border-[#E6E1D3]">
                  <div className="divide-y divide-[#E6E1D3]">
                    {filteredDocuments.map((document) => {
                      const selected = selectedDocuments.includes(document._id);
                      const emoji = sourceIcon(document);

                      return (
                        <button
                          key={document._id}
                          type="button"
                          onClick={() => toggleDocument(document._id)}
                          className={`flex w-full items-center gap-2.5 px-3 py-2 text-left transition ${
                            selected ? "bg-[#F3EFE4]" : "hover:bg-[#F7F4EC]"
                          }`}
                        >
                          <div
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] ${
                              selected ? "bg-white text-[#BD7B24]" : "bg-[#F3EFE4] text-[#BD7B24]"
                            }`}
                          >
                            {emoji || <FileText size={12} />}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[10px] font-medium leading-tight text-[#22201A]">
                              {document.name}
                            </p>
                            <p className="text-[8px] uppercase tracking-wide text-[#A09A8B]">
                              {document.sourceType || document.contentType || "Source"}
                            </p>
                          </div>

                          <div
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                              selected ? "border-[#BD7B24] bg-[#BD7B24] text-white" : "border-[#D8CDB7]"
                            }`}
                          >
                            {selected && <Check size={10} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="h-fit min-w-0 rounded-2xl border border-[#E6E1D3] bg-white p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-[#22201A]">Flashcard settings</h2>

            <div className="mt-5">
              <label className="text-[10px] font-semibold text-[#22201A]">Set title</label>
              <input
                type="text"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setTitleTouched(true);
                }}
                placeholder="Flashcard Set"
                maxLength={120}
                className="mt-2 w-full rounded-lg border border-[#E6E1D3] px-3 py-2.5 text-xs text-[#22201A] outline-none focus:border-[#BD7B24]"
              />
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-[#22201A]">Number of cards</p>
                  <p className="mt-1 text-[9px] text-[#8A8473]">Choose between 5 and 50.</p>
                </div>
                <span className="text-lg font-semibold text-[#BD7B24]">{count}</span>
              </div>

              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={count}
                onChange={(event) => setCount(Number(event.target.value))}
                className="mt-4 w-full accent-[#BD7B24]"
              />

              <div className="mt-1 flex justify-between text-[8px] text-[#A09A8B]">
                <span>5</span>
                <span>50</span>
              </div>
            </div>

            <div className="mt-6 rounded-lg bg-[#F7F4EC] p-3">
              <p className="text-[9px] font-semibold text-[#22201A]">Selected sources</p>
              <p className="mt-1 text-[9px] text-[#8A8473]">
                {selectedDocuments.length === 0
                  ? "No sources selected."
                  : `${selectedDocuments.length} source${selectedDocuments.length > 1 ? "s" : ""} will be used.`}
              </p>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={busy || selectedDocuments.length === 0}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#22201A] px-4 py-3 text-xs font-semibold text-white transition hover:bg-[#3A362C] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generating ? (
                <>
                  <LoaderCircle size={14} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Generate Flashcards
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateFlashcards;