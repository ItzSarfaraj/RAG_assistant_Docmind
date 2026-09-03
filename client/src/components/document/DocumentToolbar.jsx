import { Search, X } from "lucide-react";

function DocumentToolbar({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  statusFilters,
}) {
  return (
    <div className="mt-5 flex flex-col gap-3 lg:flex-row">
      <div className="flex min-h-[48px] flex-1 items-center gap-2.5 rounded-xl border border-[#E6E1D3] bg-white px-4 shadow-[0_1px_3px_rgba(34,32,26,0.02)] transition focus-within:border-[#D3C5AB] focus-within:shadow-sm">
        <Search size={17} className="shrink-0 text-[#A09A8B]" />

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search your sources..."
          className="min-w-0 flex-1 bg-transparent text-xs text-[#22201A] outline-none placeholder:text-[#A09A8B]"
        />

        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="rounded-md p-1 text-[#A09A8B] hover:bg-[#F7F4EC] hover:text-[#22201A]"
          >
            <X size={13} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-[#E6E1D3] bg-white p-1.5">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setStatusFilter(filter.value)}
            className={`shrink-0 rounded-lg px-3.5 py-2 text-[10px] font-medium transition ${
              statusFilter === filter.value
                ? "bg-[#F3EFE4] font-semibold text-[#BD7B24]"
                : "text-[#75705F] hover:bg-[#F7F4EC]"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default DocumentToolbar;