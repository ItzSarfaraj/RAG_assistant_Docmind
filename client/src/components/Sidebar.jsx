import { useState } from "react";
import {
  Mark,
  MenuIcon,
  CloseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  TrashIcon,
  FileIcon,
  LockIcon,
} from "./Icons";

function Sidebar({
  documents,
  selectedDocument,
  onSelectDocument,
  onNewDocument,
  onDeleteDocument,
  isOpen = false,
  onClose = () => {},
}) {
  const [collapsed, setCollapsed] = useState(false);

  const handleSelect = (document) => {
    onSelectDocument(document);
    onClose(); // closes the mobile drawer after picking a document
  };

  const handleNew = () => {
    onNewDocument();
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          "z-50 flex h-full flex-col bg-[#16150F] text-[#F3EFE4]",
          "fixed inset-y-0 left-0 w-72 transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:static md:z-auto md:translate-x-0 md:transition-[width] md:duration-300",
          collapsed ? "md:w-[68px]" : "md:w-64",
        ].join(" ")}
      >
        {/* Brand row */}
        <div
          className={`flex items-center justify-between ${collapsed ? "px-3" : "px-4"} pb-5 pt-5`}
        >
          <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2.5"}`}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#F3EFE4]/12 bg-[#F3EFE4]/[0.06] text-lg text-[#E3B368]">
              <Mark />
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-[Fraunces] text-[15px] leading-tight">DocMind</h2>
                <p className="text-[10px] text-[#F3EFE4]/40">Document research</p>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-[#F3EFE4]/50 hover:bg-[#F3EFE4]/[0.06] hover:text-[#F3EFE4] md:hidden"
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Desktop collapse toggle */}
        <div className={`hidden md:block ${collapsed ? "px-2" : "px-3"} mb-2`}>
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[#F3EFE4]/45 transition hover:bg-[#F3EFE4]/[0.06] hover:text-[#F3EFE4]/80 ${collapsed ? "justify-center" : ""}`}
          >
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            {!collapsed && <span className="text-xs">Collapse</span>}
          </button>
        </div>

        {/* New source */}
        <div className={`${collapsed ? "px-2" : "px-3"}`}>
          <button
            type="button"
            onClick={handleNew}
            title="New source"
            className={`flex w-full items-center gap-2.5 rounded-lg border border-[#F3EFE4]/12 bg-[#F3EFE4]/[0.05] px-3 py-2.5 text-sm font-medium text-[#F3EFE4]/90 transition hover:border-[#E3B368]/30 hover:bg-[#E3B368]/[0.08] hover:text-[#E3B368] ${collapsed ? "justify-center" : ""}`}
          >
            <PlusIcon />
            {!collapsed && <span>New source</span>}
          </button>
        </div>

        {/* Document list */}
        <div className="mt-6 flex-1 overflow-y-auto px-2.5">
          {!collapsed && (
            <div className="mb-2 px-2 text-[11px] font-medium text-[#F3EFE4]/35">
              Your sources
            </div>
          )}

          {documents.length === 0 ? (
            !collapsed && (
              <div className="px-2 py-4 text-xs text-[#F3EFE4]/30">
                No documents yet
              </div>
            )
          ) : (
            <div className="space-y-1">
              {documents.map((document) => {
                const isSelected = selectedDocument?._id === document._id;

                return (
                  <div
                    key={document._id}
                    className={`group relative flex items-center gap-1 rounded-lg transition ${
                      isSelected
                        ? "bg-[#F3EFE4]/[0.08]"
                        : "hover:bg-[#F3EFE4]/[0.04]"
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-[#E3B368]" />
                    )}

                    <button
                      type="button"
                      onClick={() => handleSelect(document)}
                      title={document.name}
                      className={`flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2.5 py-2.5 text-left ${
                        collapsed ? "justify-center" : ""
                      } ${isSelected ? "text-[#F3EFE4]" : "text-[#F3EFE4]/55 hover:text-[#F3EFE4]/85"}`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                          isSelected ? "bg-[#F3EFE4]/10" : "bg-[#F3EFE4]/[0.05]"
                        }`}
                      >
                        <FileIcon width={15} height={15} />
                      </div>

                      {!collapsed && (
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-medium leading-tight">
                            {document.name}
                          </p>
                          <p className="mt-0.5 text-[10px] uppercase tracking-wide text-[#F3EFE4]/30">
                            {document.contentType}
                          </p>
                        </div>
                      )}
                    </button>

                    {!collapsed && (
                      <button
                        type="button"
                        onClick={() => onDeleteDocument(document)}
                        title="Delete document"
                        className="mr-1 hidden h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#F3EFE4]/30 transition hover:bg-[#C1502E]/15 hover:text-[#E8977E] group-hover:flex"
                      >
                        <TrashIcon width={14} height={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {!collapsed && (
          <div className="border-t border-[#F3EFE4]/8 px-4 py-3.5">
            <div className="flex items-center gap-2 text-[10px] text-[#F3EFE4]/35">
              <LockIcon width={12} height={12} />
              <span>Your documents are private</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

export default Sidebar;

// Re-exported so Dashboard can render a matching mobile trigger button
// without duplicating icon markup.
export { MenuIcon };