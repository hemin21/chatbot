import { useState } from "react";
import MarkdownRenderer from "./MarkdownRenderer";

/**
 * Individual message bubble — user messages on right, AI on left
 */
export default function MessageBubble({ message, onCopy }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.sender === "user";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onCopy?.("Failed to copy", "error");
    }
  };

  return (
    <div
      className={`flex items-start gap-3 animate-fade-in group ${
        isUser ? "flex-row-reverse" : ""
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${
          isUser ? "bg-gray-600" : "bg-primary-500"
        }`}
      >
        {isUser ? "You" : "AI"}
      </div>

      {/* Message content */}
      <div
        className={`relative max-w-[75%] sm:max-w-[65%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? "bg-primary-500 text-white rounded-tr-sm"
            : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-tl-sm"
        }`}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="text-sm">
            <MarkdownRenderer content={message.content} />
          </div>
        )}

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className={`absolute -bottom-1 ${
            isUser ? "left-0 -translate-x-full" : "right-0 translate-x-full"
          } opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-xs`}
          title="Copy message"
        >
          {copied ? "✓" : "📋"}
        </button>

        {/* Timestamp */}
        <p
          className={`text-[10px] mt-1 ${
            isUser ? "text-primary-200" : "text-gray-400"
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
