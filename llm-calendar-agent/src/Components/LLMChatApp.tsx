import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { streamAgentChat } from '../services/agentApi';

import ReactMarkdown from "react-markdown";

interface MessageItem {
  role: "user" | "assistant";
  content: string;
  thinking?: string;      
  isCollapsed?: boolean;  
}


export default function LLMChatApp() {
  const initialMessages: MessageItem[] = [
    {
      role: "assistant",
      content: "Hi! I am the **Gemma AI Agent**. Ask me a query (e.g., `Schedule a dinner next Monday at 7:00 PM`), and I will execute custom tools live!",
    }
  ];

  // Functional States
  const [messages, setMessages] = useState<MessageItem[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [currentThinking, setCurrentThinking] = useState("");
  const [currentResponse, setCurrentResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Live streaming visibility tracking
  const [isLiveThinkingCollapsed, setIsLiveThinkingCollapsed] = useState(false);

  const convoAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Smooth scroll tracking across token dispatches
  useEffect(() => {
    if (convoAreaRef.current) {
      convoAreaRef.current.scrollTop = convoAreaRef.current.scrollHeight;
    }
  }, [currentThinking, currentResponse, messages, isLoading]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const cleanInput = inputText.trim();
    const userMessage: MessageItem = { role: "user", content: cleanInput };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);
    setCurrentThinking("");
    setCurrentResponse("");
    setIsLiveThinkingCollapsed(false);

    const fullConversationHistory = [...messages, userMessage];

    let liveThinkingBuffer = "";
    let liveContentBuffer = "";

    try {
      await streamAgentChat(
        fullConversationHistory,
        (thinkToken) => {
          liveThinkingBuffer += thinkToken;
          setCurrentThinking((prev) => prev + thinkToken);
        },
        (contentToken) => {
          liveContentBuffer += contentToken;
          setCurrentResponse((prev) => prev + contentToken);
        },
        () => {
          setMessages((prev) => [
            ...prev,
            { 
              role: "assistant", 
              content: liveContentBuffer.trim() ? liveContentBuffer : "Task complete.",
              thinking: liveThinkingBuffer.trim() ? liveThinkingBuffer : undefined,
              isCollapsed: true 
            }
          ]);
          setCurrentThinking("");
          setCurrentResponse("");
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error("Agent execution breakdown:", error);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const toggleHistoryThinkingCollapse = (index: number) => {
    setMessages((prev) =>
      prev.map((m, idx) => (idx === index ? { ...m, isCollapsed: !m.isCollapsed } : m))
    );
  };

  const handleReset = () => {
    if (isLoading) return;
    setMessages(initialMessages);
    setCurrentThinking("");
    setCurrentResponse("");
  };

  return (
    <div id="app_root" className="w-full max-w-[380px] flex flex-col items-center justify-center font-sans antialiased text-[#333333]">
      <div
        id="chat_container"
        className="w-full h-[540px] bg-white border-2 border-[#1d3766] rounded-[5px] flex flex-col justify-between p-[14px] relative"
        style={{ boxSizing: "border-box" }}
      >
        <div className="flex flex-col flex-grow overflow-hidden">
          {/* Header Area */}
          <div id="chat_header_row" className="flex items-center justify-between mb-5 select-none">
            <div className="flex items-center gap-2">
              <div id="chat_header" className="font-bold text-[#333333] text-[19px] leading-none text-left">
                Gemma4
              </div>
            </div>
            <button
              id="reset_btn"
              onClick={handleReset}
              disabled={isLoading}
              className={`text-[12px] font-medium transition-colors ${
                isLoading ? "text-gray-300 cursor-not-allowed" : "text-gray-400 hover:text-[#2f5fb5] cursor-pointer"
              }`}
            >
              Reset Chat
            </button>
          </div>

          {/* Conversation Core */}
          <div ref={convoAreaRef} className="flex flex-col flex-grow overflow-y-auto pr-1">
            {messages.map((item, index) => {
              if (item.role === "user") {
                return (
                  <div key={`hist_user_${index}`} className="flex justify-end mb-4">
                    <div className="bg-[#ece8e8] text-[#333333] rounded-[15px] px-[20px] py-[12px] text-[15px] max-w-[85%] text-left whitespace-pre-line">
                      {item.content}
                    </div>
                  </div>
                );
              }

              if (item.role === "assistant") {
                return (
                  <div key={`hist_assistant_wrapper_${index}`} className="flex flex-col items-start w-full mb-4">
                    {/* Persistent Historical Thinking Block */}
                    {item.thinking && (
                      <div className="mb-2 text-[#333333] text-[14px] leading-[1.4] text-left w-full">
                        <div
                          className="flex items-center gap-1.5 py-1 text-gray-400 hover:text-blue-600 cursor-pointer select-none text-[13px] font-medium"
                          onClick={() => toggleHistoryThinkingCollapse(index)}
                        >
                          <span>{item.isCollapsed ? "▶" : "▼"}</span>
                          <span>
                            {item.isCollapsed
                              ? "Gemma4 Reasoned Step-by-Step (Show)"
                              : "Gemma4 Reasoning Track (Hide)"}
                          </span>
                        </div>

                        {!item.isCollapsed && (
                          <div className="mt-[6px] pl-[10px] max-h-[200px] border-l-2 border-gray-100 font-normal overflow-y-auto text-gray-400 italic text-[13px] markdown-body">
                            <ReactMarkdown>{item.thinking}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Assistant Message Bubble with Markdown rendering */}
                    <div className="text-[#333333] text-[15px] leading-relaxed w-full text-left markdown-body">
                      <ReactMarkdown>{item.content}</ReactMarkdown>
                    </div>
                  </div>
                );
              }
              return null;
            })}

            {/* Live Streaming Blocks Container */}
            {isLoading && (
              <>
                {currentThinking && (
                  <div className="mb-4 text-[#333333] text-[14px] leading-[1.4] text-left">
                    <div
                      className="flex items-center gap-1.5 py-1 text-gray-400 hover:text-blue-600 cursor-pointer select-none text-[13px] font-medium"
                      onClick={() => setIsLiveThinkingCollapsed(!isLiveThinkingCollapsed)}
                    >
                      <span>{isLiveThinkingCollapsed ? "▶" : "▼"}</span>
                      <span>
                        {isLiveThinkingCollapsed ? "Gemma4 Reasoned Step-by-Step (Show)" : "Gemma4 Reasoning Track (Hide)"}
                      </span>
                      {!currentResponse && (
                        <span className="text-[11px] bg-blue-100 text-[#2f5fb5] px-1.5 py-0.5 rounded animate-pulse ml-2">
                          thinking...
                        </span>
                      )}
                    </div>

                    {!isLiveThinkingCollapsed && (
                      <div className="mt-[9px] pl-[10px] max-h-[300px] border-l-2 border-gray-100 font-normal overflow-y-auto text-gray-500 italic markdown-body">
                        <ReactMarkdown>{currentThinking}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                )}

                {/* Live Output Response Block with Markdown rendering */}
                {currentResponse && (
                  <div className="text-[#333333] text-[15px] leading-relaxed w-full mb-4 text-left self-start markdown-body">
                    <ReactMarkdown>{currentResponse}</ReactMarkdown>
                  </div>
                )}
              </>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Action Input Box Row */}
        <div id="input_wrapper" className="mt-4">
          <div className="flex items-center h-[42px] bg-white border border-[#1d3766] rounded px-1 justify-between">
            <input
              id="chat_text_input"
              type="text"
              className="flex-grow bg-transparent border-none text-[15px] text-[#333333] px-3 outline-none h-full placeholder-gray-400"
              placeholder={isLoading ? "Thinking/Executing..." : "Type a custom query..."}
              value={inputText}
              disabled={isLoading}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button
              id="send_btn"
              disabled={isLoading || !inputText.trim()}
              onClick={handleSend}
              className={`font-medium text-[14px] px-4 py-1.5 rounded h-[32px] flex items-center justify-center transition-colors ${
                isLoading || !inputText.trim()
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-[#2f5fb5] text-white hover:bg-[#204994] cursor-pointer"
              }`}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}