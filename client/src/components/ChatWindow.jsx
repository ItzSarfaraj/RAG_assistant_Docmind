import { useState, useEffect, useRef, useCallback } from "react";
import { streamQuestion } from "../services/chatService";
import {
  getChatHistory,
  saveChatMessage,
} from "../services/chatHistoryService";
import ChatMessage from "./ChatMessage";
import { Mark, FileIcon, SendIcon, DotIcon } from "./Icons";

function ChatWindow({ document, onTimestampClick }) {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesRef = useRef(messages);

  const isVideo = document?.sourceType === "video";
  const isWeb = document?.sourceType === "web";

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Load chat history
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!document?._id) {
        setMessages([]);
        return;
      }

      setMessages([]);
      setQuestion("");
      setIsLoading(false);

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          return;
        }

        const data = await getChatHistory(document._id, token);

        const restoredMessages = (data.messages || []).map((message) => ({
          ...message,
          id: message._id || crypto.randomUUID(),
        }));

        setMessages(restoredMessages);
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    };

    loadChatHistory();
  }, [document?._id]);

  // Send message
  const sendMessage = useCallback(
    async ({ questionText, assistantId }) => {
      try {
        setIsLoading(true);

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Please login before asking questions.");
        }

        let answer = "";
        let sources = [];

        let pendingAnswer = null;
        let rafId = null;

        const flush = () => {
          rafId = null;

          if (pendingAnswer === null) {
            return;
          }

          const toApply = pendingAnswer;
          pendingAnswer = null;

          setMessages((previous) =>
            previous.map((message) =>
              message.id === assistantId
                ? { ...message, content: toApply }
                : message,
            ),
          );
        };

        await streamQuestion({
          question: questionText,
          documentId: document._id,
          token,

          onToken: (chunk) => {
            answer += chunk;
            pendingAnswer = answer;

            if (rafId === null) {
              rafId = requestAnimationFrame(flush);
            }
          },

          onSources: (receivedSources) => {
            sources = receivedSources || [];

            setMessages((previous) =>
              previous.map((message) =>
                message.id === assistantId
                  ? { ...message, sources }
                  : message,
              ),
            );
          },

          onDone: () => {
            if (rafId !== null) {
              cancelAnimationFrame(rafId);
            }

            flush();

            console.log("Answer streaming completed.");
          },
        });

        if (answer.trim()) {
          try {
            await saveChatMessage({
              documentId: document._id,
              role: "assistant",
              content: answer,
              sources,
              token,
            });
          } catch (error) {
            console.error("Failed to save assistant message:", error);
          }
        }
      } catch (error) {
        console.error("Chat error:", error);

        setMessages((previous) =>
          previous.map((message) =>
            message.id === assistantId
              ? {
                  ...message,
                  content: error.message || "Failed to get an answer.",
                }
              : message,
          ),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [document],
  );

  // Submit question
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim() || isLoading) {
      return;
    }

    if (!document?._id) {
      return;
    }

    const currentQuestion = question.trim();
    const userId = crypto.randomUUID();
    const assistantId = crypto.randomUUID();

    setQuestion("");

    setMessages((previous) => [
      ...previous,
      {
        id: userId,
        role: "user",
        content: currentQuestion,
      },
    ]);

    const token = localStorage.getItem("token");

    if (token) {
      try {
        await saveChatMessage({
          documentId: document._id,
          role: "user",
          content: currentQuestion,
          token,
        });
      } catch (error) {
        console.error("Failed to save user message:", error);
      }
    }

    setMessages((previous) => [
      ...previous,
      {
        id: assistantId,
        role: "assistant",
        content: "",
        sources: [],
      },
    ]);

    await sendMessage({
      questionText: currentQuestion,
      assistantId,
    });
  };

  // Regenerate answer
  const handleRegenerate = useCallback(
    async (assistantId) => {
      if (isLoading) {
        return;
      }

      const currentMessages = messagesRef.current;

      const assistantIndex = currentMessages.findIndex(
        (message) => message.id === assistantId,
      );

      if (assistantIndex === -1) {
        return;
      }

      let userMessage = null;

      for (let index = assistantIndex - 1; index >= 0; index--) {
        if (currentMessages[index].role === "user") {
          userMessage = currentMessages[index];
          break;
        }
      }

      if (!userMessage) {
        return;
      }

      const newAssistantId = crypto.randomUUID();

      setMessages((previous) =>
        previous.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                id: newAssistantId,
                content: "",
                sources: [],
              }
            : message,
        ),
      );

      await sendMessage({
        questionText: userMessage.content,
        assistantId: newAssistantId,
      });
    },
    [isLoading, sendMessage],
  );

  // Suggestion
  const handleSuggestion = (text) => {
    if (isLoading) {
      return;
    }

    setQuestion(text);
  };

  // Suggestions
  const suggestions = isVideo
    ? [
        "Summarize this video",
        "What are the main topics?",
        "What are the key points?",
      ]
    : isWeb
      ? [
          "Summarize this webpage",
          "What are the main findings?",
          "What are the key points?",
        ]
      : [
          "Summarize this document",
          "What are the main findings?",
          "What are the key limitations?",
        ];

  const sourceLabel = isVideo
    ? "YouTube Video"
    : isWeb
      ? "Webpage"
      : "Document";

  const composerPlaceholder = isVideo
    ? "Ask anything about this video..."
    : isWeb
      ? "Ask anything about this webpage..."
      : "Ask anything about this document...";

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#F7F4EC]">

      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-[#E6E1D3] bg-white px-5 py-3 sm:px-8">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F7F4EC] text-[#75705F]">
          {isVideo ? "🎥" : isWeb ? "🔗" : <FileIcon width={16} height={16} />}
        </div>

        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-[#22201A]">
            {document?.name || sourceLabel}
          </p>

          <p className="mt-0.5 text-[11px] text-[#75705F]/70">
            {isVideo
              ? "YOUTUBE VIDEO"
              : isWeb
                ? "WEBPAGE"
                : document?.contentType?.toUpperCase() || "FILE"}
            {" · "}
            {document?.status || "Ready"}
          </p>
        </div>

        <div className="ml-auto flex items-center gap-1.5 rounded-full bg-[#EAF0E5] px-2.5 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#55684A]" />

          <span className="text-[11px] font-medium text-[#55684A]">
            Ready
          </span>
        </div>
      </div>

      {/* Chat */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">

            {/* Empty state */}
            {messages.length === 0 && (
              <div className="px-2 pb-6 pt-10 text-center sm:pt-16">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E6E1D3] bg-white text-xl leading-none text-[#BD7B24] shadow-sm">
                  {isVideo ? "🎥" : isWeb ? "🔗" : <Mark />}
                </div>

                <h2 className="mt-5 font-[Fraunces] text-xl font-medium tracking-tight text-[#22201A] sm:text-2xl">
                  {isVideo
                    ? "Ask this video anything"
                    : isWeb
                      ? "Ask this webpage anything"
                      : "Ask this document anything"}
                </h2>

                <p className="mx-auto mt-2 max-w-md text-[13px] leading-6 text-[#75705F]">
                  {isVideo
                    ? "Ask questions, find important moments, or get a summary of this video — DocMind answers from its transcript."
                    : isWeb
                      ? "Ask questions about this webpage and DocMind will answer using the retrieved page content."
                      : "Summaries, definitions, specific figures, or a deep dive on one section — DocMind answers from the text and shows its source."}
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {suggestions.map((text) => (
                    <button
                      key={text}
                      type="button"
                      onClick={() => handleSuggestion(text)}
                      disabled={isLoading}
                      className="rounded-full border border-[#E6E1D3] bg-white px-3.5 py-2 text-[12px] text-[#75705F] shadow-sm transition hover:border-[#BD7B24]/40 hover:text-[#22201A] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="py-2">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isLoading={
                    isLoading &&
                    message.id === messages[messages.length - 1]?.id
                  }
                  onRegenerate={handleRegenerate}
                  onTimestampClick={onTimestampClick}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Composer */}
        <div className="mx-auto w-full max-w-4xl shrink-0 px-4 pb-4 pt-3 sm:px-6">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 rounded-xl border border-[#E6E1D3] bg-white p-1.5 shadow-sm transition focus-within:border-[#BD7B24]/40 focus-within:ring-2 focus-within:ring-[#BD7B24]/10"
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={composerPlaceholder}
              disabled={isLoading}
              className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-[13px] text-[#22201A] outline-none placeholder:text-[#75705F]/50"
            />

            <button
              type="submit"
              disabled={!question.trim() || isLoading}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#22201A] text-white transition hover:bg-[#3A362C] disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Send question"
            >
              {isLoading ? (
                <span className="flex items-center gap-0.5">
                  <DotIcon className="animate-bounce [animation-delay:-0.3s]" />
                  <DotIcon className="animate-bounce [animation-delay:-0.15s]" />
                  <DotIcon className="animate-bounce" />
                </span>
              ) : (
                <SendIcon width={16} height={16} />
              )}
            </button>
          </form>

          <p className="mt-2 text-center text-[10px] text-[#75705F]/50">
            {isVideo
              ? "DocMind answers using the video's transcript."
              : "DocMind uses retrieval-augmented generation to answer from your documents."}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;