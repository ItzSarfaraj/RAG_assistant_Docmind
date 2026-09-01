import { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

function VideoSource({ onUploaded }) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!url.trim()) {
      setStatus("Please enter a video URL.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setStatus("Please login before adding a video.");
      return;
    }

    try {
      setLoading(true);
      setStatus("Adding and indexing video...");

      const response = await axios.post(
        `${API_URL}/documents/video`,
        {
          url: url.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setStatus("Video indexed successfully.");
      setUrl("");

      if (onUploaded) {
        onUploaded(response.data.document);
      }
    } catch (error) {
      setStatus(
        error.response?.data?.message ||
          error.message ||
          "Video ingestion failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-12 sm:px-10">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-2xl">
          🎥
        </div>

        <h3 className="mt-5 text-base font-semibold text-zinc-900">
          Add a video
        </h3>

        <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-zinc-500">
          Paste a YouTube video URL and DocMind will use its transcript as a
          knowledge source.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
          <label className="text-[10px] font-semibold text-zinc-600">
            VIDEO URL
          </label>

          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setStatus("");
            }}
            placeholder="https://www.youtube.com/watch?v=..."
            disabled={loading}
            className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-xs text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 disabled:bg-zinc-100"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="mt-3 flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-xs font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Processing..." : "Process Video →"}
        </button>
      </form>

      <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-3">
        <p className="text-[10px] font-semibold text-zinc-600">
          Supported
        </p>

        <p className="mt-1 text-[10px] leading-5 text-zinc-400">
          YouTube videos with an available transcript can be indexed and used
          for question answering.
        </p>
      </div>

      {status && (
        <div className="mt-3 rounded-lg bg-zinc-50 px-3 py-2.5 text-center text-xs text-zinc-600">
          {status}
        </div>
      )}
    </div>
  );
}

export default VideoSource;