import { useState } from "react";
import {
  FileText,
  Link,
  Maximize2,
  Minimize2,
  Video,
  X,
} from "lucide-react";

import PdfPreview from "./PdfPreview";
import WebPreview from "./WebPreview";
import VideoPreview from "./VideoPreview";

function DocumentPreview({ document, onClose, seekTime }) {
  const NORMAL_WIDTH = 380;
  const EXPANDED_WIDTH = 650;
  const MIN_WIDTH = 320;
  const MAX_WIDTH = 800;

  const [width, setWidth] = useState(NORMAL_WIDTH);
  const [isResizing, setIsResizing] = useState(false);

  const isExpanded = width >= EXPANDED_WIDTH;

  const isPdf = document?.contentType === "pdf";
  const isWeb = document?.sourceType === "web";
  const isVideo = document?.sourceType === "video";

  const PreviewIcon = isVideo ? Video : isWeb ? Link : FileText;

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

  const handleToggleExpand = () => {
    setWidth((previousWidth) =>
      previousWidth >= EXPANDED_WIDTH ? NORMAL_WIDTH : EXPANDED_WIDTH,
    );
  };

  if (!document) return null;

  return (
    <aside
      style={{ width: `${width}px` }}
      className={`relative hidden shrink-0 flex-col border-l border-[#E6E1D3] bg-white xl:flex ${
        isResizing ? "select-none" : ""
      }`}
    >
      <div
        onPointerDown={handlePointerDown}
        onDoubleClick={handleToggleExpand}
        className={`group absolute left-0 top-0 z-50 h-full w-2 -translate-x-1/2 cursor-col-resize touch-none ${
          isResizing ? "bg-[#BD7B24]/20" : ""
        }`}
        title="Drag to resize · Double-click to expand"
      >
        <div
          className={`absolute left-1/2 top-1/2 h-12 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full transition ${
            isResizing
              ? "bg-[#BD7B24]"
              : "bg-transparent group-hover:bg-[#D8D2C3]"
          }`}
        />
      </div>

      <header className="flex h-[62px] shrink-0 items-center gap-3 border-b border-[#E6E1D3] px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F3EFE4] text-[#BD7B24]">
          <PreviewIcon size={16} strokeWidth={1.8} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-[#22201A]">
            {document.name}
          </p>

          <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.08em] text-[#8A8473]">
            {isVideo
              ? "YouTube video"
              : isWeb
                ? "Webpage"
                : document.contentType || "File"}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={handleToggleExpand}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#8A8473] transition hover:bg-[#F7F4EC] hover:text-[#22201A]"
            aria-label={isExpanded ? "Collapse preview" : "Expand preview"}
            title={isExpanded ? "Collapse preview" : "Expand preview"}
          >
            {isExpanded ? (
              <Minimize2 size={14} strokeWidth={1.8} />
            ) : (
              <Maximize2 size={14} strokeWidth={1.8} />
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#8A8473] transition hover:bg-[#F7F4EC] hover:text-[#22201A]"
            aria-label="Close document preview"
            title="Close preview"
          >
            <X size={14} strokeWidth={1.8} />
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden bg-[#F0EDE4]">
        {isPdf ? (
          <PdfPreview document={document} />
        ) : isWeb ? (
          <WebPreview document={document} />
        ) : isVideo ? (
          <VideoPreview document={document} seekTime={seekTime} />
        ) : (
          <div className="flex h-full items-center justify-center px-8 text-center">
            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#A09A8B] shadow-sm">
                <FileText size={20} />
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

      <footer className="flex shrink-0 items-center justify-between border-t border-[#E6E1D3] bg-white px-4 py-3">
        <span className="text-[10px] text-[#8A8473]">
          {isExpanded ? "Expanded preview" : "Document preview"}
        </span>

        <span className="flex items-center gap-1.5 text-[10px] font-medium text-[#607653]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#6F8B68]" />
          {document.status || "Indexed"}
        </span>
      </footer>
    </aside>
  );
}

export default DocumentPreview;