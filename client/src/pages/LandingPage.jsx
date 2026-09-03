import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  FileText,
  MessageSquare,
  NotebookPen,
  Sparkles,
  ShieldCheck,
  Search,
  Link2,
  Video,
  FileDown,
  FolderKanban,
  Layers3,
  RotateCw,
  TrendingUp,
  BookOpen,
  Quote,
} from "lucide-react";

// -----------------------------------------------------------------------
// Small shared pieces
// -----------------------------------------------------------------------

function IconTile({ icon: Icon, tone = "amber", size = 17 }) {
  const tones = {
    amber: "bg-white text-[#BD7B24]",
    sage: "bg-white text-[#5C7A52]",
    ink: "bg-white text-[#1F1D17]",
  };

  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-[0_1px_0_rgba(31,29,23,0.06)] ${tones[tone]}`}
    >
      <Icon size={size} strokeWidth={1.8} />
    </div>
  );
}

function WindowChrome({ label, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#DED8CA] bg-white shadow-[0_16px_44px_rgba(31,29,23,0.09)]">
      <div className="flex h-9 items-center gap-1.5 border-b border-[#EDE8DA] bg-[#FBFAF6] px-3.5">
        <span className="h-2 w-2 rounded-full bg-[#E7DEC9]" />
        <span className="h-2 w-2 rounded-full bg-[#E7DEC9]" />
        <span className="h-2 w-2 rounded-full bg-[#E7DEC9]" />

        {label && (
          <span className="ml-2 text-[9px] font-medium text-[#A79F8B]">
            {label}
          </span>
        )}
      </div>

      {children}
    </div>
  );
}

// -----------------------------------------------------------------------
// Hero mockup — a single preview that hints at chat + notes + flashcards
// -----------------------------------------------------------------------

function HeroMockup() {
  return (
    <div className="relative">
      <WindowChrome label="docmind.app">
        <div className="grid grid-cols-[104px_1fr] bg-[#F7F4EC]">
          <div className="space-y-1.5 border-r border-[#E6E1D3] p-3">
            {[
              { icon: FileText, label: "Ch. 3 notes.pdf", active: true },
              { icon: Link2, label: "cell-biology.io" },
              { icon: Video, label: "Lecture 12" },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[8px] leading-tight ${
                  item.active
                    ? "bg-white font-medium text-[#1F1D17] shadow-sm"
                    : "text-[#8A8473]"
                }`}
              >
                <item.icon size={10} className="shrink-0" />
                <span className="truncate">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2.5 p-4">
            <div className="ml-auto max-w-[75%] rounded-xl rounded-tr-sm bg-[#1F1D17] px-3 py-2 text-[9px] leading-relaxed text-[#F3EFE4]">
              Where does the chapter define working memory?
            </div>

            <div className="max-w-[85%] rounded-xl rounded-tl-sm border border-[#E6E1D3] bg-white px-3 py-2 text-[9px] leading-relaxed text-[#4F4A3F]">
              Page 42 describes it as{" "}
              <span className="hero-mark rounded-[2px] px-0.5">
                short-term storage that actively manipulates information
              </span>
              , distinct from long-term recall.
              <span className="mt-1.5 flex items-center gap-1 text-[8px] font-medium text-[#BD7B24]">
                <BookOpen size={9} /> Page 42
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-[#E1EBDD] bg-[#F3F8F1] px-2.5 py-1.5">
              <span className="flex items-center gap-1.5 text-[8px] font-medium text-[#496642]">
                <Layers3 size={10} /> 12 flashcards ready to review
              </span>
              <RotateCw size={10} className="text-[#5C7A52]" />
            </div>
          </div>
        </div>
      </WindowChrome>

      <div className="absolute -right-5 -top-5 hidden rotate-3 rounded-xl border border-[#E6E1D3] bg-white px-3 py-2 shadow-lg sm:block">
        <p className="flex items-center gap-1.5 text-[9px] font-semibold text-[#1F1D17]">
          <TrendingUp size={12} className="text-[#5C7A52]" />
          82% retained this week
        </p>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// Feature mockups
// -----------------------------------------------------------------------

function ChatMockup() {
  return (
    <WindowChrome label="Sources">
      <div className="space-y-3 bg-[#F7F4EC] p-4">
        <div className="flex flex-wrap gap-1.5">
          {[
            { icon: FileText, label: "syllabus.pdf" },
            { icon: Link2, label: "nature.com/article" },
            { icon: Video, label: "youtube.com/watch" },
          ].map((chip) => (
            <span
              key={chip.label}
              className="flex items-center gap-1 rounded-full border border-[#E6E1D3] bg-white px-2.5 py-1 text-[9px] text-[#5F5A4D]"
            >
              <chip.icon size={10} className="text-[#BD7B24]" />
              {chip.label}
            </span>
          ))}
        </div>

        <div className="space-y-2 rounded-xl border border-[#E6E1D3] bg-white p-3">
          <p className="text-[9px] font-medium text-[#8A8473]">
            Summarize what these three sources agree on
          </p>
          <div className="space-y-1.5">
            <div className="h-1.5 w-full rounded bg-[#EFEAD9]" />
            <div className="h-1.5 w-11/12 rounded bg-[#EFEAD9]" />
            <div className="h-1.5 w-4/6 rounded bg-[#EFEAD9]" />
          </div>
          <p className="flex items-center gap-2 pt-1 text-[8px] text-[#BD7B24]">
            <span className="rounded bg-[#F5F0E6] px-1.5 py-0.5">
              syllabus.pdf
            </span>
            <span className="rounded bg-[#F5F0E6] px-1.5 py-0.5">
              nature.com
            </span>
          </p>
        </div>
      </div>
    </WindowChrome>
  );
}

function NotesMockup() {
  const [format, setFormat] = useState("Outline");

  return (
    <WindowChrome label="Lecture 12 — notes">
      <div className="space-y-3 bg-[#F7F4EC] p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-11 shrink-0 items-center justify-center rounded-md bg-[#1F1D17] text-[#F3EFE4]">
            <Video size={12} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[9px] font-medium text-[#1F1D17]">
              Cellular Respiration, Lecture 12
            </p>
            <p className="text-[8px] text-[#A79F8B]">48 min video</p>
          </div>
        </div>

        <div className="flex gap-1.5">
          {["Bullets", "Outline", "Cornell"].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFormat(option)}
              className={`rounded-full px-2.5 py-1 text-[8px] font-medium transition ${
                format === option
                  ? "bg-[#1F1D17] text-white"
                  : "bg-white text-[#8A8473] hover:text-[#1F1D17]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-[#E6E1D3] bg-white p-3">
          <p className="text-[9px] font-semibold text-[#1F1D17]">
            I. Glycolysis
          </p>
          <div className="mt-1.5 space-y-1 pl-3">
            <div className="h-1.5 w-10/12 rounded bg-[#EFEAD9]" />
            <div className="h-1.5 w-8/12 rounded bg-[#EFEAD9]" />
          </div>
          <p className="mt-2 text-[9px] font-semibold text-[#1F1D17]">
            II. Krebs cycle
          </p>
          <div className="mt-1.5 space-y-1 pl-3">
            <div className="h-1.5 w-9/12 rounded bg-[#EFEAD9]" />
          </div>
        </div>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#1F1D17] py-2 text-[9px] font-semibold text-white"
        >
          <FileDown size={11} />
          Export as PDF
        </button>
      </div>
    </WindowChrome>
  );
}

function FlashcardMockup() {
  const [flipped, setFlipped] = useState(false);

  return (
    <WindowChrome label="Review — Biology 201">
      <div className="space-y-3 bg-[#F7F4EC] p-4">
        <button
          type="button"
          onClick={() => setFlipped((value) => !value)}
          className="group block w-full [perspective:1000px]"
          aria-label="Flip flashcard"
        >
          <div
            className="relative h-28 w-full rounded-xl transition-transform duration-500"
            style={{
              transformStyle: "preserve-3d",
              transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-xl border border-[#E6E1D3] bg-white px-4 text-center"
              style={{ backfaceVisibility: "hidden" }}
            >
              <p className="text-[8px] font-medium uppercase text-[#A79F8B]">
                Question
              </p>
              <p className="text-[10px] font-medium text-[#1F1D17]">
                What triggers the Krebs cycle to begin?
              </p>
              <p className="text-[8px] text-[#BD7B24]">Tap to flip</p>
            </div>

            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-xl border border-[#E6E1D3] bg-[#1F1D17] px-4 text-center"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <p className="text-[8px] font-medium uppercase text-[#A79F8B]">
                Answer
              </p>
              <p className="text-[10px] font-medium text-[#F3EFE4]">
                Acetyl-CoA entering the mitochondrial matrix.
              </p>
            </div>
          </div>
        </button>

        <div className="flex items-center justify-between rounded-lg border border-[#E1EBDD] bg-[#F3F8F1] px-3 py-2">
          <span className="flex items-center gap-1.5 text-[8px] font-medium text-[#496642]">
            <TrendingUp size={10} />
            68% retained · 6-day streak
          </span>
          <span className="text-[8px] text-[#8FA089]">14 cards left</span>
        </div>
      </div>
    </WindowChrome>
  );
}

function LibraryMockup() {
  const docs = [
    { name: "Ch. 3 — Memory", progress: 80, tag: "Psychology" },
    { name: "cell-biology.io", progress: 35, tag: "Biology" },
    { name: "Lecture 12.mp4", progress: 100, tag: "Biology" },
    { name: "thesis-draft.docx", progress: 10, tag: "Unfiled" },
  ];

  return (
    <WindowChrome label="Documents">
      <div className="bg-[#F7F4EC] p-4">
        <div className="mb-2.5 flex gap-1.5">
          {["All", "Biology", "Psychology"].map((folder, index) => (
            <span
              key={folder}
              className={`rounded-full px-2.5 py-1 text-[8px] font-medium ${
                index === 0
                  ? "bg-[#1F1D17] text-white"
                  : "bg-white text-[#8A8473]"
              }`}
            >
              {folder}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {docs.map((doc) => (
            <div
              key={doc.name}
              className="rounded-lg border border-[#E6E1D3] bg-white p-2.5"
            >
              <p className="truncate text-[8.5px] font-medium text-[#1F1D17]">
                {doc.name}
              </p>
              <p className="mt-0.5 text-[7.5px] text-[#A79F8B]">{doc.tag}</p>
              <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-[#EFEAD9]">
                <div
                  className="h-full rounded-full bg-[#BD7B24]"
                  style={{ width: `${doc.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </WindowChrome>
  );
}

function SearchMockup() {
  return (
    <WindowChrome label="Search — Ch. 3.pdf">
      <div className="space-y-3 bg-[#F7F4EC] p-4">
        <div className="flex items-center gap-2 rounded-lg border border-[#DCD4C4] bg-white px-3 py-2">
          <Search size={12} className="text-[#9B9484]" />
          <span className="text-[9px] text-[#4F4A3F]">
            how is working memory defined?
          </span>
        </div>

        <div className="rounded-xl border border-[#E6E1D3] bg-white p-3">
          <div className="flex items-center justify-between">
            <span className="rounded bg-[#F1ECE0] px-1.5 py-0.5 text-[7.5px] font-medium text-[#8A8473]">
              PDF · Page 42
            </span>
            <span className="text-[8px] font-medium text-[#857D6D]">
              96% match
            </span>
          </div>
          <p className="mt-2 text-[9px] leading-relaxed text-[#5F5A4D]">
            "...working memory is defined as{" "}
            <mark className="rounded-[2px] bg-[#F5DFA8] px-0.5 text-[#3D3421]">
              short-term storage that actively manipulates information
            </mark>{" "}
            rather than simply holding it..."
          </p>
        </div>

        <div className="rounded-xl border border-[#E6E1D3] bg-white p-3 opacity-60">
          <span className="rounded bg-[#F1ECE0] px-1.5 py-0.5 text-[7.5px] font-medium text-[#8A8473]">
            PDF · Page 44
          </span>
          <div className="mt-2 space-y-1">
            <div className="h-1.5 w-full rounded bg-[#EFEAD9]" />
            <div className="h-1.5 w-7/12 rounded bg-[#EFEAD9]" />
          </div>
        </div>
      </div>
    </WindowChrome>
  );
}

// -----------------------------------------------------------------------
// Feature row — text on the left against the spine, mockup on the right
// -----------------------------------------------------------------------

function FeatureRow({ dot, icon, kicker, title, body, mockup, last = false }) {
  return (
    <div className={`relative pl-9 sm:pl-12 ${last ? "" : "pb-16 sm:pb-20"}`}>
      <span
        className="absolute left-0 top-1.5 h-3 w-3 -translate-x-1/2 rounded-full ring-4 ring-[#F7F4EC] sm:left-0"
        style={{ backgroundColor: dot }}
      />

      <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
        <div>
          <div className="flex items-center gap-2.5">
            <IconTile icon={icon} tone="amber" />
            <span className="text-[10px] font-medium text-[#8A8473]">
              {kicker}
            </span>
          </div>

          <h3 className="mt-4 font-[Fraunces] text-2xl font-semibold leading-tight text-[#1F1D17] sm:text-[26px]">
            {title}
          </h3>

          <p className="mt-3 max-w-md text-sm leading-6 text-[#6F695B]">
            {body}
          </p>
        </div>

        <div className="max-w-md lg:max-w-none">{mockup}</div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------

function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F4EC] text-[#1F1D17]">
      <style>{`
        .hero-mark {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 24' preserveAspectRatio='none'%3E%3Cpath d='M2 14 C 20 6, 70 4, 98 10 C 80 18, 25 20, 2 18 Z' fill='%23F5DFA8'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-size: 102% 130%;
          background-position: -1% 45%;
        }

        @keyframes markSweep {
          from { clip-path: inset(0 100% 0 0); }
          to { clip-path: inset(0 0 0 0); }
        }

        .hero-mark-animated {
          animation: markSweep 0.9s 0.5s cubic-bezier(.22,.61,.36,1) both;
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-mark-animated {
            animation: none;
          }
        }
      `}</style>

      {/* Nav */}
      <nav
        className={`sticky top-0 z-40 flex items-center justify-between border-b px-5 py-4 backdrop-blur transition-colors sm:px-10 ${
          scrolled
            ? "border-[#E6E1D3] bg-[#F7F4EC]/90"
            : "border-transparent bg-transparent"
        }`}
      >
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1F1D17] text-[#E3B368]">
            <Sparkles size={17} />
          </div>

          <div>
            <p className="font-[Fraunces] text-base leading-none">DocMind</p>
            <p className="mt-1 text-[9px] text-[#8A8473]">Document research</p>
          </div>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <a
            href="#features"
            className="hidden rounded-lg px-3 py-2 text-xs font-medium text-[#75705F] transition hover:bg-white hover:text-[#1F1D17] sm:inline-block"
          >
            Features
          </a>

          <Link
            to="/login"
            className="rounded-lg px-3 py-2 text-xs font-medium text-[#75705F] transition hover:bg-white hover:text-[#1F1D17]"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="flex items-center gap-1.5 rounded-lg bg-[#1F1D17] px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#3A362C]"
          >
            Get started
            <ArrowRight size={13} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section
        className="relative overflow-hidden px-5 pb-20 pt-14 sm:px-10 sm:pt-20"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(31,29,23,0.06) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          backgroundPosition: "-11px -11px",
        }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-14 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E6E1D3] bg-white px-3 py-1.5 text-[10px] font-medium text-[#75705F]">
                <Sparkles size={12} className="text-[#BD7B24]" />
                Documents, webpages and videos, one workspace
              </div>

              <h1 className="max-w-xl font-[Fraunces] text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
                Upload it. Ask it.{" "}
                <span className="hero-mark hero-mark-animated inline-block">
                  Remember it.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-sm leading-7 text-[#6F695B] sm:text-base">
                DocMind reads your PDFs, webpages and YouTube videos, then
                lets you chat with them, turn them into formatted notes, and
                practice with flashcards built to help it stick.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/signup"
                  className="flex items-center gap-2 rounded-lg bg-[#1F1D17] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#3A362C]"
                >
                  Start studying
                  <ArrowRight size={14} />
                </Link>

                <a
                  href="#features"
                  className="rounded-lg border border-[#DCD6C8] bg-white px-5 py-3 text-xs font-semibold text-[#4F4A3F] transition hover:bg-[#F3EFE4]"
                >
                  See how it works
                </a>
              </div>

              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-[10px] text-[#8A8473]">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={13} />
                  Private workspace
                </span>

                <span className="flex items-center gap-1.5">
                  <Search size={13} />
                  Source-grounded answers
                </span>

                <span className="flex items-center gap-1.5">
                  <Layers3 size={13} />
                  Built for long-term retention
                </span>
              </div>
            </div>

            <HeroMockup />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-[#E6E1D3] bg-white">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-10 sm:py-24">
          <div className="max-w-xl">
            <h2 className="font-[Fraunces] text-2xl font-semibold sm:text-3xl">
              From a pile of sources to something you actually know.
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#8A8473]">
              Each part of DocMind picks up where the last one left off —
              bring in a source, talk to it, write it down, and practice it
              until it's yours.
            </p>
          </div>

          <div className="relative mt-16 before:absolute before:bottom-0 before:left-0 before:top-1.5 before:w-px before:bg-[#E6E1D3] sm:before:block">
            <FeatureRow
              dot="#BD7B24"
              icon={MessageSquare}
              kicker="Sources & chat"
              title="Bring any source into one conversation"
              body="Add PDFs, DOCX and TXT files, paste a webpage link, or drop in a YouTube URL. DocMind reads it, indexes it, and answers your questions grounded in exactly what you gave it — with the source cited every time."
              mockup={<ChatMockup />}
            />

            <FeatureRow
              dot="#BD7B24"
              icon={NotebookPen}
              kicker="Notes from video"
              title="Turn long videos into notes you'll actually read"
              body="Generate structured notes straight from a YouTube video. Choose bullets, an outline, or Cornell-style, then export the result to PDF for offline studying."
              mockup={<NotesMockup />}
            />

            <FeatureRow
              dot="#5C7A52"
              icon={Layers3}
              kicker="Flashcards"
              title="Practice until it sticks"
              body="DocMind turns your notes and documents into flashcards automatically. Review on a schedule built for long-term retention, and track what's mastered and what still needs another pass."
              mockup={<FlashcardMockup />}
            />

            <FeatureRow
              dot="#BD7B24"
              icon={FolderKanban}
              kicker="Document library"
              title="Keep your research organized"
              body="Sort sources into folders, track reading progress per document, and pick up right where you left off — one library instead of scattered tabs and downloads."
              mockup={<LibraryMockup />}
            />

            <FeatureRow
              dot="#BD7B24"
              icon={Search}
              kicker="Semantic search"
              title="Find the exact passage, not just the file"
              body="Search by meaning, not keywords. DocMind surfaces the passages that actually answer your question and highlights exactly where they came from, down to the page."
              mockup={<SearchMockup />}
              last
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 py-20 sm:px-10">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl bg-[#1F1D17]">
          <div className="grid items-center gap-8 px-6 py-12 sm:px-12 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="flex items-center gap-2 text-[10px] font-medium text-[#E3B368]">
                <Quote size={12} />
                Fewer tabs, more understanding
              </p>

              <h2 className="mt-3 max-w-md font-[Fraunces] text-2xl font-semibold text-[#F3EFE4] sm:text-3xl">
                Your next study session starts with one upload.
              </h2>

              <p className="mt-3 max-w-md text-xs leading-6 text-[#F3EFE4]/60">
                Bring in a document, a webpage, or a video — DocMind handles
                the rest.
              </p>
            </div>

            <Link
              to="/signup"
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#E3B368] px-5 py-3 text-xs font-semibold text-[#1F1D17] transition hover:bg-[#E9C07E]"
            >
              Create your workspace
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E6E1D3] px-5 py-6 sm:px-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="font-[Fraunces] text-sm">DocMind</p>

          <p className="text-[9px] text-[#8A8473]">
            AI-powered document research workspace
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;