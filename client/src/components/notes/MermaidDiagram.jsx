import { useEffect, useState } from "react";
import mermaid from "mermaid";

// Two full config sets rather than patching one -- mermaid's config is a
// global singleton, so every render call must explicitly set the mode it
// wants. Relying on a single one-time initialize() at import time meant a
// sketch-mode diagram could leave "handDrawn" config active for a later
// classic-mode diagram (or vice versa) once users can toggle noteStyle.
const CLASSIC_CONFIG = {
  startOnLoad: false,
  theme: "default",
  securityLevel: "loose",
};

const SKETCH_CONFIG = {
  startOnLoad: false,
  securityLevel: "loose",
  theme: "neutral",
  look: "handDrawn",
  fontFamily: "'Kalam', cursive",
  themeVariables: {
    primaryColor: "#F3EFE4",
    primaryTextColor: "#22201A",
    primaryBorderColor: "#1F5C4C",
    lineColor: "#22201A",
    secondaryColor: "#EFEFEA",
    tertiaryColor: "#FFFFFF",
  },
};

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

function MermaidDiagram({ code, sketch = false }) {
  const [svg, setSvg] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const renderDiagram = async () => {
      try {
        // Re-initialize on every render, not once at module load, so the
        // correct look/theme is guaranteed regardless of render order or
        // a mid-session noteStyle toggle.
        mermaid.initialize(sketch ? SKETCH_CONFIG : CLASSIC_CONFIG);

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
  }, [code, sketch]);

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
      <div
        className={`my-5 flex justify-center rounded-xl p-6 ${
          sketch
            ? "border-[1.8px] border-dashed border-[#1F5C4C]/50 bg-transparent"
            : "border border-[#E6E1D3] bg-white"
        }`}
      >
        <div
          className={`h-5 w-5 animate-spin rounded-full border-2 ${
            sketch ? "border-[#1F5C4C]/20 border-t-[#1F5C4C]" : "border-[#E6E1D3] border-t-[#BD7B24]"
          }`}
        />
      </div>
    );
  }

  // Sketch mode: dashed wobbly-ish border, transparent background so the
  // note's dot-grid paper shows through -- a solid white card here would
  // look like a foreign UI element dropped onto a hand-drawn page.
  if (sketch) {
    return (
      <div
        className="my-6 overflow-x-auto p-5"
        style={{
          border: "1.8px dashed #1F5C4C",
          borderRadius: "16px 120px 16px 120px / 120px 16px 120px 16px",
          background: "transparent",
        }}
      >
        <div className="flex justify-center" dangerouslySetInnerHTML={{ __html: svg }} />
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