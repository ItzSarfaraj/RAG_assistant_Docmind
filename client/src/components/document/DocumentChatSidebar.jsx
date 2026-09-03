import { FileText, Trash2 } from "lucide-react";

function DocumentChatSidebar({
  documents,
  selectedDocument,
  onSelect,
  onBack,
  onDelete,
}) {
  return (
    <aside className="hidden w-72 shrink-0 flex-col overflow-hidden border-r border-[#E6E1D3] bg-white sm:flex">
      <div className="flex items-center gap-2 border-b border-[#E6E1D3] px-4 py-3.5">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md p-1.5 text-[#75705F] transition hover:bg-[#F7F4EC] hover:text-[#22201A]"
          title="Back to all sources"
        >
          <FileText size={15} />
        </button>

        <p className="text-xs font-semibold text-[#22201A]">
          Sources
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {documents.map((document) => {
          const isActive = document._id === selectedDocument._id;

          return (
            <div
              key={document._id}
              className={`group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 transition ${
                isActive ? "bg-[#F3EFE4]" : "hover:bg-[#F7F4EC]"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-[#BD7B24]" />
              )}

              <button
                type="button"
                onClick={() => onSelect(document)}
                className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F3EFE4] text-[#BD7B24]">
                  <FileText size={15} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-[#22201A]">
                    {document.name}
                  </p>

                  <p className="mt-0.5 truncate text-[9px] uppercase tracking-wide text-[#A09A8B]">
                    {document.sourceType ||
                      document.contentType ||
                      "Source"}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onDelete(document)}
                className="shrink-0 rounded-md p-1 text-[#A09A8B] opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                title="Delete source"
              >
                <Trash2 size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

export default DocumentChatSidebar;