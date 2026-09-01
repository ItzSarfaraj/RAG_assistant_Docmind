function TimestampText({ text, onTimestampClick }) {
  if (!text) {
    return null;
  }

  const timestampRegex = /\[(\d{1,2}):(\d{2})(?::(\d{2}))?\]/g;
  const timestamps = [];
  const seen = new Set();

  let match;

  while ((match = timestampRegex.exec(text)) !== null) {
    const first = Number(match[1]);
    const second = Number(match[2]);
    const third = match[3] ? Number(match[3]) : null;

    const seconds =
      third !== null
        ? first * 3600 + second * 60 + third
        : first * 60 + second;

    if (!seen.has(seconds)) {
      seen.add(seconds);
      timestamps.push({
        label: match[0],
        seconds,
      });
    }
  }

  const visibleTimestamps = timestamps.slice(0, 5);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-[10px] text-[#8A8473]">
        Jump to:
      </span>

      {visibleTimestamps.map((timestamp) => (
        <button
          key={timestamp.seconds}
          type="button"
          onClick={() => {
            console.log(
              "TIMESTAMP CLICKED:",
              timestamp.label,
              timestamp.seconds,
            );

            onTimestampClick?.(timestamp.seconds);
          }}
          className="rounded-md bg-[#F3EFE4] px-2 py-1 text-[10px] font-medium text-[#BD7B24] transition hover:bg-[#E9DFC9]"
        >
          {timestamp.label}
        </button>
      ))}
    </div>
  );
}

export default TimestampText;