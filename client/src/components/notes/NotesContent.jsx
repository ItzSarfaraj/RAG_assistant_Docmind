import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MermaidDiagram from "./MermaidDiagram";

function NotesContent({
  note,
  font,
  fontSize,
  lineSpacing,
  noteWidth,
  paperStyle,
}) {
  // =========================
  // FONT
  // =========================

  const fontClasses = {
    default: "font-sans",
    serif: "font-serif",
    mono: "font-mono",
    handwritten: "[font-family:cursive]",
  };

  // =========================
  // TEXT SIZE
  // =========================

  const sizeClasses = {
    small: "text-[13px]",
    medium: "text-sm",
    large: "text-[16px]",
  };

  // =========================
  // LINE SPACING
  // =========================

  const spacingClasses = {
    compact: "leading-6",
    normal: "leading-7",
    relaxed: "leading-8",
  };

  // =========================
  // NOTE WIDTH
  // =========================

  const widthClasses = {
    normal: "max-w-3xl",
    wide: "max-w-4xl",
    extraWide: "max-w-5xl",
  };

  // =========================
  // PAPER STYLES
  // =========================

  const paperStyles = {
    white: {
      backgroundColor: "#FFFFFF",
      borderColor: "#E6E1D3",
    },

    cream: {
      backgroundColor: "#FBF7EE",
      borderColor: "#E6E1D3",
    },

    gray: {
      backgroundColor: "#F5F5F4",
      borderColor: "#E4E4E1",
    },

    blue: {
      backgroundColor: "#F3F7FB",
      borderColor: "#DCE6F0",
    },

    green: {
      backgroundColor: "#F3F8F3",
      borderColor: "#DCE8DC",
    },

    lavender: {
      backgroundColor: "#F7F4FA",
      borderColor: "#E5DDED",
    },
  };

  const currentPaper =
    paperStyles[paperStyle] || paperStyles.white;

  return (
    <main className="min-w-0 px-3 py-6 sm:px-6 sm:py-8">
      <article
        style={currentPaper}
        className={`
          mx-auto
          rounded-2xl
          border
          px-5
          py-7
          shadow-sm
          sm:px-10
          sm:py-10
          ${widthClasses[noteWidth] || widthClasses.wide}
          ${fontClasses[font] || fontClasses.default}
          ${sizeClasses[fontSize] || sizeClasses.medium}
          ${spacingClasses[lineSpacing] || spacingClasses.normal}
        `}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // =========================
            // HEADINGS
            // =========================

            h1: ({ children }) => (
              <h1 className="mb-7 border-b border-[#E6E1D3] pb-5 text-2xl font-bold text-[#22201A]">
                {children}
              </h1>
            ),

            h2: ({ children }) => (
              <h2 className="mb-3 mt-10 text-lg font-bold text-[#22201A]">
                {children}
              </h2>
            ),

            h3: ({ children }) => (
              <h3 className="mb-2 mt-7 text-sm font-bold text-[#22201A]">
                {children}
              </h3>
            ),

            h4: ({ children }) => (
              <h4 className="mb-2 mt-5 text-xs font-semibold text-[#22201A]">
                {children}
              </h4>
            ),

            // =========================
            // PARAGRAPH
            // =========================

            p: ({ children }) => (
              <p className="mb-4 text-[inherit] leading-[inherit] text-[#3F3B34]">
                {children}
              </p>
            ),

            // =========================
            // LISTS
            // =========================

            ul: ({ children }) => (
              <ul className="mb-5 ml-5 list-disc space-y-2 text-[inherit] leading-[inherit] text-[#3F3B34]">
                {children}
              </ul>
            ),

            ol: ({ children }) => (
              <ol className="mb-5 ml-5 list-decimal space-y-2 text-[inherit] leading-[inherit] text-[#3F3B34]">
                {children}
              </ol>
            ),

            li: ({ children }) => (
              <li className="pl-1 text-[#3F3B34]">
                {children}
              </li>
            ),

            // =========================
            // TEXT EMPHASIS
            // =========================

            strong: ({ children }) => (
              <strong className="font-semibold text-[#22201A]">
                {children}
              </strong>
            ),

            em: ({ children }) => (
              <em className="text-[#4F4A3F]">
                {children}
              </em>
            ),

            // =========================
            // BLOCKQUOTE
            // =========================

            blockquote: ({ children }) => (
              <blockquote className="my-5 border-l-4 border-[#BD7B24] bg-[#F7F4EC] px-4 py-3 italic text-[#5F594C]">
                {children}
              </blockquote>
            ),

            // =========================
            // LINKS
            // =========================

            a: ({ children, href }) => (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="text-[#A86419] underline underline-offset-2"
              >
                {children}
              </a>
            ),

            // =========================
            // CODE
            // =========================

            code: ({ className, children }) => {
              const language = className
                ?.replace("language-", "")
                .trim();

              // Mermaid
              if (language === "mermaid") {
                return (
                  <MermaidDiagram
                    code={String(children).replace(/\n$/, "")}
                  />
                );
              }

              // Regular code block
              if (language) {
                return (
                  <code
                    className="
                      block
                      font-mono
                      text-[13px]
                      leading-6
                      text-[#F1EEE7]
                    "
                  >
                    {children}
                  </code>
                );
              }

              // Inline code
              return (
                <code
                  className="
                    rounded-md
                    bg-[#F1EBDD]
                    px-1.5
                    py-0.5
                    font-mono
                    text-[12px]
                    font-medium
                    text-[#7A4B18]
                  "
                >
                  {children}
                </code>
              );
            },

            // =========================
            // CODE BLOCK CONTAINER
            // =========================

            pre: ({ children }) => {
              const child = children?.props;

              const language = child?.className
                ?.replace("language-", "")
                .trim();

              // Mermaid is rendered separately.
              if (language === "mermaid") {
                return children;
              }

              return (
                <pre
                  className="
                    my-6
                    overflow-x-auto
                    rounded-xl
                    border
                    border-[#3A3731]
                    bg-[#25231F]
                    px-5
                    py-4
                    shadow-sm
                  "
                >
                  {children}
                </pre>
              );
            },

            // =========================
            // TABLE
            // =========================

            table: ({ children }) => (
              <div className="my-6 overflow-x-auto rounded-xl border border-[#E6E1D3]">
                <table className="w-full border-collapse text-xs">
                  {children}
                </table>
              </div>
            ),

            thead: ({ children }) => (
              <thead className="bg-[#F3EFE4]">
                {children}
              </thead>
            ),

            tbody: ({ children }) => (
              <tbody>
                {children}
              </tbody>
            ),

            tr: ({ children }) => (
              <tr className="transition hover:bg-[#FBF7EE]">
                {children}
              </tr>
            ),

            th: ({ children }) => (
              <th className="border-b border-[#E6E1D3] px-4 py-3 text-left text-[11px] font-semibold text-[#22201A]">
                {children}
              </th>
            ),

            td: ({ children }) => (
              <td className="border-b border-[#E6E1D3] px-4 py-3 text-[11px] leading-5 text-[#4F4A3F]">
                {children}
              </td>
            ),

            // =========================
            // HORIZONTAL RULE
            // =========================

            hr: () => (
              <hr className="my-8 border-[#E6E1D3]" />
            ),
          }}
        >
          {note?.content || ""}
        </ReactMarkdown>
      </article>

      {/* =========================
          FOOTER
      ========================= */}

      <div className="mx-auto mt-4 flex max-w-4xl items-center justify-between px-1 text-[9px] text-[#8A8473]">
        <span>Generated by DocMind AI</span>

        {note?.createdAt && (
          <span>
            {new Date(note.createdAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </main>
  );
}

export default NotesContent;