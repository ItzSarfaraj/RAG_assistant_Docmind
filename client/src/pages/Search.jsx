import { useState } from "react";
import {
  Search as SearchIcon,
  Sparkles,
} from "lucide-react";

function Search() {
  const [query, setQuery] = useState("");

  const handleSearch = (event) => {
    event.preventDefault();

    if (!query.trim()) return;

    console.log("Global search:", query);
  };

  return (
    <div className="h-full overflow-y-auto bg-[#F7F4EC]">
      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <div className="text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#F3EFE4] text-[#BD7B24]">
            <SearchIcon size={19} />
          </div>

          <h1 className="mt-4 text-xl font-semibold text-[#22201A]">
            Search your research
          </h1>

          <p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-[#8A8473]">
            Search across your documents and find relevant information
            from your research library.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="mt-8 rounded-2xl border border-[#E6E1D3] bg-white p-2 shadow-sm"
        >
          <div className="flex items-center gap-3 px-3">
            <SearchIcon
              size={17}
              className="shrink-0 text-[#A09A8B]"
            />

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ask anything about your sources..."
              className="min-w-0 flex-1 bg-transparent py-3 text-sm text-[#22201A] outline-none placeholder:text-[#A09A8B]"
            />

            <button
              type="submit"
              className="rounded-lg bg-[#22201A] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#3A362C]"
            >
              Search
            </button>
          </div>
        </form>

        <div className="mt-8 rounded-2xl border border-[#E6E1D3] bg-white p-6">
          <div className="flex items-center gap-2">
            <Sparkles
              size={15}
              className="text-[#BD7B24]"
            />

            <p className="text-xs font-semibold text-[#22201A]">
              Semantic search
            </p>
          </div>

          <p className="mt-2 text-[11px] leading-5 text-[#8A8473]">
            Search results will use your indexed sources to find
            semantically relevant information rather than relying only
            on exact keyword matches.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Search;