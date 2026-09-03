import { useEffect, useRef, useState } from "react";
import {
  Search as SearchIcon,
  X,
  LoaderCircle,
  ChevronDown,
} from "lucide-react";

import { searchDocuments } from "../../services/searchService";

const SNIPPET_COLLAPSE_LENGTH = 260;

// Turn vector distance into a friendlier 0-100 relevance readout.
// This is only a visual approximation.
function toRelevancePercent(score) {
  if (typeof score !== "number" || Number.isNaN(score)) return null;

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

// PDF loaders commonly attach a 0-indexed "page" field.
// Convert it to the user-facing 1-indexed page number.
function getPageLabel(result) {
  const page = result?.metadata?.page;

  if (typeof page !== "number" || Number.isNaN(page)) {
    return null;
  }

  return `Page ${page + 1}`;
}

function ResultRow({ result, onOpen }) {
  const [expanded, setExpanded] = useState(false);

  const content = result.content || "";
  const isLong = content.length > SNIPPET_COLLAPSE_LENGTH;

  const shown =
    isLong && !expanded
      ? `${content.slice(0, SNIPPET_COLLAPSE_LENGTH)}…`
      : content;

  const relevance = toRelevancePercent(result.score);
  const fileType = getFileTypeLabel(result.document);
  const pageLabel = getPageLabel(result);

  return (
    <div className="rounded-xl border border-[#E6E1D3] bg-white p-4 transition hover:border-[#D4C5AA]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-[#22201A]">
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
                onClick={() => onOpen(result)}
                className="rounded px-1 py-0.5 font-medium text-[#BD7B24] transition hover:bg-[#F3EFE4] hover:text-[#9E641B]"
                title={`Open ${pageLabel}`}
              >
                {pageLabel}
              </button>
            )}
          </p>
        </div>

        {relevance !== null && (
          <div
            className="flex items-center gap-1.5"
            title={`Relevance: ${relevance}%`}
          >
            <div className="h-1.5 w-12 overflow-hidden rounded-full bg-[#F1ECE0]">
              <div
                className="h-full rounded-full bg-[#BD7B24]"
                style={{ width: `${relevance}%` }}
              />
            </div>

            <span className="text-[10px] font-medium tabular-nums text-[#857D6D]">
              {relevance}%
            </span>
          </div>
        )}
      </div>

      <p className="mt-2.5 whitespace-pre-wrap text-xs leading-6 text-[#5F5A4D]">
        {shown}
      </p>

      <div className="mt-2.5 flex items-center gap-4">
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
          onClick={() => onOpen(result)}
          className="ml-auto text-[10px] font-semibold text-[#BD7B24] hover:text-[#9E641B]"
        >
          Open in chat →
        </button>
      </div>
    </div>
  );
}

function DocumentSearchModal({
  document,
  onOpenDocument,
  onClose,
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runSearch = async (event) => {
    event.preventDefault();

    const term = query.trim();

    if (!term) return;

    if (!document?._id) {
      setError("No document selected.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSearched(true);

      const data = await searchDocuments(
        term,
        document._id,
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

  const handleOpen = (result) => {
    onOpenDocument(document, result);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 px-4 pt-[8vh]"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-[#F7F4EC] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <form
          onSubmit={runSearch}
          className="flex items-center gap-2 border-b border-[#E6E1D3] bg-white p-3"
        >
          <SearchIcon
            size={16}
            className="ml-1 shrink-0 text-[#9B9484]"
          />

          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={
              document
                ? `Search within ${document.name || "this document"}…`
                : "Search within this document…"
            }
            className="min-w-0 flex-1 bg-transparent text-sm text-[#28251F] outline-none placeholder:text-[#AAA394]"
          />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#AAA394] transition hover:bg-[#F1ECE0] hover:text-[#6B6555]"
          >
            <X size={15} />
          </button>
        </form>

        <div className="max-h-[calc(80vh-56px)] overflow-y-auto p-4">
          {error && (
            <div className="mb-3 rounded-lg border border-[#E8CFC8] bg-[#FBF1EE] px-3 py-2.5 text-xs text-[#9B4C3D]">
              {error}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-2 py-10 text-xs text-[#8A8473]">
              <LoaderCircle size={15} className="animate-spin" />
              Searching this document…
            </div>
          )}

          {!loading && !searched && (
            <div className="py-10 text-center">
              <p className="text-xs font-medium text-[#5F5A4D]">
                Search within this document
              </p>

              <p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-[#8B8476]">
                Only the currently selected document will be searched.
              </p>
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-sm font-semibold text-[#28251F]">
                No relevant results
              </p>

              <p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-[#8B8476]">
                Nothing relevant was found in this document. Try a
                different query.
              </p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-2.5">
              {results.map((result, index) => (
                <ResultRow
                  key={`${result.document_id}-${result.metadata?.page}-${index}`}
                  result={result}
                  onOpen={handleOpen}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DocumentSearchModal;