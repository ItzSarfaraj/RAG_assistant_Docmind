import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Layers3,
  LoaderCircle,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";

import {
  getFlashcardSet,
  getDueCards,
  reviewCard,
} from "../services/flashcardService";

function FlashcardSet() {
  const { setId } = useParams();
  const navigate = useNavigate();

  const [set, setSet] = useState(null);
  const [studyCards, setStudyCards] = useState([]);
  const [studyingDueOnly, setStudyingDueOnly] = useState(true);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastAnswer, setLastAnswer] = useState(null); // "correct" | "wrong" | null

  const token = localStorage.getItem("token");

  useEffect(() => {
    const load = async () => {
      try {
        if (!token) throw new Error("Please login to view this set.");

        const setData = await getFlashcardSet(setId, token);
        const flashcardSet = setData.flashcardSet;
        setSet(flashcardSet);

        const dueData = await getDueCards(setId, token);
        const dueCards = dueData.cards || [];

        if (dueCards.length > 0) {
          setStudyCards(dueCards);
          setStudyingDueOnly(true);
        } else {
          setStudyCards(flashcardSet.cards || []);
          setStudyingDueOnly(false);
        }
      } catch (error) {
        console.error("Failed to load flashcard set:", error);
        setError(error.message || "Failed to load flashcard set.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [setId, token]);

  const currentCard = studyCards[index];

  const handleAnswer = async (correct) => {
    if (!currentCard) return;

    setLastAnswer(correct ? "correct" : "wrong");

    try {
      await reviewCard(setId, currentCard._id, correct, token);
    } catch (error) {
      console.error("Failed to submit review:", error);
    }

    setTimeout(() => {
      setReviewed((count) => count + 1);
      if (correct) setCorrectCount((count) => count + 1);
      setFlipped(false);
      setLastAnswer(null);
      setIndex((current) => current + 1);
    }, 220);
  };

  const restartWithFullSet = () => {
    setStudyCards(set?.cards || []);
    setStudyingDueOnly(false);
    setIndex(0);
    setReviewed(0);
    setCorrectCount(0);
    setFlipped(false);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#F7F4EC]">
        <div className="flex items-center gap-2 text-xs text-[#8A8473]">
          <LoaderCircle size={15} className="animate-spin" />
          Loading flashcards...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-[#F7F4EC] px-6">
        <div className="max-w-sm text-center">
          <h2 className="text-sm font-semibold text-[#22201A]">Unable to load set</h2>
          <p className="mt-2 text-xs text-[#8A8473]">{error}</p>
          <button
            type="button"
            onClick={() => navigate("/study-cards")}
            className="mx-auto mt-5 flex items-center gap-2 rounded-lg bg-[#22201A] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#3A362C]"
          >
            <ArrowLeft size={14} />
            Back to Study Cards
          </button>
        </div>
      </div>
    );
  }

  const noCardsAtAll = (set?.cards || []).length === 0;
  const finishedSession = index >= studyCards.length && studyCards.length > 0;
  const accuracy = reviewed > 0 ? Math.round((correctCount / reviewed) * 100) : 0;

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-[#F7F4EC] to-[#F1EADA]">
      <div className="mx-auto max-w-2xl px-5 py-8 sm:px-8 sm:py-10">
        <button
          type="button"
          onClick={() => navigate("/study-cards")}
          className="flex items-center gap-2 text-xs text-[#75705F] transition hover:text-[#22201A]"
        >
          <ArrowLeft size={14} />
          Study Cards
        </button>

        <div className="mt-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F3EFE4] to-[#E8DFC9] text-[#BD7B24] shadow-sm">
            <Layers3 size={17} />
          </div>
          <h1 className="pt-1.5 text-lg font-semibold leading-tight text-[#22201A] sm:text-xl">
            {set?.title || "Study Set"}
          </h1>
        </div>

        {noCardsAtAll ? (
          <div className="mt-8 rounded-2xl border border-[#E6E1D3] bg-white px-6 py-14 text-center">
            <p className="text-sm text-[#8A8473]">This set has no cards.</p>
          </div>
        ) : finishedSession ? (
          <div className="mt-8 overflow-hidden rounded-2xl border border-[#E6E1D3] bg-white px-6 py-14 text-center shadow-[0_8px_30px_rgba(189,123,36,0.08)]">
            <div className="relative mx-auto flex h-14 w-14 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-[#55684A]/15" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#EAF0E5] to-[#D7E4CE] text-[#55684A] shadow-sm">
                <Check size={24} strokeWidth={2.5} />
              </div>
            </div>

            <h2 className="mt-5 text-base font-semibold text-[#22201A]">
              {studyingDueOnly ? "All due cards reviewed" : "Set complete"}
            </h2>

            <div className="mx-auto mt-6 flex max-w-xs items-center justify-center gap-8">
              <div>
                <p className="text-2xl font-semibold text-[#22201A]">{reviewed}</p>
                <p className="mt-0.5 text-[9px] uppercase tracking-wide text-[#A09A8B]">
                  {reviewed === 1 ? "Card reviewed" : "Cards reviewed"}
                </p>
              </div>
              <span className="h-9 w-px bg-[#E6E1D3]" />
              <div>
                <p
                  className={`text-2xl font-semibold ${
                    accuracy >= 70 ? "text-[#55684A]" : "text-[#BD7B24]"
                  }`}
                >
                  {accuracy}%
                </p>
                <p className="mt-0.5 text-[9px] uppercase tracking-wide text-[#A09A8B]">Accuracy</p>
              </div>
            </div>

            <div className="mt-7 flex justify-center gap-2">
              <button
                type="button"
                onClick={restartWithFullSet}
                className="flex items-center gap-2 rounded-lg border border-[#E6E1D3] bg-white px-4 py-2.5 text-xs font-semibold text-[#75705F] transition hover:border-[#D8CDB7] hover:bg-[#F7F4EC]"
              >
                <RotateCcw size={13} />
                Review full set
              </button>
              <button
                type="button"
                onClick={() => navigate("/study-cards")}
                className="rounded-lg bg-[#22201A] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#3A362C]"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-5 flex items-center justify-between text-[10px] text-[#8A8473]">
              <span className="flex items-center gap-1.5">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    studyingDueOnly ? "bg-[#BD7B24]" : "bg-[#A09A8B]"
                  }`}
                />
                {studyingDueOnly ? "Due for review" : "Reviewing full set"} · Card {index + 1} of{" "}
                {studyCards.length}
              </span>
              <span>{reviewed} reviewed</span>
            </div>

            <div className="mt-2 flex gap-1">
              {studyCards.map((_, cardIndex) => (
                <div
                  key={cardIndex}
                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                    cardIndex < index
                      ? "bg-[#BD7B24]"
                      : cardIndex === index
                        ? "bg-[#BD7B24]/40"
                        : "bg-[#E6E1D3]"
                  }`}
                />
              ))}
            </div>

            {/* Shadow lives on this OUTER wrapper — filter must never sit on
                the same element as transform-style: preserve-3d, or the
                3D flip's backface-visibility breaks (mirrored/upside-down
                content bleeding through, which is what caused the bug). */}
            <div
              className={`mt-7 transition-all duration-500 ease-out ${
                lastAnswer === "correct"
                  ? "translate-x-6 rotate-2 opacity-0"
                  : lastAnswer === "wrong"
                    ? "-translate-x-6 -rotate-2 opacity-0"
                    : "translate-x-0 rotate-0 opacity-100"
              }`}
              style={{
                filter: flipped
                  ? "drop-shadow(0 22px 34px rgba(189,123,36,0.22))"
                  : "drop-shadow(0 16px 30px rgba(34,32,26,0.10))",
              }}
            >
              <div style={{ perspective: "1600px" }}>
                <button
                  type="button"
                  onClick={() => setFlipped((value) => !value)}
                  className="relative flex min-h-[300px] w-full transition-transform duration-500"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* Front — question */}
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-white via-white to-[#FBF9F3] p-8 text-center ring-1 ring-[#E6E1D3]"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#E3B368] via-[#BD7B24] to-[#E3B368]" />
                    <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#F3EFE4]" />
                    <span className="relative text-[9px] font-semibold uppercase tracking-[0.14em] text-[#A09A8B]">
                      Question
                    </span>
                    <p className="relative mt-5 max-w-md text-[17px] font-medium leading-8 text-[#22201A]">
                      {currentCard?.question}
                    </p>
                    <span className="relative mt-7 flex items-center gap-1.5 text-[10px] text-[#A09A8B]">
                      <Sparkles size={11} className="text-[#D8CDB7]" />
                      Tap to flip
                    </span>
                  </div>

                  {/* Back — answer */}
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#3A2E17] via-[#22201A] to-[#171510] p-8 text-center ring-1 ring-[#E3B368]/25"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#BD7B24] via-[#E3B368] to-[#BD7B24]" />
                    <div className="pointer-events-none absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-[#F3EFE4]/[0.04]" />
                    <span className="relative rounded-full bg-[#E3B368]/15 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#E3B368]">
                      Answer
                    </span>
                    <p className="relative mt-5 max-w-md text-[17px] font-medium leading-8 text-[#F3EFE4]">
                      {currentCard?.answer}
                    </p>
                    <span className="relative mt-7 text-[10px] text-[#F3EFE4]/40">
                      Tap to flip back
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {flipped ? (
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => handleAnswer(false)}
                  className="group flex flex-1 items-center justify-center gap-2.5 rounded-xl border border-red-200 bg-white px-4 py-3.5 text-xs font-semibold text-red-600 shadow-sm transition hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50 hover:shadow-md active:translate-y-0"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600 transition group-hover:bg-red-200">
                    <X size={13} strokeWidth={2.5} />
                  </span>
                  Didn't know it
                </button>
                <button
                  type="button"
                  onClick={() => handleAnswer(true)}
                  className="group flex flex-1 items-center justify-center gap-2.5 rounded-xl border border-[#D7E4CE] bg-white px-4 py-3.5 text-xs font-semibold text-[#55684A] shadow-sm transition hover:-translate-y-0.5 hover:border-[#B9CFA9] hover:bg-[#EAF0E5] hover:shadow-md active:translate-y-0"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#DDE9D2] text-[#55684A] transition group-hover:bg-[#C9DDB6]">
                    <Check size={13} strokeWidth={2.5} />
                  </span>
                  Knew it
                </button>
              </div>
            ) : (
              <p className="mt-6 text-center text-[10px] text-[#A09A8B]">
                Flip the card to reveal the answer
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default FlashcardSet;