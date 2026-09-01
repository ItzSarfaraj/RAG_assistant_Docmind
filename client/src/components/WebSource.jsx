import { useState } from "react";
import { addWebDocument } from "../services/documentService";

function WebSource({ onUploaded }) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setStatus("Please enter a URL.");
      return;
    }

    try {
      const parsedUrl = new URL(trimmedUrl);

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        setStatus("Only http/https URLs are supported.");
        return;
      }
    } catch {
      setStatus("Please enter a valid URL.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setStatus("Please login before adding a webpage.");
      return;
    }

    try {
      setLoading(true);
      setStatus("Fetching and indexing webpage...");

      const data = await addWebDocument(trimmedUrl, token);

      setStatus("Webpage indexed successfully.");
      setUrl("");

      if (onUploaded) {
        onUploaded(data.document);
      }
    } catch (error) {
      setStatus(error.message || "Failed to process webpage.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-14 text-center sm:px-10">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-2xl">
        🔗
      </div>

      <h3 className="mt-5 text-base font-semibold text-zinc-900">
        Add a webpage
      </h3>

      <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-zinc-500">
        Paste the URL of an article, documentation page, or research paper.
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setStatus("");
          }}
          placeholder="https://example.com/article"
          disabled={loading}
          className="mt-6 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        />

        <button
          type="submit"
          disabled={!url.trim() || loading}
          className="mt-3 w-full rounded-xl bg-zinc-900 px-4 py-3 text-xs font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Processing..." : "Process Webpage →"}
        </button>
      </form>

      {status && <p className="mt-3 text-xs text-zinc-500">{status}</p>}
    </div>
  );
}

export default WebSource;
