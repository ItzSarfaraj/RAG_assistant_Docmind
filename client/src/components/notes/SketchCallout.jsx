// The dashed, slightly-irregular boxes used for short annotations like
// "Output: 3" or "Time O(n), Space O(n)" in the reference image.
//
// The "hand-drawn" wobble comes from giving each corner a different
// border-radius (a classic CSS trick) rather than a uniform rounded-lg.
// That has to be inline style, not Tailwind, because Tailwind's arbitrary
// value syntax treats "/" as an opacity modifier.

function SketchCallout({ children, color = "#1F5C4C", className = "" }) {
  return (
    <div
      className={`inline-block px-4 py-2 font-['Kalam'] text-[13px] ${className}`}
      style={{
        border: `1.8px dashed ${color}`,
        borderRadius: "9px 180px 9px 180px / 180px 9px 180px 9px",
        color,
        background: "transparent",
      }}
    >
      {children}
    </div>
  );
}

export default SketchCallout;