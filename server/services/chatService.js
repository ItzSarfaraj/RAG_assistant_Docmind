const API_URL = "http://localhost:5000/api";

/**
 * Streams an answer for a question about a document.
 *
 * onToken(text) fires per streamed token — hook this up to update the
 * chat UI live, the way the backend actually delivers it.
 * onSources(sources) fires once, near the end.
 * Returns the final concatenated answer + sources once the stream closes,
 * for callers that just want the finished result (e.g. to pass to
 * saveChatMessage).
 */
const askQuestion = async (question, documentId, token, { onToken, onSources } = {}) => {
  const response = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ question, documentId }),
  });

  if (!response.ok || !response.body) {
    const text = await response.text().catch(() => "");
    let message = "Failed to get answer.";
    try {
      const data = text ? JSON.parse(text) : {};
      message = data.message || message;
    } catch {
      // leave default message
    }
    throw new Error(message);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let answer = "";
  let sources = [];

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() || "";

    for (const event of events) {
      if (!event.startsWith("data:")) continue;

      let parsed;
      try {
        parsed = JSON.parse(event.replace(/^data:\s*/, ""));
      } catch (error) {
        console.error("Failed to parse chat stream event:", error);
        continue;
      }

      if (parsed.type === "token") {
        answer += parsed.content;
        onToken?.(parsed.content);
      } else if (parsed.type === "sources") {
        sources = parsed.sources || [];
        onSources?.(sources);
      } else if (parsed.type === "error") {
        throw new Error(parsed.message || "Failed to get answer.");
      }
    }
  }

  return { answer, sources };
};

export { askQuestion };