import { useState } from "react";

function DocumentPreview({ document, onClose }) {
  const NORMAL_WIDTH = 380;
  const EXPANDED_WIDTH = 650;
  const MIN_WIDTH = 320;
  const MAX_WIDTH = 800;

  const [width, setWidth] = useState(NORMAL_WIDTH);
  const [isResizing, setIsResizing] = useState(false);

  const isExpanded = width >= EXPANDED_WIDTH;

  // ==========================================
  // START RESIZING
  // ==========================================

  const handlePointerDown = (event) => {
    event.preventDefault();

    const startX = event.clientX;
    const startWidth = width;

    setIsResizing(true);

    event.currentTarget.setPointerCapture(event.pointerId);

    const handlePointerMove = (moveEvent) => {
      const difference = startX - moveEvent.clientX;

      const newWidth = Math.min(
        MAX_WIDTH,
        Math.max(MIN_WIDTH, startWidth + difference),
      );

      setWidth(newWidth);
    };

    const handlePointerUp = (upEvent) => {
      setIsResizing(false);

      try {
        upEvent.currentTarget.releasePointerCapture(upEvent.pointerId);
      } catch {
        // Pointer capture may already be released.
      }

      upEvent.currentTarget.removeEventListener(
        "pointermove",
        handlePointerMove,
      );

      upEvent.currentTarget.removeEventListener("pointerup", handlePointerUp);

      upEvent.currentTarget.removeEventListener(
        "pointercancel",
        handlePointerUp,
      );
    };

    event.currentTarget.addEventListener("pointermove", handlePointerMove);

    event.currentTarget.addEventListener("pointerup", handlePointerUp);

    event.currentTarget.addEventListener("pointercancel", handlePointerUp);
  };

  // ==========================================
  // DOUBLE CLICK
  // ==========================================

  const handleDoubleClick = () => {
    setWidth((previousWidth) =>
      previousWidth >= EXPANDED_WIDTH ? NORMAL_WIDTH : EXPANDED_WIDTH,
    );
  };

  // ==========================================
  // TOGGLE EXPAND BUTTON
  // ==========================================

  const handleToggleExpand = () => {
    setWidth((previousWidth) =>
      previousWidth >= EXPANDED_WIDTH ? NORMAL_WIDTH : EXPANDED_WIDTH,
    );
  };

  if (!document) {
    return null;
  }

  const isPdf = document.contentType === "pdf";

  const fileUrl = document.url ? `http://localhost:5000${document.url}` : null;

  return (
    <aside
      style={{
        width: `${width}px`,
      }}
      className={`relative hidden shrink-0 flex-col border-l border-[#E6E1D3] bg-white xl:flex ${
        isResizing ? "select-none" : ""
      }`}
    >
      {/* ==========================================
          RESIZE HANDLE
      ========================================== */}

      <div
        onPointerDown={handlePointerDown}
        onDoubleClick={handleDoubleClick}
        className={`group absolute left-0 top-0 z-50 h-full w-2 -translate-x-1/2 cursor-col-resize touch-none ${
          isResizing ? "bg-[#BD7B24]" : ""
        }`}
        title="Drag to resize · Double-click to expand"
      >
        {/* Visible resize indicator */}

        <div
          className={`absolute left-1/2 top-1/2 h-12 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full transition ${
            isResizing
              ? "bg-[#BD7B24]"
              : "bg-transparent group-hover:bg-[#D8D2C3]"
          }`}
        />
      </div>

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="flex h-[62px] shrink-0 items-center justify-between border-b border-[#E6E1D3] px-4">
        {/* Document information */}

        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F3EFE4] text-sm">
            📄
          </div>

          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-[#22201A]">
              {document.name}
            </p>

            <p className="mt-0.5 text-[10px] text-[#8A8473]">
              {document.contentType?.toUpperCase() || "FILE"}
              {" · "}
              {document.status || "Indexed"}
            </p>
          </div>
        </div>

        {/* ==========================================
            HEADER ACTIONS
        ========================================== */}

        <div className="ml-3 flex shrink-0 items-center gap-1">
          {/* Expand / Collapse */}

          <button
            type="button"
            onClick={handleToggleExpand}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#8A8473] transition hover:bg-[#F7F4EC] hover:text-[#22201A]"
            aria-label={
              isExpanded
                ? "Collapse document preview"
                : "Expand document preview"
            }
            title={isExpanded ? "Collapse preview" : "Expand preview"}
          >
            {isExpanded ? (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 3v5H3" />
                <path d="M3 8l5-5" />
                <path d="M16 21v-5h5" />
                <path d="M21 16l-5 5" />
              </svg>
            ) : (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 8V3h5" />
                <path d="M3 3l5 5" />
                <path d="M21 16v5h-5" />
                <path d="M21 21l-5-5" />
              </svg>
            )}
          </button>

          {/* Close */}

          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#8A8473] transition hover:bg-[#F7F4EC] hover:text-[#22201A]"
            aria-label="Close document preview"
            title="Close document preview"
          >
            ×
          </button>
        </div>
      </div>

      {/* ==========================================
          DOCUMENT PREVIEW
      ========================================== */}

      <div className="min-h-0 flex-1 overflow-hidden bg-[#F7F4EC]">
        {isPdf && fileUrl ? (
          <iframe
            src={fileUrl}
            title={document.name}
            className="h-full w-full border-0"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-8 text-center">
            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                📄
              </div>

              <h3 className="mt-4 text-sm font-semibold text-[#22201A]">
                Preview unavailable
              </h3>

              <p className="mt-2 text-xs leading-5 text-[#8A8473]">
                A preview for this file type is not available yet.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ==========================================
          FOOTER
      ========================================== */}

      <div className="shrink-0 border-t border-[#E6E1D3] bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#8A8473]">
            {isExpanded ? "Expanded Preview" : "Document Preview"}
          </span>

          <span className="flex items-center gap-1.5 text-[10px] text-[#5F7658]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6F8B68]" />
            Indexed
          </span>
        </div>
      </div>
    </aside>
  );
}

export default DocumentPreview;
