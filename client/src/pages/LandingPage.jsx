import { Link } from "react-router-dom";
import {
  ArrowRight,
  FileText,
  MessageSquare,
  NotebookPen,
  PlayCircle,
  Sparkles,
  ShieldCheck,
  Search,
} from "lucide-react";

function LandingPage() {
  const features = [
    {
      icon: FileText,
      title: "Document Research",
      text: "Upload your documents and keep all your research in one workspace.",
    },
    {
      icon: MessageSquare,
      title: "Ask Your Documents",
      text: "Use RAG-powered chat to ask questions and get answers from your sources.",
    },
    {
      icon: NotebookPen,
      title: "AI Notes",
      text: "Turn long videos and documents into structured, customizable study notes.",
    },
  ];

  const steps = [
    [
      "01",
      "Add your source",
      "Upload a document or add a supported video source.",
    ],
    [
      "02",
      "Ask and explore",
      "Chat with your sources and find the information you need.",
    ],
    [
      "03",
      "Generate notes",
      "Create structured notes designed for learning and revision.",
    ],
  ];

  return (
    <div className="min-h-screen bg-[#F7F4EC] text-[#22201A]">
      {/* Navigation */}
      <nav className="flex items-center justify-between border-b border-[#E6E1D3] bg-[#F7F4EC]/95 px-5 py-4 sm:px-10">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#22201A] text-[#E3B368]">
            <Sparkles size={17} />
          </div>

          <div>
            <p className="font-[Fraunces] text-base leading-none">DocMind</p>
            <p className="mt-1 text-[9px] text-[#8A8473]">Document research</p>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/login"
            className="rounded-lg px-3 py-2 text-xs font-medium text-[#75705F] transition hover:bg-white hover:text-[#22201A]"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="flex items-center gap-1.5 rounded-lg bg-[#22201A] px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#3A362C]"
          >
            Get Started
            <ArrowRight size={13} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pb-20 pt-16 sm:px-10 sm:pt-24">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_0.85fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E6E1D3] bg-white px-3 py-1.5 text-[10px] font-medium text-[#75705F]">
              <Sparkles size={12} className="text-[#BD7B24]" />
              AI-powered research workspace
            </div>

            <h1 className="max-w-2xl font-[Fraunces] text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
              Understand your sources.
              <span className="block text-[#BD7B24]">Learn faster.</span>
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-7 text-[#6F695B] sm:text-base">
              DocMind brings your documents, AI conversations, video
              understanding, and study notes together in one focused workspace.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/signup"
                className="flex items-center gap-2 rounded-lg bg-[#22201A] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#3A362C]"
              >
                Start with DocMind
                <ArrowRight size={14} />
              </Link>

              <Link
                to="/login"
                className="rounded-lg border border-[#DCD6C8] bg-white px-5 py-3 text-xs font-semibold text-[#4F4A3F] transition hover:bg-[#F3EFE4]"
              >
                Sign in
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[10px] text-[#8A8473]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={13} />
                Private workspace
              </span>

              <span className="flex items-center gap-1.5">
                <Search size={13} />
                Source-grounded answers
              </span>

              <span className="flex items-center gap-1.5">
                <NotebookPen size={13} />
                Custom notes
              </span>
            </div>
          </div>

          {/* Product Preview */}
          <div className="relative">
            <div className="rounded-2xl border border-[#DED8CA] bg-white p-3 shadow-[0_20px_60px_rgba(34,32,26,0.10)]">
              <div className="overflow-hidden rounded-xl border border-[#E6E1D3] bg-[#F7F4EC]">
                {/* Fake application header */}
                <div className="flex h-11 items-center justify-between border-b border-[#E6E1D3] bg-white px-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-[#BD7B24]" />
                    <span className="text-[9px] font-semibold">DocMind</span>
                  </div>

                  <div className="h-5 w-20 rounded-md bg-[#F3EFE4]" />
                </div>

                <div className="grid min-h-[330px] grid-cols-[90px_1fr]">
                  {/* Fake sidebar */}
                  <div className="border-r border-[#E6E1D3] bg-[#16150F] p-2.5">
                    <div className="mb-5 h-5 w-14 rounded bg-white/10" />

                    <div className="space-y-2">
                      <div className="rounded-md bg-white/10 px-2 py-2 text-[7px] text-white/80">
                        Dashboard
                      </div>
                      <div className="px-2 py-2 text-[7px] text-white/40">
                        Documents
                      </div>
                      <div className="px-2 py-2 text-[7px] text-white/40">
                        Notes
                      </div>
                    </div>
                  </div>

                  {/* Fake content */}
                  <div className="p-4">
                    <div className="mb-4">
                      <div className="h-3 w-32 rounded bg-[#22201A]/10" />
                      <div className="mt-2 h-2 w-48 rounded bg-[#22201A]/5" />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border border-[#E6E1D3] bg-white p-3">
                        <FileText size={15} className="text-[#BD7B24]" />
                        <div className="mt-3 h-2 w-20 rounded bg-[#22201A]/10" />
                        <div className="mt-2 h-1.5 w-28 rounded bg-[#22201A]/5" />
                      </div>

                      <div className="rounded-lg border border-[#E6E1D3] bg-white p-3">
                        <MessageSquare size={15} className="text-[#BD7B24]" />
                        <div className="mt-3 h-2 w-20 rounded bg-[#22201A]/10" />
                        <div className="mt-2 h-1.5 w-28 rounded bg-[#22201A]/5" />
                      </div>
                    </div>

                    <div className="mt-3 rounded-lg border border-[#E6E1D3] bg-white p-3">
                      <div className="flex items-center gap-2">
                        <NotebookPen size={14} className="text-[#BD7B24]" />
                        <div className="h-2 w-24 rounded bg-[#22201A]/10" />
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="h-1.5 w-full rounded bg-[#22201A]/5" />
                        <div className="h-1.5 w-5/6 rounded bg-[#22201A]/5" />
                        <div className="h-1.5 w-3/4 rounded bg-[#22201A]/5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-4 hidden rounded-xl border border-[#E6E1D3] bg-white px-4 py-3 shadow-lg sm:block">
              <div className="flex items-center gap-2">
                <PlayCircle size={15} className="text-[#BD7B24]" />
                <div>
                  <p className="text-[9px] font-semibold">
                    Video understanding
                  </p>
                  <p className="mt-0.5 text-[8px] text-[#8A8473]">
                    Ask questions about your source
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-[#E6E1D3] bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-10">
          <div className="max-w-xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#BD7B24]">
              One workspace
            </p>

            <h2 className="mt-3 font-[Fraunces] text-2xl font-semibold sm:text-3xl">
              Everything you need to research and learn.
            </h2>

            <p className="mt-3 text-xs leading-6 text-[#8A8473]">
              Keep your sources, conversations, and generated knowledge
              connected instead of switching between different tools.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-xl border border-[#E6E1D3] bg-[#F7F4EC] p-5"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#BD7B24] shadow-sm">
                    <Icon size={17} />
                  </div>

                  <h3 className="mt-5 text-sm font-semibold">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-xs leading-6 text-[#7B7567]">
                    {feature.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-10">
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#BD7B24]">
            Simple workflow
          </p>

          <h2 className="mt-3 font-[Fraunces] text-2xl font-semibold sm:text-3xl">
            From source to understanding.
          </h2>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {steps.map(([number, title, text]) => (
            <div key={number} className="border-t border-[#DCD6C8] pt-5">
              <span className="text-[10px] font-semibold text-[#BD7B24]">
                {number}
              </span>

              <h3 className="mt-3 text-sm font-semibold">{title}</h3>

              <p className="mt-2 text-xs leading-6 text-[#7B7567]">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-16 sm:px-10">
        <div className="mx-auto max-w-5xl rounded-2xl bg-[#22201A] px-6 py-12 text-center sm:px-10">
          <h2 className="font-[Fraunces] text-2xl font-semibold text-[#F3EFE4] sm:text-3xl">
            Make your sources easier to understand.
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-xs leading-6 text-[#F3EFE4]/55">
            Build a focused research and learning workflow with DocMind.
          </p>

          <Link
            to="/signup"
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#E3B368] px-5 py-3 text-xs font-semibold text-[#22201A] transition hover:bg-[#E9C07E]"
          >
            Create your workspace
            <ArrowRight size={14} />
          </Link>
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
