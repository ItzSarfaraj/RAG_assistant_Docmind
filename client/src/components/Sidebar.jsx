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
  NoteIcon,
  ExternalLinkIcon,
} from "./Icons";

function Sidebar({
  documents,
  notes,
  selectedDocument,
  onSelectDocument,
  onSelectNote,
  onNewDocument,
  onDeleteDocument,
  onDeleteNote,
  isOpen = false,
  onClose = () => {},
}) {
  const [collapsed, setCollapsed] = useState(false);

  const handleSelect = (document) => {
    onSelectDocument(document);
    onClose();
  };

  const handleSelectNote = (note) => {
    onSelectNote(note);
    onClose();
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
        {/* ===================================================== */}
        {/* BRAND */}
        {/* ===================================================== */}

        <div
          className={`flex items-center justify-between ${
            collapsed ? "px-3" : "px-4"
          } pb-5 pt-5`}
        >
          <div
            className={`flex items-center ${
              collapsed ? "justify-center" : "gap-2.5"
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#F3EFE4]/12 bg-[#F3EFE4]/[0.06] text-[#E3B368]">
              <Mark />
            </div>

            {!collapsed && (
              <div>
                <h2 className="font-[Fraunces] text-[15px] leading-tight">
                  DocMind
                </h2>

                <p className="text-[10px] text-[#F3EFE4]/40">
                  Document research
                </p>
              </div>
            )}
          </div>

          {/* Mobile close */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-[#F3EFE4]/50 transition hover:bg-[#F3EFE4]/[0.06] hover:text-[#F3EFE4] md:hidden"
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>

        {/* ===================================================== */}
        {/* COLLAPSE */}
        {/* ===================================================== */}

        <div
          className={`mb-2 hidden md:block ${
            collapsed ? "px-2" : "px-3"
          }`}
        >
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[#F3EFE4]/45 transition hover:bg-[#F3EFE4]/[0.06] hover:text-[#F3EFE4]/80 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}

            {!collapsed && (
              <span className="text-xs">Collapse</span>
            )}
          </button>
        </div>

        {/* ===================================================== */}
        {/* NEW SOURCE */}
        {/* ===================================================== */}

        <div className={`${collapsed ? "px-2" : "px-3"}`}>
          <button
            type="button"
            onClick={handleNew}
            title="New source"
            className={`flex w-full items-center gap-2.5 rounded-lg border border-[#F3EFE4]/12 bg-[#F3EFE4]/[0.05] px-3 py-2.5 text-sm font-medium text-[#F3EFE4]/90 transition hover:border-[#E3B368]/30 hover:bg-[#E3B368]/[0.08] hover:text-[#E3B368] ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <PlusIcon />

            {!collapsed && <span>New source</span>}
          </button>
        </div>

        {/* ===================================================== */}
        {/* CONTENT */}
        {/* ===================================================== */}

        <div className="mt-6 flex-1 overflow-y-auto px-2.5 pb-4">

          {/* =================================================== */}
          {/* GENERATED NOTES */}
          {/* =================================================== */}

          {!collapsed && (
            <div className="mb-3 flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#E3B368]/10 text-[#E3B368]">
                  <NoteIcon width={12} height={12} />
                </div>

                <span className="text-[11px] font-medium text-[#F3EFE4]/50">
                  Generated notes
                </span>
              </div>

              {notes?.length > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E3B368]/15 px-1.5 text-[9px] font-semibold text-[#E3B368]">
                  {notes.length}
                </span>
              )}
            </div>
          )}

          {collapsed ? (
            <div className="mb-4 space-y-1">
              {notes?.map((note) => (
                <button
                  key={note._id}
                  type="button"
                  onClick={() => handleSelectNote(note)}
                  title={note.title}
                  className="flex w-full items-center justify-center rounded-lg p-2.5 text-[#E3B368] transition hover:bg-[#E3B368]/10"
                >
                  <NoteIcon width={16} height={16} />
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {notes?.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#F3EFE4]/10 bg-[#F3EFE4]/[0.025] px-3 py-4">
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 text-[#F3EFE4]/20">
                      <NoteIcon width={15} height={15} />
                    </div>

                    <div>
                      <p className="text-[10px] font-medium text-[#F3EFE4]/40">
                        No notes yet
                      </p>

                      <p className="mt-1 text-[9px] leading-4 text-[#F3EFE4]/25">
                        Generate notes from a video source.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                notes.map((note) => {
                  const sourceName =
                    note.document?.name ||
                    note.documentName ||
                    "Video source";

                  const createdDate = note.createdAt
                    ? new Date(note.createdAt).toLocaleDateString()
                    : "";

                  return (
                    <div
                      key={note._id}
                      className="group relative overflow-hidden rounded-xl border border-[#E3B368]/10 bg-[#E3B368]/[0.045] transition hover:border-[#E3B368]/25 hover:bg-[#E3B368]/[0.08]"
                    >
                      {/* Accent line */}
                      <span className="absolute left-0 top-0 h-full w-[2px] bg-[#E3B368]/50" />

                      <button
                        type="button"
                        onClick={() => handleSelectNote(note)}
                        className="flex w-full items-start gap-3 px-3 py-3 pr-9 text-left"
                      >
                        {/* Note icon */}
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#E3B368]/15 bg-[#E3B368]/10 text-[#E3B368]">
                          <NoteIcon width={15} height={15} />
                        </div>

                        {/* Note information */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12px] font-medium leading-tight text-[#F3EFE4]/90">
                            {note.title || "Generated Notes"}
                          </p>

                          <p className="mt-1 truncate text-[9px] text-[#F3EFE4]/35">
                            {sourceName}
                          </p>

                          <div className="mt-2 flex items-center gap-2">
                            <span className="rounded-md bg-[#E3B368]/10 px-1.5 py-0.5 text-[8px] font-medium uppercase tracking-wide text-[#E3B368]/70">
                              Notes
                            </span>

                            {createdDate && (
                              <span className="text-[8px] text-[#F3EFE4]/25">
                                {createdDate}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Open */}
                      <button
                        type="button"
                        onClick={() => handleSelectNote(note)}
                        title="Open note"
                        className="absolute right-7 top-2.5 hidden h-6 w-6 items-center justify-center rounded-md text-[#F3EFE4]/25 transition hover:bg-[#F3EFE4]/10 hover:text-[#F3EFE4]/70 group-hover:flex"
                      >
                        <ExternalLinkIcon width={12} height={12} />
                      </button>

                      {/* Delete */}
                      {onDeleteNote && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onDeleteNote(note);
                          }}
                          title="Remove note"
                          className="absolute right-1.5 top-2.5 hidden h-6 w-6 items-center justify-center rounded-md text-[#F3EFE4]/20 transition hover:bg-[#C1502E]/15 hover:text-[#E8977E] group-hover:flex"
                        >
                          <TrashIcon width={12} height={12} />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* =================================================== */}
          {/* YOUR SOURCES */}
          {/* =================================================== */}

          {!collapsed && (
            <div className="mb-2 mt-7 flex items-center justify-between px-2">
              <span className="text-[11px] font-medium text-[#F3EFE4]/35">
                Your sources
              </span>

              {documents.length > 0 && (
                <span className="text-[9px] text-[#F3EFE4]/20">
                  {documents.length}
                </span>
              )}
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
                const isSelected =
                  selectedDocument?._id === document._id;

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
                      } ${
                        isSelected
                          ? "text-[#F3EFE4]"
                          : "text-[#F3EFE4]/55 hover:text-[#F3EFE4]/85"
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                          isSelected
                            ? "bg-[#F3EFE4]/10"
                            : "bg-[#F3EFE4]/[0.05]"
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
                            {document.contentType ||
                              document.sourceType ||
                              "SOURCE"}
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

        {/* ===================================================== */}
        {/* FOOTER */}
        {/* ===================================================== */}

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

export { MenuIcon };