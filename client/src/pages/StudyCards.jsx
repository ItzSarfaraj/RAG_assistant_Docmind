import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Layers3,
  Plus,
  RefreshCw,
  RotateCcw,
} from "lucide-react";

import { getFlashcardSets } from "../services/flashcardService";

function StudyCards() {
  const navigate = useNavigate();

  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSets = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login to view your study sets.");
      }

      const data = await getFlashcardSets(token);
      setSets(data.flashcardSets || []);
    } catch (error) {
      console.error("Failed to load flashcard sets:", error);
      setError(error.message || "Failed to load flashcard sets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSets();
  }, []);

  const totalCards = sets.reduce(
    (sum, set) => sum + (set.cardCount || 0),
    0
  );

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="h-full overflow-y-auto bg-[#F7F4EC]">
      <div className="mx-auto max-w-6xl px-5 py-7 sm:px-8 sm:py-9">

        {/* =========================================================
            HERO
        ========================================================= */}
        <section className="relative overflow-hidden rounded-2xl border border-[#39362D] bg-[#22201A] shadow-[0_4px_20px_rgba(34,32,26,0.08)]">

          {/* Decorative glow */}
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#E3B368]/[0.045] blur-3xl" />

          <div className="relative px-6 py-6 sm:px-8 sm:py-7">

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

              {/* Hero content */}
              <div className="flex items-start gap-3.5">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#F3EFE4]/10 bg-[#F3EFE4]/[0.06] text-[#E3B368] shadow-inner">
                  <RotateCcw
                    size={19}
                    strokeWidth={1.8}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">

                    <h1 className="text-lg font-semibold tracking-[-0.01em] text-[#F3EFE4] sm:text-xl">
                      Study Cards
                    </h1>

                    {!loading && sets.length > 0 && (
                      <span className="rounded-full border border-[#E3B368]/10 bg-[#E3B368]/10 px-2 py-0.5 text-[9px] font-medium text-[#E3B368]">
                        {sets.length}{" "}
                        {sets.length === 1 ? "set" : "sets"}
                      </span>
                    )}
                  </div>

                  <p className="mt-1.5 max-w-xl text-[11.5px] leading-5 text-[#F3EFE4]/55">
                    Turn your sources into focused study cards. Review what
                    you know less often and bring forgotten concepts back
                    sooner.
                  </p>
                </div>
              </div>

              {/* Primary create action */}
              <button
                type="button"
                onClick={() => navigate("/flashcards")}
                className="group flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#E3B368] px-4 py-2.5 text-xs font-semibold text-[#22201A] shadow-[0_3px_10px_rgba(227,179,104,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#EDC17E] hover:shadow-[0_6px_18px_rgba(227,179,104,0.18)] active:translate-y-0 active:scale-[0.98]"
              >
                <Plus
                  size={14}
                  className="transition-transform duration-200 group-hover:rotate-90"
                />
                New Study Set
              </button>
            </div>

            {/* Stats */}
            {!loading && (
              <div className="mt-6 flex items-center gap-6 border-t border-[#F3EFE4]/10 pt-5">

                <div>
                  <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-[#F3EFE4]/40">
                    Study sets
                  </p>

                  <p className="mt-1 text-xl font-semibold text-[#F3EFE4]">
                    {sets.length}
                  </p>
                </div>

                <span className="h-8 w-px bg-[#F3EFE4]/10" />

                <div>
                  <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-[#F3EFE4]/40">
                    Total cards
                  </p>

                  <p className="mt-1 text-xl font-semibold text-[#F3EFE4]">
                    {totalCards}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* =========================================================
            SECTION HEADER
        ========================================================= */}
        <div className="mt-8">

          <h2 className="text-sm font-semibold tracking-[-0.01em] text-[#22201A]">
            Your study sets
          </h2>

          {!loading && !error && sets.length > 0 && (
            <p className="mt-1 text-[10px] text-[#9A9485]">
              Choose a set to start reviewing
            </p>
          )}
        </div>

        {/* =========================================================
            LOADING STATE
        ========================================================= */}
        {loading ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {[0, 1, 2].map((key) => (
              <div
                key={key}
                className="rounded-2xl border border-[#E6E1D3] bg-white p-5 shadow-[0_1px_2px_rgba(34,32,26,0.02)]"
              >
                <div className="flex items-start justify-between">

                  <div className="h-10 w-10 animate-pulse rounded-xl bg-[#F3EFE4]" />

                  <div className="h-7 w-7 animate-pulse rounded-full bg-[#F3EFE4]" />
                </div>

                <div className="mt-5 h-3.5 w-3/4 animate-pulse rounded bg-[#F3EFE4]" />

                <div className="mt-3 h-2.5 w-1/2 animate-pulse rounded bg-[#F3EFE4]" />

                <div className="mt-5 border-t border-[#EEE9DD] pt-3">
                  <div className="h-5 w-16 animate-pulse rounded-md bg-[#F3EFE4]" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (

          /* =========================================================
             ERROR STATE
          ========================================================= */
          <div className="mt-4 rounded-2xl border border-[#E8C9C4] bg-white p-6 shadow-[0_1px_3px_rgba(34,32,26,0.03)]">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-xs font-semibold text-[#8F4038]">
                  Couldn't load study sets
                </p>

                <p className="mt-1 text-[11px] leading-5 text-[#9A706B]">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={loadSets}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-[#E6E1D3] bg-[#F7F4EC] px-3 py-2 text-[10px] font-semibold text-[#514B3F] transition-all duration-200 hover:border-[#D8CDB7] hover:bg-white hover:shadow-sm active:scale-[0.98]"
              >
                <RefreshCw size={13} />
                Try again
              </button>
            </div>
          </div>

        ) : sets.length === 0 ? (

          /* =========================================================
             EMPTY STATE
          ========================================================= */
          <div className="relative mt-4 overflow-hidden rounded-2xl border border-[#E6E1D3] bg-white px-6 py-16 text-center shadow-[0_2px_8px_rgba(34,32,26,0.03)]">

            {/* Decorative background */}
            <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-64 -translate-x-1/2 rounded-full bg-[#E3B368]/[0.06] blur-3xl" />

            <div className="relative">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#E6E1D3] bg-[#F3EFE4] text-[#BD7B24] shadow-sm">
                <Layers3
                  size={21}
                  strokeWidth={1.8}
                />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-[#22201A]">
                No study sets yet
              </h3>

              <p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-[#8A8473]">
                Turn one of your documents, videos, or other sources into
                flashcards and start reviewing.
              </p>

              <button
                type="button"
                onClick={() => navigate("/flashcards")}
                className="group mt-5 inline-flex items-center gap-2 rounded-lg bg-[#22201A] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#343129] hover:shadow-md active:translate-y-0 active:scale-[0.98]"
              >
                <Plus
                  size={14}
                  className="transition-transform duration-200 group-hover:rotate-90"
                />
                Create a Study Set
              </button>
            </div>
          </div>

        ) : (

          /* =========================================================
             STUDY SETS
          ========================================================= */
          <div
            className={`mt-4 grid gap-4 ${
              sets.length === 1
                ? "max-w-2xl grid-cols-1 sm:grid-cols-2"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >

            {sets.map((set) => (

              <button
                key={set._id}
                type="button"
                onClick={() => navigate(`/flashcards/${set._id}`)}
                className="group relative overflow-hidden rounded-2xl border border-[#E6E1D3] bg-white p-5 text-left shadow-[0_1px_2px_rgba(34,32,26,0.025)] transition-all duration-250 hover:-translate-y-1 hover:border-[#D5C8B0] hover:shadow-[0_10px_28px_rgba(34,32,26,0.08)] focus:outline-none focus:ring-2 focus:ring-[#E3B368]/40"
              >

                {/* Top accent */}
                <div className="absolute left-0 top-0 h-[2px] w-0 bg-[#E3B368] transition-all duration-300 group-hover:w-full" />

                {/* Card top */}
                <div className="flex items-start justify-between">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3EFE4] text-[#BD7B24] transition-all duration-200 group-hover:bg-[#F1E7D3] group-hover:shadow-sm">
                    <Layers3
                      size={18}
                      strokeWidth={1.8}
                    />
                  </div>

                  <div className="flex h-7 w-7 items-center justify-center rounded-full text-[#B1AA9A] transition-all duration-200 group-hover:bg-[#F7F4EC] group-hover:text-[#BD7B24]">
                    <ArrowUpRight
                      size={15}
                      className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </div>
                </div>

                {/* Title */}
                <h3 className="mt-5 line-clamp-2 min-h-[40px] text-sm font-semibold leading-5 tracking-[-0.005em] text-[#22201A]">
                  {set.title || "Study Set"}
                </h3>

                {/* Source */}
                <p className="mt-2 truncate text-[10.5px] text-[#8A8473]">
                  {set.sourceDocuments?.length > 0
                    ? set.sourceDocuments.map((doc) => doc.name).join(", ")
                    : "Custom study set"}
                </p>

                {/* Metadata */}
                <div className="mt-5 flex items-center justify-between border-t border-[#E9E4D8] pt-3">

                  <span className="rounded-md border border-[#EBDDC4] bg-[#F7F0E2] px-2 py-1 text-[9px] font-semibold text-[#BD7B24]">
                    {set.cardCount || 0}{" "}
                    {set.cardCount === 1 ? "card" : "cards"}
                  </span>

                  <span className="text-[9px] text-[#A09A8B]">
                    {formatDate(set.createdAt)}
                  </span>
                </div>

                {/* Hover bottom glow */}
                <div className="pointer-events-none absolute -bottom-10 -right-10 h-24 w-24 rounded-full bg-[#E3B368]/[0.07] opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
              </button>
            ))}

            {/* =====================================================
                CREATE TILE
            ===================================================== */}
            <button
              type="button"
              onClick={() => navigate("/flashcards")}
              className="group relative flex min-h-[190px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[#D8CDB7] bg-transparent p-5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-[#BD7B24] hover:bg-white hover:shadow-[0_8px_22px_rgba(34,32,26,0.05)]"
            >

              {/* Background glow */}
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E3B368]/[0.05] opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3EFE4] text-[#BD7B24] transition-all duration-200 group-hover:scale-105 group-hover:bg-[#F1E7D3]">
                <Plus
                  size={18}
                  className="transition-transform duration-300 group-hover:rotate-90"
                />
              </div>

              <p className="relative mt-3 text-xs font-semibold text-[#22201A]">
                New study set
              </p>

              <p className="relative mt-1 text-[10px] text-[#8A8473]">
                Create from any source
              </p>
            </button>
          </div>
        )}

        {/* Bottom hint */}
        {!loading && !error && sets.length > 0 && (
          <div className="mt-7 text-center text-[9px] text-[#A09A8B]">
            Review regularly to strengthen your recall
          </div>
        )}
      </div>
    </div>
  );
}

export default StudyCards;