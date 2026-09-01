import { useEffect, useRef, useState } from "react";
import NoteGenerator from "./NoteGenerator";

function VideoPreview({ document, seekTime }) {
  const [startTime, setStartTime] = useState(0);
  const [showNoteGenerator, setShowNoteGenerator] = useState(false);
  const containerRef = useRef(null);
  const seekCounterRef = useRef(0);
  const [seekVersion, setSeekVersion] = useState(0);

  const getVideoId = (url) => {
    if (!url) return null;

    try {
      const parsedUrl = new URL(url);

      if (parsedUrl.hostname.includes("youtu.be")) {
        return parsedUrl.pathname.substring(1).split("/")[0];
      }

      if (parsedUrl.hostname.includes("youtube.com")) {
        return parsedUrl.searchParams.get("v");
      }

      return null;
    } catch {
      return null;
    }
  };

  const videoUrl = document?.sourceUrl || document?.url || document?.source || null;
  const videoId = getVideoId(videoUrl);

  useEffect(() => {
    if (seekTime === null || seekTime === undefined) return;

    seekCounterRef.current += 1;
    setSeekVersion(seekCounterRef.current);
    setStartTime(seekTime);

    containerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [seekTime]);

  if (!videoUrl) {
    return (
      <div className="flex h-full items-center justify-center bg-[#F0EDE4] px-8 text-center">
        <div>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-xl shadow-sm">🎥</div>
          <h3 className="mt-4 text-sm font-semibold text-[#22201A]">Video unavailable</h3>
          <p className="mt-2 text-xs leading-5 text-[#8A8473]">The video URL is not available.</p>
        </div>
      </div>
    );
  }

  if (!videoId) {
    return (
      <div className="flex h-full items-center justify-center bg-[#F0EDE4] px-8 text-center">
        <div>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-xl shadow-sm">🎥</div>
          <h3 className="mt-4 text-sm font-semibold text-[#22201A]">Invalid video URL</h3>
          <p className="mt-2 text-xs leading-5 text-[#8A8473]">The YouTube video URL could not be processed.</p>
        </div>
      </div>
    );
  }

  const embedUrl = startTime > 0
    ? `https://www.youtube.com/embed/${videoId}?start=${startTime}&autoplay=1&rel=0`
    : `https://www.youtube.com/embed/${videoId}?rel=0`;

  return (
    <div ref={containerRef} className="h-full overflow-y-auto bg-[#F0EDE4] p-4">
      <div className="overflow-hidden rounded-xl border border-[#E6E1D3] bg-black shadow-sm">
        <div className="aspect-video w-full">
          <iframe
            key={`${videoId}-${startTime}-${seekVersion}`}
            src={embedUrl}
            title={document?.name || "YouTube video"}
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-[#E6E1D3] bg-white p-4">
        <p className="truncate text-xs font-semibold text-[#22201A]">
          {document?.name || "YouTube Video"}
        </p>

        <p className="mt-1 text-[10px] text-[#8A8473]">
          YouTube · {document?.status || "Indexed"}
        </p>

        {startTime > 0 && (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-[#FBF7EE] px-2 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#BD7B24]" />
            <p className="text-[10px] font-medium text-[#BD7B24]">
              Playing from {Math.floor(startTime / 60).toString().padStart(2, "0")}:
              {(startTime % 60).toString().padStart(2, "0")}
            </p>
          </div>
        )}

        <p className="mt-3 break-words text-[10px] leading-5 text-[#8A8473]">
          {videoUrl}
        </p>

        <button
          type="button"
          onClick={() => setShowNoteGenerator((previous) => !previous)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#22201A] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#3A362C]"
        >
          <span>📝</span>
          {showNoteGenerator ? "Hide Note Options" : "Generate Notes"}
        </button>
      </div>

      {showNoteGenerator && (
        <div className="mt-4 rounded-xl border border-[#E6E1D3] bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#22201A]">Customize Notes</p>
              <p className="mt-1 text-[10px] text-[#8A8473]">
                Choose how you want your video notes generated.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowNoteGenerator(false)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-lg text-[#8A8473] transition hover:bg-[#F7F4EC] hover:text-[#22201A]"
              aria-label="Close note generator"
            >
              ×
            </button>
          </div>

          <NoteGenerator
            document={document}
            onGenerated={(data) => console.log("GENERATED NOTES:", data)}
          />
        </div>
      )}
    </div>
  );
}

export default VideoPreview;