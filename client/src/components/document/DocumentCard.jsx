import {
  Check,
  FileText,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

function statusOf(progress) {
  if (progress >= 100) return "completed";
  if (progress > 0) return "in_progress";
  return "not_started";
}

function statusLabel(progress) {
  const status = statusOf(progress);

  if (status === "completed") return "Completed";
  if (status === "in_progress") return "In progress";

  return "Not started";
}

function DocumentCard({
  document,
  folders,
  editingDocumentId,
  editingDocumentName,
  setEditingDocumentId,
  setEditingDocumentName,
  handleRenameDocument,
  handleDelete,
  handleMoveToFolder,
  handleSetProgress,
  onSelect,
}) {
  const progress = document.progress || 0;
  const status = statusOf(progress);
  const isEditing = editingDocumentId === document._id;

  return (
    <div className="group relative flex min-h-[330px] flex-col overflow-hidden rounded-2xl border border-[#E6E1D3] bg-white p-6 shadow-[0_2px_6px_rgba(34,32,26,0.025)] transition-all duration-200 hover:-translate-y-1 hover:border-[#D5C8B0] hover:shadow-[0_12px_30px_rgba(34,32,26,0.08)]">
      <div className="absolute left-0 top-0 h-[3px] w-0 bg-[#E3B368] transition-all duration-300 group-hover:w-full" />

      <div className="flex items-start justify-between">
        <button
          type="button"
          onClick={() => onSelect(document)}
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3EFE4] text-[#BD7B24] transition-all duration-200 group-hover:bg-[#F0E5D1] group-hover:shadow-sm"
        >
          <FileText size={20} />
        </button>

        <button
          type="button"
          onClick={() => handleDelete(document)}
          className="rounded-lg p-2 text-[#B0A999] opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
          title="Delete source"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {isEditing ? (
        <div className="mt-6 flex items-center gap-1">
          <input
            autoFocus
            value={editingDocumentName}
            onChange={(event) =>
              setEditingDocumentName(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleRenameDocument(document);
              }

              if (event.key === "Escape") {
                setEditingDocumentId(null);
              }
            }}
            className="min-w-0 flex-1 rounded-lg border border-[#E6E1D3] px-2.5 py-2 text-sm outline-none focus:border-[#BD7B24]/50"
          />

          <button
            type="button"
            onClick={() => handleRenameDocument(document)}
            className="rounded-md p-1.5 text-[#55684A] hover:bg-[#EAF0E5]"
          >
            <Check size={14} />
          </button>

          <button
            type="button"
            onClick={() => setEditingDocumentId(null)}
            className="rounded-md p-1.5 text-[#A09A8B] hover:bg-[#F7F4EC]"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="mt-6 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelect(document)}
            className="min-w-0 flex-1 truncate text-left text-[15px] font-semibold tracking-[-0.01em] text-[#22201A] transition hover:text-[#BD7B24]"
            title={document.name}
          >
            {document.name}
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingDocumentId(document._id);
              setEditingDocumentName(document.name);
            }}
            className="shrink-0 rounded-md p-1.5 text-[#A09A8B] opacity-0 transition hover:bg-[#F7F4EC] hover:text-[#22201A] group-hover:opacity-100"
            title="Rename"
          >
            <Pencil size={13} />
          </button>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="rounded-md bg-[#F7F4EC] px-2.5 py-1.5 text-[9px] font-medium uppercase tracking-wide text-[#8A8473]">
          {document.sourceType ||
            document.contentType ||
            "Source"}
        </span>

        <select
          value={document.folder?._id || ""}
          onChange={(event) =>
            handleMoveToFolder(document, event.target.value)
          }
          className="max-w-[140px] truncate rounded-lg border border-[#E6E1D3] bg-white px-2 py-1.5 text-[9px] text-[#75705F] outline-none transition focus:border-[#BD7B24]/40"
        >
          <option value="">Unfiled</option>

          {folders.map((folder) => (
            <option key={folder._id} value={folder._id}>
              {folder.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-auto pt-7">
        <div className="rounded-xl bg-[#FAF8F2] p-4">
          <div className="flex items-center justify-between">
            <span
              className={`text-[9px] font-semibold uppercase tracking-[0.1em] ${
                status === "completed"
                  ? "text-[#55684A]"
                  : status === "in_progress"
                    ? "text-[#BD7B24]"
                    : "text-[#A09A8B]"
              }`}
            >
              {statusLabel(progress)}
            </span>

            <span className="text-[10px] font-semibold text-[#8A8473]">
              {progress}%
            </span>
          </div>

          <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-[#EDE8DC]">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                status === "completed"
                  ? "bg-[#55684A]"
                  : "bg-[#BD7B24]"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={progress}
            onChange={(event) =>
              handleSetProgress(
                document,
                Number(event.target.value),
              )
            }
            className="mt-2.5 w-full accent-[#BD7B24]"
          />
        </div>

        <div className="mt-4 flex gap-1.5">
          <button
            type="button"
            onClick={() => handleSetProgress(document, 0)}
            className={`flex-1 rounded-lg border py-2 text-[9px] transition ${
              progress === 0
                ? "border-[#D8CDB7] bg-[#F7F4EC] font-semibold text-[#BD7B24]"
                : "border-[#E6E1D3] text-[#75705F] hover:bg-[#F7F4EC]"
            }`}
          >
            Not started
          </button>

          <button
            type="button"
            onClick={() =>
              handleSetProgress(
                document,
                progress > 0 && progress < 100 ? progress : 50,
              )
            }
            className={`flex-1 rounded-lg border py-2 text-[9px] transition ${
              status === "in_progress"
                ? "border-[#D8CDB7] bg-[#F7F4EC] font-semibold text-[#BD7B24]"
                : "border-[#E6E1D3] text-[#75705F] hover:bg-[#F7F4EC]"
            }`}
          >
            In progress
          </button>

          <button
            type="button"
            onClick={() => handleSetProgress(document, 100)}
            className={`flex-1 rounded-lg border py-2 text-[9px] transition ${
              progress === 100
                ? "border-[#C7D2BE] bg-[#EEF3EA] font-semibold text-[#55684A]"
                : "border-[#E6E1D3] text-[#75705F] hover:bg-[#F7F4EC]"
            }`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default DocumentCard;