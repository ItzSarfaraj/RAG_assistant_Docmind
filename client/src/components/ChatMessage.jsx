import { useEffect, useState, memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mermaid from "mermaid";
import TimestampText from "./TimestampText";
import {
  Mark,
  FileIcon,
  CopyIcon,
  CheckIcon,
  RefreshIcon,
  DotIcon,
} from "./Icons";

// ============================================================
// MERMAID BLOCK
// ============================================================

function MermaidBlock({ chart }) {
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");
  const [isRendering, setIsRendering] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const renderChart = async () => {
      const cleanChart = String(chart || "").trim();

      if (!cleanChart) {
        return;
      }

      // The answer is streamed, so Mermaid code may be temporarily
      // incomplete — don't show an error for incomplete syntax.
      if (!cleanChart.includes("flowchart") && !cleanChart.includes("graph")) {
        return;
      }

      if (!cleanChart.includes("-->")) {
        return;
      }

      try {
        setIsRendering(true);
        setError("");
        setSvg("");

        mermaid.initialize({
          startOnLoad: false,
          theme: "neutral",
          securityLevel: "loose",
        });

        await mermaid.parse(cleanChart);

        if (cancelled) {
          return;
        }

        const id =
          "mermaid-" +
          Date.now() +
          "-" +
          Math.random().toString(36).substring(2, 9);

        const result = await mermaid.render(id, cleanChart);

        if (cancelled) {
          return;
        }

        setSvg(result.svg);
        setIsRendering(false);
      } catch (err) {
        console.error("Mermaid rendering failed:", err);

        if (!cancelled) {
          // Incomplete syntax mid-stream is normal — keep the loading
          // state instead of surfacing an error immediately.
          setIsRendering(true);
        }
      }
    };

    renderChart();

    return () => {
      cancelled = true;
    };
  }, [chart]);

  if (svg) {
    return (
      <div className="mb-5 mt-4 overflow-x-auto rounded-xl border border-[#E6E1D3] bg-white p-5 shadow-sm">
        <div
          className="flex min-w-max justify-center [&_svg]:max-w-none"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
    );
  }

  if (isRendering) {
    return (
      <div className="mb-5 mt-4 overflow-hidden rounded-xl border border-[#E6E1D3] bg-white shadow-sm">
        <div className="flex items-center justify-center gap-2 py-10">
          <span className="flex items-center gap-1.5 text-[#75705F]/60">
            <DotIcon className="animate-bounce [animation-delay:-0.3s]" />
            <DotIcon className="animate-bounce [animation-delay:-0.15s]" />
            <DotIcon className="animate-bounce" />
          </span>
          <span className="text-xs text-[#75705F]/60">
            Rendering diagram...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return <CodeBlock className="language-mermaid">{chart}</CodeBlock>;
  }

  return null;
}

// ============================================================
// CODE BLOCK
// ============================================================

function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false);

  const language = className?.replace("language-", "") || "code";
  const code = String(children).replace(/\n$/, "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  return (
    <div className="group relative mb-5 mt-4 overflow-hidden rounded-xl border border-[#2A281F] bg-[#1B1A14] shadow-sm">
      <div className="flex items-center justify-between border-b border-[#F3EFE4]/10 px-4 py-2">
        <span className="font-mono text-[10px] text-[#F3EFE4]/40">
          {language}
        </span>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-[#F3EFE4]/50 transition hover:bg-[#F3EFE4]/10 hover:text-[#F3EFE4]"
        >
          {copied ? (
            <CheckIcon width={12} height={12} />
          ) : (
            <CopyIcon width={12} height={12} />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <pre className="overflow-x-auto p-4">
        <code className="font-mono text-[12px] leading-6 text-[#F3EFE4]/90">
          {code}
        </code>
      </pre>
    </div>
  );
}

// ============================================================
// CHAT MESSAGE
// ============================================================

function ChatMessage({ message, isLoading, onRegenerate, onTimestampClick }) {
  const [copied, setCopied] = useState(false);

  const isUser = message.role === "user";
  const isGenerating = !isUser && isLoading && !message.content;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy answer:", error);
    }
  };

  return (
    <div className="border-b border-[#E6E1D3]/60 py-6 last:border-0">
      <div className="flex gap-3.5">
        {/* Avatar */}
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${
            isUser
              ? "bg-[#EDE9DC] text-[#75705F]"
              : "bg-[#22201A] text-[#E3B368]"
          }`}
        >
          {isUser ? "U" : <Mark />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2.5 flex items-center gap-2">
            <span className="text-[12px] font-semibold text-[#22201A]">
              {isUser ? "You" : "DocMind"}
            </span>
            {!isUser && isGenerating && (
              <span className="text-[11px] text-[#75705F]/50">Reading...</span>
            )}
          </div>

          {isGenerating && (
            <div className="flex items-center gap-1.5 py-2 text-[#75705F]/50">
              <DotIcon className="animate-bounce [animation-delay:-0.3s]" />
              <DotIcon className="animate-bounce [animation-delay:-0.15s]" />
              <DotIcon className="animate-bounce" />
            </div>
          )}

          {message.content && (
            <div className="max-w-none text-[14.5px] leading-7 text-[#3A362C]">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="mb-4 mt-2 font-[Fraunces] text-xl font-medium tracking-tight text-[#22201A]">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="mb-4 mt-8 font-[Fraunces] text-lg font-medium tracking-tight text-[#22201A]">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="mb-3 mt-6 text-base font-semibold text-[#22201A]">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="mb-4 leading-7 text-[#3A362C]">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="mb-5 ml-5 list-disc space-y-2 marker:text-[#BD7B24]">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-5 ml-5 list-decimal space-y-2 marker:text-[#BD7B24]">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="pl-1 leading-6">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-[#22201A]">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="text-[#5C5647]">{children}</em>
                  ),

                  code: ({ children, className }) => {
                    const isCodeBlock = className?.includes("language-");
                    const language = className
                      ?.replace("language-", "")
                      .toLowerCase();

                    if (language === "mermaid") {
                      return (
                        <MermaidBlock
                          chart={String(children).replace(/\n$/, "")}
                        />
                      );
                    }

                    if (isCodeBlock) {
                      return (
                        <CodeBlock className={className}>{children}</CodeBlock>
                      );
                    }

                    return (
                      <code className="rounded-md border border-[#E6E1D3] bg-[#EFEBDF] px-1.5 py-0.5 font-mono text-[12.5px] text-[#5C5647]">
                        {children}
                      </code>
                    );
                  },

                  pre: ({ children }) => <>{children}</>,

                  blockquote: ({ children }) => (
                    <blockquote className="my-5 border-l-[3px] border-[#BD7B24]/40 bg-[#F1EADA] py-2 pl-4 text-[#5C5647]">
                      {children}
                    </blockquote>
                  ),

                  hr: () => <hr className="my-7 border-[#E6E1D3]" />,

                  table: ({ children }) => (
                    <div className="my-6 overflow-x-auto rounded-xl border border-[#E6E1D3]">
                      <table className="w-full border-collapse text-[12.5px]">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-[#F1EADA] text-left text-[#22201A]">
                      {children}
                    </thead>
                  ),
                  tbody: ({ children }) => (
                    <tbody className="divide-y divide-[#E6E1D3] bg-white">
                      {children}
                    </tbody>
                  ),
                  tr: ({ children }) => (
                    <tr className="transition hover:bg-[#F7F4EC]">
                      {children}
                    </tr>
                  ),
                  th: ({ children }) => (
                    <th className="border-b border-[#E6E1D3] px-4 py-3 font-semibold">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-3 align-top text-[#5C5647]">
                      {children}
                    </td>
                  ),
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-[#22201A] underline decoration-[#BD7B24]/50 underline-offset-2 transition hover:text-[#BD7B24]"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>

              {isLoading && !isUser && (
                <span className="ml-1 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-[#BD7B24]/60 align-middle" />
              )}
            </div>
          )}

          {/* Actions */}
          {!isUser && message.content && !isLoading && (
            <div className="mt-3.5 flex items-center gap-1">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] text-[#75705F]/60 transition hover:bg-[#EFEBDF] hover:text-[#3A362C]"
              >
                {copied ? (
                  <CheckIcon width={13} height={13} />
                ) : (
                  <CopyIcon width={13} height={13} />
                )}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>

              <button
                type="button"
                onClick={() => onRegenerate?.(message.id)}
                className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] text-[#75705F]/60 transition hover:bg-[#EFEBDF] hover:text-[#3A362C]"
              >
                <RefreshIcon width={13} height={13} />
                <span>Regenerate</span>
              </button>
            </div>
          )}

          {/* Sources */}
          {!isUser && message.sources?.length > 0 && (
            <div className="mt-6">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-[11px] font-medium text-[#75705F]/60">
                  Sources
                </span>

                <span className="text-[10px] text-[#75705F]/40">
                  · {message.sources.length} relevant{" "}
                  {message.sources.length === 1 ? "source" : "sources"}
                </span>

                <span className="h-px flex-1 bg-[#E6E1D3]" />
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {message.sources.map((source, sourceIndex) => {
                  const metadata = source.metadata || {};
                  const isVideoSource = Boolean(metadata.video_id);

                  return (
                    <div
                      key={sourceIndex}
                      className={`rounded-xl border bg-white p-3 transition ${
                        isVideoSource
                          ? "border-[#E6E1D3] hover:border-[#BD7B24]/40 hover:shadow-sm"
                          : "border-[#E6E1D3] hover:border-[#BD7B24]/40 hover:shadow-sm"
                      }`}
                    >
                      {/* Source header */}
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            isVideoSource
                              ? "bg-[#F1EADA] text-[#BD7B24]"
                              : "bg-[#F1EADA] text-[#BD7B24]"
                          }`}
                        >
                          {isVideoSource ? (
                            "🎥"
                          ) : (
                            <FileIcon width={13} height={13} />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11px] font-semibold text-[#3A362C]">
                            {isVideoSource
                              ? "YouTube Video"
                              : metadata.file_name ||
                                metadata.source ||
                                "Document"}
                          </p>

                          <p className="mt-0.5 truncate text-[9px] text-[#75705F]/50">
                            {isVideoSource
                              ? "Relevant video moments"
                              : metadata.page !== undefined
                                ? `Page ${metadata.page + 1}`
                                : "Source"}
                          </p>
                        </div>
                      </div>

                      {/* Video timestamps */}
                      {isVideoSource && source.content && (
                        <div className="mt-3 rounded-lg bg-[#F7F4EC] px-2.5 py-2.5">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#75705F]/50">
                              Relevant moments
                            </span>

                            <span className="text-[9px] text-[#75705F]/40">
                              Click to jump
                            </span>
                          </div>

                          <TimestampText
                            text={source.content}
                            onTimestampClick={onTimestampClick}
                          />
                        </div>
                      )}

                      {/* Normal document source */}
                      {!isVideoSource && (
                        <>
                          {metadata.page !== undefined && (
                            <div className="mt-3 rounded-lg bg-[#F7F4EC] px-2.5 py-2">
                              <span className="text-[10px] text-[#75705F]">
                                Page {metadata.page + 1}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(ChatMessage);
