import { FileText, Plus } from "lucide-react";

function EmptyDocuments({ onAddSource }) {
  return (
    <div className="mt-5 rounded-2xl border border-[#E6E1D3] bg-white px-6 py-20 text-center shadow-[0_2px_8px_rgba(34,32,26,0.02)]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3EFE4] text-[#BD7B24]">
        <FileText size={21} />
      </div>

      <h2 className="mt-4 text-sm font-semibold text-[#22201A]">
        No sources found
      </h2>

      <p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-[#8A8473]">
        Try changing your search or filters, or add a new source.
      </p>

      <button
        type="button"
        onClick={onAddSource}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#22201A] px-4 py-2.5 text-[10px] font-semibold text-white transition hover:bg-[#38352D]"
      >
        <Plus size={13} />
        Add Source
      </button>
    </div>
  );
}

export default EmptyDocuments;