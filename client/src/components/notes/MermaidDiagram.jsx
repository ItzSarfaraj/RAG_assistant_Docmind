import { useEffect, useState } from "react";
import mermaid from "mermaid";

mermaid.initialize({ startOnLoad: false, theme: "default", securityLevel: "loose" });

function cleanLabel(label) {
  return label
    .replace(/"/g, "'")
    .replace(/\(/g, "&#40;")
    .replace(/\)/g, "&#41;")
    .replace(/\[/g, "&#91;")
    .replace(/\]/g, "&#93;")
    .replace(/\{/g, "&#123;")
    .replace(/\}/g, "&#125;");
}

function fixMermaidCode(code) {
  let result = code
    .replace(/\r/g, "")
    .replace(/```mermaid/gi, "")
    .replace(/```/g, "")
    .trim();

  result = result.replace(/(\b[A-Za-z_]\w*)\{([^{}\n]+)\}/g, (_, id, label) => `${id}{"${cleanLabel(label)}"}`);
  result = result.replace(/(\b[A-Za-z_]\w*)\[([^\[\]\n]+)\]/g, (_, id, label) => `${id}["${cleanLabel(label)}"]`);
  result = result.replace(/(\b[A-Za-z_]\w*)\(([^()\n]+)\)/g, (_, id, label) => `${id}["${cleanLabel(label)}"]`);

  return result;
}

function MermaidDiagram({ code }) {
  const [svg, setSvg] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const renderDiagram = async () => {
      try {
        const safeCode = fixMermaidCode(code);
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const result = await mermaid.render(id, safeCode);

        if (mounted) {
          setSvg(result.svg);
          setError(false);
        }
      } catch (error) {
        console.error("MERMAID ERROR:", error);

        if (mounted) {
          setSvg("");
          setError(true);
        }
      }
    };

    if (code?.trim()) renderDiagram();

    return () => {
      mounted = false;
    };
  }, [code]);

  if (error) {
    return (
      <div className="my-5 rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-xs font-semibold text-red-600">Unable to render diagram</p>
        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-[10px] text-red-500">{code}</pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="my-5 flex justify-center rounded-xl border border-[#E6E1D3] bg-white p-6">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#E6E1D3] border-t-[#BD7B24]" />
      </div>
    );
  }

  return (
    <div className="my-6 overflow-x-auto rounded-xl border border-[#E6E1D3] bg-white p-5">
      <div className="flex justify-center" dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  );
}

export default MermaidDiagram;