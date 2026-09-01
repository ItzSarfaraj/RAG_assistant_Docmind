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

    raise ValueError(
        f"Could not parse a YouTube video ID from: {url}"
    )


def load_video(url: str):
    video_id = _extract_video_id(url)

    try:
        api = YouTubeTranscriptApi()

        transcript_list = api.list(video_id)

        transcript = None

        # Prefer manually created English transcript
        for item in transcript_list:
            if item.language_code == "en" and not item.is_generated:
                transcript = item
                break

        # Then use generated English transcript
        if transcript is None:
            for item in transcript_list:
                if item.language_code == "en":
                    transcript = item
                    break

        # If English is unavailable, use any available transcript
        if transcript is None:
            for item in transcript_list:
                transcript = item
                break

        if transcript is None:
            raise ValueError(
                "No transcript is available for this video."
            )

        transcript_data = transcript.fetch()

    except Exception as error:
        raise ValueError(
            f"Could not fetch a transcript for this video: {error}"
        )

    if not transcript_data:
        raise ValueError(
            "No transcript is available for this video."
        )

    lines = []

    for entry in transcript_data:
        minutes, seconds = divmod(
            int(entry.start),
            60,
        )

        lines.append(
            f"[{minutes:02d}:{seconds:02d}] {entry.text}"
        )

    full_text = "\n".join(lines)

    return [
        Document(
            page_content=full_text,
            metadata={
                "source": url,
                "video_id": video_id,
                "language": transcript.language_code,
                "is_generated": transcript.is_generated,
            },
        )
    ]