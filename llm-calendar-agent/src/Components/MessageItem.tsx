import React, { useState } from "react";
import { Bot, User, Copy, Check, Sparkles, Cpu } from "lucide-react";
import Markdown from "react-markdown";
import { Message } from "../types";

interface MessageItemProps {
  message: Message;
  isStreaming?: boolean;
}

export default function MessageItem({ message, isStreaming = false }: MessageItemProps) {
  const isBot = message.role === "assistant";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div
      id={`msg-${message.id}`}
      className={`flex w-full gap-4 p-5 rounded-2xl transition-all duration-200 border ${
        isBot
          ? "bg-white border-slate-100 hover:border-slate-200/80 shadow-xs"
          : "bg-slate-50 border-slate-100 hover:border-slate-200"
      }`}
    >
      {/* Avatar Column */}
      <div className="flex-shrink-0">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
            isBot
              ? "bg-amber-50 text-amber-600 border-amber-100"
              : "bg-slate-200 text-slate-700 border-slate-300"
          }`}
        >
          {isBot ? (
            <Bot size={20} className="stroke-[1.75]" />
          ) : (
            <User size={20} className="stroke-[1.75]" />
          )}
        </div>
      </div>

      {/* Content Column */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-slate-800">
              {isBot ? "Gemma Open Weights LLM" : "You"}
            </span>
            {isBot && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 border border-amber-100">
                <Cpu size={10} />
                {message.modelUsed || "gemma-4-31b-it"}
              </span>
            )}
            {isBot && isStreaming && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-100 animate-pulse">
                streaming
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors"
              title="Copy message content"
            >
              {copied ? (
                <Check size={14} className="text-emerald-600 animate-scale" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>
        </div>

        {/* Message Content Rendered as Styled Markdown */}
        <div className="markdown-body text-slate-700 select-text">
          {message.content ? (
            <Markdown>{message.content}</Markdown>
          ) : (
            <div className="flex items-center gap-2 py-1 text-slate-400 italic">
              <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
              <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
              <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce delay-300"></span>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className="mt-3 flex items-center gap-1 text-[10px] text-slate-400 font-mono">
          <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
}
