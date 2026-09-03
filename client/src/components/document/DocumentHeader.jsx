import { FileText, Plus } from "lucide-react";

function DocumentHeader({ showUploader, onToggleUploader }) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#22201A] text-[#E3B368] shadow-sm">
          <FileText size={21} strokeWidth={1.7} />
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#22201A]">
            Sources
          </h1>

          <p className="mt-1 text-xs text-[#8A8473]">
            Your documents, videos, and research material.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onToggleUploader}
        className="group flex items-center justify-center gap-2 rounded-xl bg-[#22201A] px-5 py-3 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#38352D] hover:shadow-md active:translate-y-0"
      >
        <Plus
          size={15}
          className="transition-transform duration-200 group-hover:rotate-90"
        />

        {showUploader ? "Close" : "Add Source"}
      </button>
    </div>
  );
}

export default DocumentHeader;