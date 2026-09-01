import {
  Sparkles,
  FileText,
  MessageSquareText,
  ListChecks,
} from "lucide-react";

function AITools() {
  const tools = [
    {
      title: "Summarize",
      description: "Create a concise summary from your sources.",
      icon: FileText,
    },
    {
      title: "Ask AI",
      description: "Ask questions and get answers grounded in your sources.",
      icon: MessageSquareText,
    },
    {
      title: "Extract Insights",
      description: "Identify important concepts, facts, and findings.",
      icon: ListChecks,
    },
  ];

  return (
    <div className="h-full overflow-y-auto bg-[#F7F4EC]">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles
              size={19}
              className="text-[#BD7B24]"
            />

            <h1 className="text-xl font-semibold text-[#22201A]">
              AI Tools
            </h1>
          </div>

          <p className="mt-1.5 text-xs text-[#8A8473]">
            AI-powered tools for working with your research.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {tools.map((tool) => {
            const Icon = tool.icon;

            return (
              <button
                key={tool.title}
                type="button"
                className="rounded-2xl border border-[#E6E1D3] bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-[#D8CDB7] hover:shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3EFE4] text-[#BD7B24]">
                  <Icon size={18} />
                </div>

                <h2 className="mt-5 text-sm font-semibold text-[#22201A]">
                  {tool.title}
                </h2>

                <p className="mt-2 text-[11px] leading-5 text-[#8A8473]">
                  {tool.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AITools;