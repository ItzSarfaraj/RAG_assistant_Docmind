import { useEffect, useRef, useState } from "react";
import {
  Search as SearchIcon,
  Sparkles,
  FileText,
  BookOpen,
  LoaderCircle,
  Upload,
  ArrowUpRight,
  Brain,
  Layers3,
  Zap,
  X,
  Copy,
  Check,
  ChevronDown,
  RotateCcw,
  Eye,
  BookmarkPlus,
  BookmarkCheck,
} from "lucide-react";

import { searchDocuments } from "../services/searchService";
import { updateDocument } from "../services/documentService";
import ResearchUploader from "../components/ResearchUploader";
import DocumentPreview from "../components/DocumentPreview";

const EXAMPLES = [
  "What are the key concepts?",
  "Explain the main argument",
  "What are the important findings?",
];

const SNIPPET_COLLAPSE_LENGTH = 320;

function toRelevancePercent(score) {
  if (typeof score !== "number" || Number.isNaN(score)) {
    return null;
  }

  const clamped = Math.max(0, Math.min(1, score));

  return Math.round((1 - clamped) * 100);
}

function getFileTypeLabel(document) {
  const source = `${document?.contentType || ""} ${
    document?.originalName || document?.name || ""
  }`.toLowerCase();

  if (source.includes("pdf")) return "PDF";
  if (source.includes("word") || source.includes("docx")) return "DOCX";
  if (source.includes("text") || source.includes("txt")) return "TXT";

  return "Document";
}

function getPageLabel(result) {
  const page = result?.metadata?.page;

  if (typeof page !== "number" || Number.isNaN(page)) {
    return null;
  }

  return `Page ${page + 1}`;
}

function highlightMatches(text, query) {
  if (!query.trim()) {
    return text;
  }

  const terms = Array.from(
    new Set(
      query
        .trim()
        .split(/\s+/)
        .filter((term) => term.length > 2),
    ),
  );

  if (terms.length === 0) {
    return text;
  }

  const pattern = new RegExp(
    `(${terms
      .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|")})`,
    "gi",
  );

  const parts = text.split(pattern);

  return parts.map((part, index) =>
    terms.some((term) => term.toLowerCase() === part.toLowerCase()) ? (
      <mark
        key={index}
        className="rounded-[3px] bg-[#F5DFA8] px-0.5 py-px text-[#3D3421]"
      >
        {part}
      </mark>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}

function ResultSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-[#E2DACB] bg-white p-5">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 shrink-0 rounded-xl bg-[#F1ECE0]" />

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="h-3 w-32 rounded bg-[#F1ECE0]" />
            <div className="h-4 w-16 rounded bg-[#F1ECE0]" />
          </div>

          <div className="space-y-2">
            <div className="h-2.5 w-full rounded bg-[#F1ECE0]" />
            <div className="h-2.5 w-full rounded bg-[#F1ECE0]" />
            <div className="h-2.5 w-2/3 rounded bg-[#F1ECE0]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultCard({ result, index, query, onOpenPage }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const content = result.content || "";

  const isLong = content.length > SNIPPET_COLLAPSE_LENGTH;

  const shown =
    isLong && !expanded
      ? `${content.slice(0, SNIPPET_COLLAPSE_LENGTH)}…`
      : content;

  const relevance = toRelevancePercent(result.score);
  const fileType = getFileTypeLabel(result.document);
  const pageLabel = getPageLabel(result);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      // Clipboard access can fail silently.
    }
  };

  return (
    <div
      className="group animate-[fadeSlideIn_0.35s_ease-out_forwards] rounded-2xl border border-[#E2DACB] bg-white p-5 opacity-0 transition hover:border-[#D2C8B6] hover:shadow-[0_5px_16px_rgba(50,45,35,0.05)]"
      style={{
        animationDelay: `${Math.min(index, 8) * 45}ms`,
      }}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F5F1E8] text-[#A27A42]">
          <BookOpen size={17} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-[#29261F]">
                {result.document?.name ||
                  result.document?.originalName ||
                  "Source"}
              </p>

              <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[#9A9384]">
                <span className="rounded bg-[#F1ECE0] px-1.5 py-0.5 font-medium text-[#8A8473]">
                  {fileType}
                </span>

                {pageLabel && (
                  <button
                    type="button"
                    onClick={() => onOpenPage(result)}
                    className="rounded px-1 py-0.5 font-medium text-[#BD7B24] transition hover:bg-[#F3EFE4] hover:text-[#9E641B]"
                    title={`Open ${pageLabel}`}
                  >
                    {pageLabel}
                  </button>
                )}
              </p>
            </div>

            {relevance !== null ? (
              <div
                className="flex items-center gap-1.5"
                title={`Relevance score: ${relevance}%`}
              >
                <div className="h-1.5 w-14 overflow-hidden rounded-full bg-[#F1ECE0]">
                  <div
                    className="h-full rounded-full bg-[#BD7B24]"
                    style={{
                      width: `${relevance}%`,
                    }}
                  />
                </div>

                <span className="text-[10px] font-medium tabular-nums text-[#857D6D]">
                  {relevance}%
                </span>
              </div>
            ) : (
              <span className="rounded-md bg-[#F5F1E8] px-2 py-1 text-[10px] text-[#857D6D]">
                Distance {result.score}
              </span>
            )}
          </div>

          <p className="mt-4 whitespace-pre-wrap text-xs leading-6 text-[#5F5A4D]">
            {highlightMatches(shown, query)}
          </p>

          <div className="mt-3 flex items-center gap-3">
            {isLong && (
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                className="flex items-center gap-1 text-[10px] font-medium text-[#A27A42] hover:text-[#8A6534]"
              >
                {expanded ? "Show less" : "Show more"}

                <ChevronDown
                  size={12}
                  className={`transition-transform ${
                    expanded ? "rotate-180" : ""
                  }`}
                />
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 text-[10px] font-medium text-[#9A9384] opacity-0 transition group-hover:opacity-100 hover:text-[#5F5A4D]"
            >
              {copied ? (
                <>
                  <Check size={12} />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={12} />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const [uploadedDocument, setUploadedDocument] = useState(null);

  const [lastQuery, setLastQuery] = useState("");

  const [showPreview, setShowPreview] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);

  // Tracks the in-flight "Save to my documents" request so the button
  // can show a busy state and can't be double-clicked.
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const inputRef = useRef(null);

  // "/" focuses the search box.
  useEffect(() => {
    const onKeyDown = (event) => {
      const target = event.target;

      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        inputRef.current?.focus();
      }

      if (event.key === "Escape" && showPreview) {
        setShowPreview(false);
        setSelectedPage(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [showPreview]);

  const runSearch = async (searchTerm) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login first.");
      return;
    }

    if (!uploadedDocument?._id) {
      setError("Upload a document before searching.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSearched(true);
      setLastQuery(searchTerm);

      // IMPORTANT:
      // Search only the document uploaded on this Search page.
      const data = await searchDocuments(
        searchTerm,
        uploadedDocument._id,
        token,
      );

      setResults(data.results || []);
    } catch (err) {
      console.error(err);

      setResults([]);
      setError(err.message || "Search failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();

    if (!query.trim()) {
      setShake(true);
      inputRef.current?.focus();

      setTimeout(() => {
        setShake(false);
      }, 400);

      return;
    }

    runSearch(query.trim());
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setSearched(false);
    setError("");
    setLastQuery("");
    inputRef.current?.focus();
  };

  // Called after ResearchUploader finishes processing/indexing. Documents
  // uploaded here are indexed for this session only (saveToLibrary: false
  // in ResearchUploader) — they're searchable and previewable immediately,
  // but won't show up on the Documents page unless the user explicitly
  // saves them below.
  const handleDocumentUploaded = (document) => {
    setUploadedDocument(document);

    setResults([]);
    setSearched(false);
    setError("");
    setLastQuery("");
    setSaveError("");

    setSelectedPage(null);

    // Keep preview closed until user clicks "View document".
    setShowPreview(false);
  };

  const handleViewDocument = () => {
    if (!uploadedDocument) {
      return;
    }

    setSelectedPage(null);
    setShowPreview(true);
  };

  const handleOpenPage = (result) => {
    const page = result?.metadata?.page;

    if (typeof page !== "number" || Number.isNaN(page) || !uploadedDocument) {
      return;
    }

    setSelectedPage(page);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setSelectedPage(null);
  };

  const handleExampleSearch = (text) => {
    if (!uploadedDocument?._id) {
      setError("Upload a document before searching.");
      return;
    }

    setQuery(text);
    runSearch(text);
  };

  // Explicitly promotes the current session-only document to the user's
  // permanent library. Until this is clicked, the document stays out of
  // the Documents page (see documentController: getDocuments filters on
  // savedToLibrary).
  const handleSaveToLibrary = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setSaveError("Please login first.");
      return;
    }

    if (!uploadedDocument?._id || uploadedDocument.savedToLibrary) {
      return;
    }

    try {
      setSaving(true);
      setSaveError("");

      const data = await updateDocument(
        uploadedDocument._id,
        { savedToLibrary: true },
        token,
      );

      setUploadedDocument((current) =>
        current ? { ...current, ...data.document } : current,
      );
    } catch (err) {
      console.error(err);
      setSaveError(err.message || "Failed to save document.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative h-full overflow-hidden bg-[#F7F4EC]">
      <style>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          10%, 90% {
            transform: translateX(-1px);
          }

          20%, 80% {
            transform: translateX(2px);
          }

          30%, 50%, 70% {
            transform: translateX(-4px);
          }

          40%, 60% {
            transform: translateX(4px);
          }
        }

        .shake-once {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97);
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
          }
        }
      `}</style>

      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 lg:py-12">
          {/* Header */}

          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#E6DDCA] bg-[#F3EBDD] text-[#BD7B24] shadow-sm">
              <SearchIcon size={23} strokeWidth={1.8} />
            </div>

            <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-[#E5DDCE] bg-white px-3 py-1 text-[10px] font-medium text-[#887F6E]">
              <Sparkles size={11} className="text-[#BD7B24]" />
              AI-powered research search
            </div>

            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-[#22201A]">
              Search your document
            </h1>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#817B6D]">
              Upload a document and find the most relevant passages using
              semantic search.
            </p>
          </div>

          {/* Search Box */}

          <form
            onSubmit={handleSearch}
            role="search"
            className="mx-auto mt-8 max-w-4xl"
          >
            <div
              className={`flex items-center rounded-2xl border bg-white p-1.5 shadow-[0_3px_12px_rgba(50,45,35,0.06)] transition focus-within:border-[#C6BBA6] ${
                shake ? "shake-once border-[#D9A79A]" : "border-[#DCD4C4]"
              }`}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center text-[#9B9484]">
                <SearchIcon size={19} />
              </div>

              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    handleClear();
                  }
                }}
                placeholder={
                  uploadedDocument
                    ? `Search within ${
                        uploadedDocument.name ||
                        uploadedDocument.originalName ||
                        "this document"
                      }...`
                    : "Upload a document first..."
                }
                aria-label="Search your document"
                disabled={!uploadedDocument}
                className="min-w-0 flex-1 bg-transparent px-1 text-sm text-[#28251F] outline-none placeholder:text-[#AAA394] disabled:cursor-not-allowed disabled:opacity-60"
              />

              {query && !loading && (
                <button
                  type="button"
                  onClick={handleClear}
                  aria-label="Clear search"
                  className="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#AAA394] transition hover:bg-[#F1ECE0] hover:text-[#6B6555]"
                >
                  <X size={15} />
                </button>
              )}

              <button
                type="submit"
                disabled={loading || !uploadedDocument}
                className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-[#25231E] px-5 text-xs font-semibold text-white transition hover:bg-[#3A372F] disabled:cursor-not-allowed disabled:bg-[#C8C6C1]"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={15} className="animate-spin" />
                    Searching
                  </>
                ) : (
                  <>
                    Search
                    <ArrowUpRight size={14} />
                  </>
                )}
              </button>
            </div>

            {!searched && (
              <p className="mt-2 text-center text-[10px] text-[#AAA394]">
                Press{" "}
                <kbd className="rounded border border-[#E1D9CA] bg-[#FBFAF7] px-1 py-0.5 font-sans">
                  /
                </kbd>{" "}
                to jump to search
              </p>
            )}
          </form>

          {/* Example Searches */}

          {!searched && uploadedDocument && (
            <div className="mx-auto mt-4 flex max-w-4xl flex-wrap items-center justify-center gap-2">
              <span className="mr-1 text-[10px] text-[#9A9384]">Try:</span>

              {EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => handleExampleSearch(example)}
                  className="rounded-full border border-[#E1D9CA] bg-[#FBFAF7] px-3 py-1.5 text-[10px] text-[#756E61] transition hover:border-[#CFC4B1] hover:bg-white hover:text-[#403B33]"
                >
                  {example}
                </button>
              ))}
            </div>
          )}

          {/* Uploaded Document */}

          {uploadedDocument && (
            <div className="mx-auto mt-5 max-w-4xl rounded-xl border border-[#D7E3D2] bg-[#F3F8F1] px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E3EFDF] text-[#55784D]">
                    <FileText size={15} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-[#71806D]">
                      Searching only this document
                    </p>

                    <p className="mt-0.5 truncate text-xs font-semibold text-[#496642]">
                      {uploadedDocument.name ||
                        uploadedDocument.originalName ||
                        "Your document"}
                    </p>

                    {!uploadedDocument.savedToLibrary && (
                      <p className="mt-0.5 text-[9px] text-[#8A9885]">
                        Only kept for this session unless you save it
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveToLibrary}
                    disabled={saving || uploadedDocument.savedToLibrary}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[10px] font-semibold transition disabled:cursor-not-allowed ${
                      uploadedDocument.savedToLibrary
                        ? "border-[#C9DCC4] bg-[#EAF3E7] text-[#55784D] opacity-90"
                        : "border-[#C9DCC4] bg-white text-[#55784D] hover:bg-[#EAF3E7] disabled:opacity-60"
                    }`}
                  >
                    {uploadedDocument.savedToLibrary ? (
                      <>
                        <BookmarkCheck size={13} />
                        Saved to documents
                      </>
                    ) : saving ? (
                      <>
                        <LoaderCircle size={13} className="animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <BookmarkPlus size={13} />
                        Save to my documents
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleViewDocument}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#C9DCC4] bg-white px-3 py-2 text-[10px] font-semibold text-[#55784D] transition hover:bg-[#EAF3E7]"
                  >
                    <Eye size={13} />
                    View document
                  </button>
                </div>
              </div>

              {saveError && (
                <p className="mt-2 text-[10px] text-[#9B4C3D]">{saveError}</p>
              )}
            </div>
          )}

          {/* Error */}

          {error && (
            <div
              role="alert"
              className="mx-auto mt-4 flex max-w-4xl items-center justify-between gap-3 rounded-xl border border-[#E8CFC8] bg-[#FBF1EE] px-4 py-3 text-xs text-[#9B4C3D]"
            >
              <span>{error}</span>

              {lastQuery && (
                <button
                  type="button"
                  onClick={() => runSearch(lastQuery)}
                  className="flex shrink-0 items-center gap-1 rounded-lg border border-[#E8CFC8] bg-white px-2.5 py-1 text-[10px] font-medium text-[#9B4C3D] transition hover:bg-[#FBF1EE]"
                >
                  <RotateCcw size={11} />
                  Retry
                </button>
              )}
            </div>
          )}

          {/* Initial Content */}

          {!searched && !loading && (
            <div className="mx-auto mt-8 max-w-4xl space-y-4">
              {/* Semantic Search */}

              <div className="overflow-hidden rounded-2xl border border-[#E2DACB] bg-white shadow-[0_2px_10px_rgba(50,45,35,0.03)]">
                <div className="border-b border-[#EEE8DC] px-6 py-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4EBDD] text-[#BD7B24]">
                      <Brain size={18} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold text-[#28251F]">
                          Search by meaning
                        </h2>

                        <span className="rounded-full bg-[#F5F0E6] px-2 py-0.5 text-[9px] font-medium text-[#9A7442]">
                          Semantic
                        </span>
                      </div>

                      <p className="mt-1.5 max-w-2xl text-xs leading-5 text-[#817A6C]">
                        DocMind understands the meaning behind your query and
                        finds relevant passages from the document you uploaded.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 divide-y divide-[#EEE8DC] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                  <div className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Zap size={14} className="text-[#BD7B24]" />

                      <p className="text-[11px] font-semibold text-[#403B33]">
                        Meaning-aware
                      </p>
                    </div>

                    <p className="mt-1 text-[10px] leading-4 text-[#918A7C]">
                      Finds concepts, not just matching words.
                    </p>
                  </div>

                  <div className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Layers3 size={14} className="text-[#BD7B24]" />

                      <p className="text-[11px] font-semibold text-[#403B33]">
                        Document-focused
                      </p>
                    </div>

                    <p className="mt-1 text-[10px] leading-4 text-[#918A7C]">
                      Searches only your uploaded document.
                    </p>
                  </div>

                  <div className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <SearchIcon size={14} className="text-[#BD7B24]" />

                      <p className="text-[11px] font-semibold text-[#403B33]">
                        Relevant passages
                      </p>
                    </div>

                    <p className="mt-1 text-[10px] leading-4 text-[#918A7C]">
                      Returns the most relevant source content.
                    </p>
                  </div>
                </div>
              </div>

              {/* Add Document */}

              <div className="rounded-2xl border border-[#E2DACB] bg-white p-6 shadow-[0_2px_10px_rgba(50,45,35,0.03)]">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4EBDD] text-[#BD7B24]">
                    <Upload size={17} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-semibold text-[#28251F]">
                      Add document to search
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-[#817A6C]">
                      Upload a paper or document and DocMind will process it
                      into a searchable knowledge base for this session. Save
                      it afterward if you want to keep it in your Documents
                      library.
                    </p>

                    <div className="mt-5">
                      <ResearchUploader
                        onUploaded={handleDocumentUploaded}
                        compact
                      />
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-[10px] text-[#9B9486]">
                      <span>PDF</span>
                      <span>DOCX</span>
                      <span>TXT</span>
                      <span className="text-[#B5AE9F]">•</span>
                      <span>Automatically indexed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading */}

          {loading && (
            <div
              className="mx-auto mt-8 max-w-4xl space-y-3"
              aria-live="polite"
              aria-busy="true"
            >
              <p className="sr-only">Searching your document</p>

              <ResultSkeleton />
              <ResultSkeleton />
              <ResultSkeleton />
            </div>
          )}

          {/* Results */}

          {searched && !loading && (
            <div className="mx-auto mt-8 max-w-4xl" aria-live="polite">
              <div className="mb-5 flex items-end justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#28251F]">
                    Search results
                  </p>

                  <p className="mt-1 text-xs text-[#8D8678]">
                    {results.length} relevant{" "}
                    {results.length === 1 ? "passage" : "passages"} in{" "}
                    {uploadedDocument?.name ||
                      uploadedDocument?.originalName ||
                      "this document"}
                  </p>
                </div>

                {lastQuery && (
                  <div className="hidden max-w-xs truncate rounded-lg bg-[#F1EDE3] px-3 py-1.5 text-[10px] text-[#777062] sm:block">
                    "{lastQuery}"
                  </div>
                )}
              </div>

              {results.length === 0 ? (
                <div className="rounded-2xl border border-[#E2DACB] bg-white px-6 py-12 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#F4F0E6] text-[#A39B8A]">
                    <SearchIcon size={18} />
                  </div>

                  <p className="mt-4 text-sm font-semibold text-[#28251F]">
                    No relevant results
                  </p>

                  <p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-[#8B8476]">
                    Nothing relevant was found in this document. Try a different
                    query.
                  </p>

                  <button
                    type="button"
                    onClick={handleViewDocument}
                    className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#25231E] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#3A372F]"
                  >
                    <Eye size={14} />
                    View document
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((result, index) => (
                    <ResultCard
                      key={`${result.document_id}-${result.metadata?.page}-${index}`}
                      result={result}
                      index={index}
                      query={lastQuery}
                      onOpenPage={handleOpenPage}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          DOCUMENT PREVIEW MODAL
          ===================================================== */}

      {showPreview && uploadedDocument && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleClosePreview();
            }
          }}
        >
          <div className="relative flex h-[92vh] w-full max-w-[1000px] items-center justify-center overflow-hidden rounded-2xl bg-white shadow-2xl">
            <DocumentPreview
              document={uploadedDocument}
              page={selectedPage}
              onClose={handleClosePreview}
              fullscreen
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Search;