function WebPreview({ document }) {
  const webUrl =
    document?.sourceUrl || document?.url || document?.source || null;

  const handleOpen = () => {
    if (!webUrl) return;

    window.open(webUrl, "_blank", "noopener,noreferrer");
  };

  if (!webUrl) {
    return (
      <div className="flex h-full items-center justify-center bg-[#F7F4EC] px-6 text-center">
        <div className="max-w-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
            🔗
          </div>

          <h3 className="mt-4 text-sm font-semibold text-[#22201A]">
            Webpage unavailable
          </h3>

          <p className="mt-2 text-xs leading-5 text-[#8A8473]">
            The webpage URL is not available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#F7F4EC]">
      {/* Preview area */}
      <div className="flex min-h-0 flex-1 items-center justify-center px-6">
        <div className="w-full max-w-sm">
          {/* Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#E6E1D3] bg-white text-2xl shadow-sm">
            🔗
          </div>

          {/* Title */}
          <h3 className="mt-5 text-center text-sm font-semibold text-[#22201A]">
            Webpage preview
          </h3>

          {/* Description */}
          <p className="mx-auto mt-2 max-w-xs text-center text-xs leading-5 text-[#8A8473]">
            This webpage cannot be displayed inside DocMind, but its content has
            been indexed and is available for questions.
          </p>

          {/* Open button */}
          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={handleOpen}
              className="inline-flex items-center justify-center rounded-lg bg-[#22201A] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#3A362C]"
            >
              Open webpage ↗
            </button>
          </div>

          {/* Indexed status */}
          <div className="mt-4 flex items-center justify-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6F8B68]" />

            <span className="text-[10px] text-[#5F7658]">
              Content indexed and ready
            </span>
          </div>
        </div>
      </div>

      {/* URL information */}
      <div className="shrink-0 border-t border-[#E6E1D3] bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          {/* URL */}
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#8A8473]">
              Source URL
            </p>

            <p className="mt-1 truncate text-[10px] text-[#75705F]">{webUrl}</p>
          </div>

          {/* Open */}
          <button
            type="button"
            onClick={handleOpen}
            className="shrink-0 rounded-md border border-[#E6E1D3] bg-white px-3 py-1.5 text-[10px] font-medium text-[#75705F] transition hover:bg-[#F7F4EC] hover:text-[#22201A]"
          >
            Open ↗
          </button>
        </div>
      </div>
    </div>
  );
}

export default WebPreview;
