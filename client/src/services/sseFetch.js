// src/utils/sseFetch.js
export async function postSSE(url, body, token, onEvent) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok || !response.body) {
    const text = await response.text().catch(() => "");
    let message = `Request failed (${response.status}).`;
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

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() || "";

    for (const event of events) {
      if (!event.startsWith("data:")) continue;
      try {
        onEvent(JSON.parse(event.replace(/^data:\s*/, "")));
      } catch (error) {
        console.error("Failed to parse SSE event:", error);
      }
    }
  }
}