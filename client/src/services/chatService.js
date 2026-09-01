const API_URL = "http://localhost:5000/api";

// Slightly above the backend's MAX_STREAM_SECONDS (45s) so the backend's
// own cutoff message always has a chance to arrive first; this timeout is
// only a fallback for a stalled connection that never sends anything back.
const STREAM_TIMEOUT_MS = 60000;

const streamQuestion = async ({
  question,
  documentId,
  token,
  onToken,
  onSources,
  onDone,
}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        question,
        documentId,
      }),

      signal: controller.signal,
    });

    if (!response.ok) {
      let message = "Failed to get answer.";

      try {
        const errorData = await response.json();
        message = errorData.message || message;
      } catch {
        // Response wasn't JSON
      }

      throw new Error(message);
    }

    if (!response.body) {
      throw new Error("Streaming is not supported by this browser.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        break;
      }

      // Any activity resets the timeout - we only want to abort a truly
      // dead connection, not a slow-but-still-streaming one.
      clearTimeout(timeoutId);
      setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS);

      buffer += decoder.decode(value, {
        stream: true,
      });

      const events = buffer.split("\n\n");

      buffer = events.pop() || "";

      for (const event of events) {
        if (!event.startsWith("data:")) {
          continue;
        }

        const data = event.replace(/^data:\s*/, "");

        let parsed;

        try {
          parsed = JSON.parse(data);
        } catch (error) {
          console.error("Invalid stream data:", data);

          continue;
        }

        if (parsed.type === "token") {
          onToken?.(parsed.content);
        }

        if (parsed.type === "sources") {
          onSources?.(parsed.sources);
        }

        if (parsed.type === "done") {
          onDone?.();
        }

        if (parsed.type === "error") {
          throw new Error(parsed.message || "RAG streaming failed.");
        }
      }
    }
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("The response took too long and was stopped. Please try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

export { streamQuestion };