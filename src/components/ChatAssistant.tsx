import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Loader2, Sparkles, User, ShieldCheck } from "lucide-react";
import { ChatMessage } from "../types";

interface ChatAssistantProps {
  contextType: "portfolio" | "resume";
  contextContent: string;
  targetRole: string;
}

export default function ChatAssistant({ contextType, contextContent, targetRole }: ChatAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: `Hello! I have scanned your ${contextType} for the **${targetRole}** role. You can ask me to write a professional summary, polish your project details, recommend action words, or prioritize immediate changes. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested Prompts
  const suggestedQuestions = contextType === "portfolio" 
    ? [
        "Improve my project description.",
        "What should I fix first?",
        "How can I improve my Data Analyst portfolio?",
        "Write a recruiter elevator pitch."
      ]
    : [
        "Improve my professional summary.",
        "How can I improve this resume?",
        "Recommend ATS keywords to add.",
        "What is my biggest ATS formatting issue?"
      ];

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    if (!text || text.trim() === "") return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      const chatHistory = [...messages, userMsg].map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatHistory,
          contextType,
          contextContent,
          targetRole,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate response.");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "assistant",
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "assistant",
          text: "I apologize, but I encountered an issue accessing my AI services. Please try asking again shortly.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-[#fbfaf8] border border-[#e8d8c8] rounded-2xl shadow-md overflow-hidden flex flex-col h-[550px]">
      {/* Header Banner */}
      <div className="bg-[#5c4033] p-4 text-[#faf9f6] flex items-center justify-between border-b border-[#3d2314]">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#faf9f6]/15 flex items-center justify-center text-[#f5eedc]">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold">Interactive Career Lens Coach</h4>
            <p className="text-[10px] text-[#faf9f6]/70 font-medium">Context-grounded professional feedback</p>
          </div>
        </div>
        <div className="flex items-center space-x-1 text-[10px] bg-[#faf9f6]/10 px-2.5 py-1 rounded-full text-[#f5eedc] border border-white/5">
          <ShieldCheck className="w-3 h-3 text-green-400" />
          <span>Encrypted Session</span>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-[#faf9f6]/50">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`flex items-start max-w-[85%] space-x-2 ${msg.sender === "user" ? "flex-row-reverse space-x-reverse" : "flex-row"}`}>
              {/* Avatar Icon */}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs border shrink-0 ${
                msg.sender === "user" 
                  ? "bg-[#faf9f6] border-[#e8d8c8] text-[#5c4033]" 
                  : "bg-[#5c4033] border-[#3d2314] text-[#faf9f6]"
              }`}>
                {msg.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
              </div>

              {/* Message Bubble */}
              <div className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                msg.sender === "user" 
                  ? "bg-[#5c4033] text-[#faf9f6] rounded-tr-none shadow-sm" 
                  : "bg-white border border-[#e8d8c8] text-[#3d2314] rounded-tl-none shadow-sm"
              }`}>
                {/* Process text with primitive Markdown parser for bold styling */}
                <div className="whitespace-pre-line prose max-w-none">
                  {msg.text.split("**").map((part, i) => i % 2 === 1 ? <strong key={i} className={msg.sender === "user" ? "text-white" : "text-[#5c4033]"}>{part}</strong> : part)}
                </div>
                <div className={`text-[9px] mt-1.5 text-right ${msg.sender === "user" ? "text-[#faf9f6]/60" : "text-[#705245]"}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start max-w-[80%] space-x-2">
              <div className="w-7 h-7 rounded-full bg-[#5c4033] flex items-center justify-center text-xs shrink-0 text-[#faf9f6]">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="bg-white border border-[#e8d8c8] p-4 rounded-2xl rounded-tl-none shadow-sm text-sm text-[#705245] flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#8c6239]" />
                <span>Coach is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggestions */}
      <div className="p-3 border-t border-[#e8d8c8]/60 bg-[#fbfaf8] flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none shrink-0">
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(q)}
            className="px-3 py-1.5 rounded-full border border-[#e8d8c8] bg-white hover:bg-[#f4f0ea] text-xs text-[#5c4033] transition-colors cursor-pointer inline-block shadow-sm"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input controls */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputText);
        }}
        className="p-3 bg-white border-t border-[#e8d8c8] flex items-center space-x-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Ask about your ${contextType}...`}
          disabled={isTyping}
          className="flex-grow px-4 py-2.5 rounded-xl border border-[#e8d8c8] bg-white text-[#3d2314] text-sm placeholder-[#a08a75]/70 focus:outline-none focus:border-[#8c6239] transition-colors disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isTyping}
          className="w-10 h-10 rounded-xl bg-[#5c4033] hover:bg-[#3d2314] text-white flex items-center justify-center shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
