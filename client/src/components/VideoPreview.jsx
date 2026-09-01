import { useEffect, useState } from "react";

function VideoPreview({ document, seekTime }) {
  const [startTime, setStartTime] = useState(0);

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

  // Get URL from the document
  const videoUrl =
    document?.sourceUrl || document?.url || document?.source || null;

  const videoId = getVideoId(videoUrl);

  // Handle timestamp click
  useEffect(() => {
    if (seekTime === null || seekTime === undefined) {
      return;
    }

    console.log("VIDEO SEEK RECEIVED:", seekTime);

    setStartTime(seekTime);
  }, [seekTime]);

  if (!videoUrl) {
    return (
      <div className="flex h-full items-center justify-center px-8 text-center">
        <div>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
            🎥
          </div>

          <h3 className="mt-4 text-sm font-semibold text-[#22201A]">
            Video unavailable
          </h3>

          <p className="mt-2 text-xs leading-5 text-[#8A8473]">
            The video URL is not available.
          </p>
        </div>
      </div>
    );
  }

  if (!videoId) {
    return (
      <div className="flex h-full items-center justify-center px-8 text-center">
        <div>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
            🎥
          </div>

          <h3 className="mt-4 text-sm font-semibold text-[#22201A]">
            Invalid video URL
          </h3>

          <p className="mt-2 text-xs leading-5 text-[#8A8473]">
            The YouTube video URL could not be processed.
          </p>
        </div>
      </div>
    );
  }

  const embedUrl =
    startTime > 0
      ? `https://www.youtube.com/embed/${videoId}?start=${startTime}&autoplay=1&rel=0`
      : `https://www.youtube.com/embed/${videoId}?rel=0`;

  return (
    <div className="h-full overflow-y-auto bg-[#F7F4EC] p-4">
      {/* Video */}
      <div className="overflow-hidden rounded-xl border border-[#E6E1D3] bg-black shadow-sm">
        <div className="aspect-video w-full">
          <iframe
            key={`${videoId}-${startTime}`}
            src={embedUrl}
            title={document.name || "YouTube video"}
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>

      {/* Video information */}
      <div className="mt-4 rounded-xl border border-[#E6E1D3] bg-white p-4">
        <p className="truncate text-xs font-semibold text-[#22201A]">
          {document.name || "YouTube Video"}
        </p>

        <p className="mt-1 text-[10px] text-[#8A8473]">
          YouTube · {document.status || "Indexed"}
        </p>

        {startTime > 0 && (
          <p className="mt-2 text-[10px] text-[#BD7B24]">
            Playing from{" "}
            {Math.floor(startTime / 60)
              .toString()
              .padStart(2, "0")}
            :{(startTime % 60).toString().padStart(2, "0")}
          </p>
        )}

        <p className="mt-3 break-words text-[10px] leading-5 text-[#8A8473]">
          {videoUrl}
        </p>
      </div>
    </div>
  );
}

export default VideoPreview;
