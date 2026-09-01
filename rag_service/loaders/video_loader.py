import re

from langchain_core.documents import Document
from youtube_transcript_api import YouTubeTranscriptApi


def _extract_video_id(url: str) -> str:
    patterns = [
        r"(?:v=|/)([0-9A-Za-z_-]{11})(?:$|[?&])",
        r"youtu\.be/([0-9A-Za-z_-]{11})",
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    raise ValueError(f"Could not parse a YouTube video ID from: {url}")


def load_video(url: str):
    video_id = _extract_video_id(url)

    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
    except Exception as error:
        raise ValueError(f"Could not fetch a transcript for this video: {error}")

    if not transcript:
        raise ValueError("No transcript is available for this video.")

    # Fold entries into one text blob with inline [mm:ss] markers, then let
    # the normal chunker split it - this keeps timestamps attached to the
    # text they describe without producing hundreds of tiny documents.
    lines = []
    for entry in transcript:
        minutes, seconds = divmod(int(entry["start"]), 60)
        lines.append(f"[{minutes:02d}:{seconds:02d}] {entry['text']}")

    full_text = "\n".join(lines)

    return [
        Document(
            page_content=full_text,
            metadata={"source": url, "video_id": video_id},
        )
    ]