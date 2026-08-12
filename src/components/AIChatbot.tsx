import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  id: string;
  sender: "user" | "ai";
  content: string;
  timestamp: Date;
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      content: "Hello! I am your **AI Portfolio Assistant**. I can help you explore Patel Rajeshbhai's **Projects**, **Photography Portfolio**, **Skills**, **Resume**, and **Professional Services**.\n\nHow can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Magnetic button hover offset state
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  // Handle ESC keyboard close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Autofocus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend })
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        content: data.response,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chatbot response error:", error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        sender: "ai",
        content: "I apologize, but I am experiencing difficulty reaching my main server. Please check your network or try asking again in a moment! \n\nYou can also find contact details in the **Farmer Profile** tab.",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(inputValue);
  };

  // Magnetic button calculations
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    // Pull force (max 12px translation)
    const pullX = (mouseX - centerX) * 0.25;
    const pullY = (mouseY - centerY) * 0.25;

    setCoords({ x: pullX, y: pullY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ x: 0, y: 0 });
  };

  // Custom regex markdown inline & block parser
  const parseInlineMarkdown = (text: string) => {
    const parts: React.ReactNode[] = [];
    let currentText = text;
    const regex = /(\[.*?\]\(.*?\))|(\*\*.*?\*\*)/g;
    let match;
    let lastIndex = 0;
    
    while ((match = regex.exec(currentText)) !== null) {
      const matchIndex = match.index;
      
      if (matchIndex > lastIndex) {
        parts.push(currentText.substring(lastIndex, matchIndex));
      }
      
      const fullMatch = match[0];
      if (fullMatch.startsWith("[")) {
        const linkMatch = fullMatch.match(/\[(.*?)\]\((.*?)\)/);
        if (linkMatch) {
          const linkText = linkMatch[1];
          const linkUrl = linkMatch[2];
          parts.push(
            <a
              key={matchIndex}
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 underline font-semibold transition"
            >
              {linkText}
            </a>
          );
        } else {
          parts.push(fullMatch);
        }
      } else if (fullMatch.startsWith("**")) {
        const boldText = fullMatch.substring(2, fullMatch.length - 2);
        parts.push(
          <strong key={matchIndex} className="font-bold text-slate-100">
            {boldText}
          </strong>
        );
      }
      
      lastIndex = regex.lastIndex;
    }
    
    if (lastIndex < currentText.length) {
      parts.push(currentText.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : text;
  };

  const renderMarkdown = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");
    return lines.map((line, index) => {
      if (line.startsWith("### ")) {
        return (
          <h3 key={index} className="text-xs font-bold text-slate-100 mt-2 mb-1 border-b border-white/5 pb-0.5">
            {parseInlineMarkdown(line.slice(4))}
          </h3>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={index} className="text-sm font-extrabold text-emerald-400 mt-3 mb-1">
            {parseInlineMarkdown(line.slice(3))}
          </h2>
        );
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return (
          <li key={index} className="text-[11px] text-slate-300 ml-3 list-disc my-0.5 leading-normal">
            {parseInlineMarkdown(line.slice(2))}
          </li>
        );
      }
      const matchNumbered = line.match(/^(\d+)\.\s(.*)/);
      if (matchNumbered) {
        return (
          <li key={index} className="text-[11px] text-slate-300 ml-3 list-decimal my-0.5 leading-normal">
            {parseInlineMarkdown(matchNumbered[2])}
          </li>
        );
      }
      if (line.trim() === "") {
        return <div key={index} className="h-1.5" />;
      }
      return (
        <p key={index} className="text-[11px] text-slate-200 leading-normal my-1">
          {parseInlineMarkdown(line)}
        </p>
      );
    });
  };

  const suggestedChips = [
    { label: "View My Projects", icon: "terminal" },
    { label: "Photography Portfolio", icon: "photo_library" },
    { label: "About Me", icon: "info" },
    { label: "Skills", icon: "bolt" },
    { label: "Resume", icon: "description" },
    { label: "Services", icon: "business_center" },
    { label: "Contact Me", icon: "mail" }
  ];

  return (
    <div id="ai-chatbot-wrapper" className="relative select-none">
      <AnimatePresence>
        {/* Floating Button Launcher */}
        {!isOpen && (
          <motion.button
            id="chatbot-trigger-btn"
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={() => setIsHovered(true)}
            animate={{
              x: coords.x,
              y: coords.y,
              scale: isHovered ? 1.1 : 1,
            }}
            transition={{
              type: "spring",
              stiffness: 180,
              damping: 15,
              mass: 0.8
            }}
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            exit={{ opacity: 0, scale: 0.5, y: 50 }}
            className="fixed bottom-20 md:bottom-6 right-4 md:right-8 z-50 w-14 h-14 rounded-full flex items-center justify-center cursor-pointer shadow-lg group focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
            style={{
              background: "radial-gradient(circle at 30% 30%, rgba(20, 40, 28, 0.95), rgba(10, 18, 14, 0.98))",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 0 20px 2px rgba(16, 185, 129, 0.2)"
            }}
            title="Chat with AI Assistant"
            aria-label="Open AI Assistant Chatbot"
          >
            {/* Soft Ambient Inner Glow and Ripple Effect */}
            <span className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping duration-3000 pointer-events-none"></span>
            
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Modern Graphic Equalizer Icon */}
              <span className="material-symbols-outlined text-white text-2xl group-hover:rotate-12 transition-transform duration-300">
                smart_toy
              </span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {/* Chat Window Panel */}
        {isOpen && (
          <motion.div
            id="chatbot-window"
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: isMinimized ? "52px" : ""
            }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
            className="fixed bottom-20 md:bottom-6 right-4 md:right-8 z-50 w-[340px] sm:w-[360px] md:w-[380px] max-w-[92vw] rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden text-left"
            style={{
              height: isMinimized ? "52px" : "min(550px, 80vh)",
              background: "rgba(10, 15, 12, 0.94)",
              backdropFilter: "blur(24px)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px rgba(16, 185, 129, 0.08)"
            }}
          >
            {/* Header section */}
            <div 
              className="px-4 py-3 bg-gradient-to-r from-[#0F5238] to-[#0A2E1E] border-b border-white/5 flex justify-between items-center shrink-0 cursor-pointer select-none"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              <div className="flex items-center gap-2.5">
                {/* AI Pulse Avatar */}
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/15 bg-white/5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-400 text-lg">psychology</span>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0F5238] animate-pulse"></span>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white leading-none font-display flex items-center gap-1.5">
                    <span>AI Assistant</span>
                    <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-[9px] rounded-full text-emerald-300 font-normal">Online</span>
                  </h4>
                  <p className="text-[10px] text-emerald-200/60 leading-none mt-1">Patel Rajeshbhai's Portfolio</p>
                </div>
              </div>

              {/* Window State Controls */}
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-300 transition cursor-pointer border-none"
                  title={isMinimized ? "Expand chat" : "Minimize chat"}
                >
                  <span className="material-symbols-outlined text-sm">
                    {isMinimized ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                  </span>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/20 hover:text-red-300 text-slate-300 transition cursor-pointer border-none"
                  title="Close chat"
                  aria-label="Close chatbot window"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            </div>

            {/* Chat Body & Input section (hidden when minimized) */}
            {!isMinimized && (
              <>
                {/* Conversation area */}
                <div 
                  className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin select-text"
                  style={{ scrollbarWidth: "thin" }}
                >
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 items-start max-w-[85%] ${
                        msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                      }`}
                    >
                      {/* Message avatar */}
                      {msg.sender === "ai" && (
                        <div className="w-6 h-6 rounded-full border border-white/10 bg-emerald-950/40 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-emerald-400 text-xs">smart_toy</span>
                        </div>
                      )}

                      {/* Bubble */}
                      <div className="space-y-1">
                        <div
                          className={`px-3 py-2 rounded-2xl shadow-sm text-xs leading-relaxed transition ${
                            msg.sender === "user"
                              ? "bg-emerald-600 text-white rounded-tr-none"
                              : "bg-slate-900/90 text-slate-200 border border-white/5 rounded-tl-none"
                          }`}
                        >
                          {msg.sender === "user" ? (
                            <p className="select-text">{msg.content}</p>
                          ) : (
                            <div className="select-text prose prose-invert max-w-none">
                              {renderMarkdown(msg.content)}
                            </div>
                          )}
                        </div>

                        {/* Timestamp */}
                        <p className={`text-[9px] text-slate-500 ${msg.sender === "user" ? "text-right" : "text-left pl-1"}`}>
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Typing / Loading indicator */}
                  {isLoading && (
                    <div className="flex gap-2.5 items-start max-w-[85%] mr-auto">
                      <div className="w-6 h-6 rounded-full border border-white/10 bg-emerald-950/40 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-emerald-400 text-xs">smart_toy</span>
                      </div>
                      <div className="bg-slate-900/90 px-4 py-3 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-1 h-8">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Suggestions overlay / action chips */}
                <div className="px-4 py-2 bg-black/10 border-t border-white/5 shrink-0 select-none">
                  <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-none" style={{ scrollbarWidth: "none" }}>
                    {suggestedChips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(chip.label)}
                        className="px-2.5 py-1 rounded-full bg-slate-900/60 hover:bg-emerald-950/40 border border-white/10 hover:border-emerald-500/30 text-slate-300 hover:text-emerald-300 text-[10px] font-semibold transition flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[11px]">{chip.icon}</span>
                        <span>{chip.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat footer input form */}
                <form 
                  onSubmit={handleFormSubmit}
                  className="p-3 bg-slate-950/40 border-t border-white/5 flex gap-2 items-center shrink-0"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask about resume, projects, photography..."
                    className="flex-1 h-9 px-3 text-xs bg-slate-900/80 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder-slate-500 selection:bg-emerald-800"
                    aria-label="Type message for AI Portfolio Assistant"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition shrink-0 border-none cursor-pointer ${
                      inputValue.trim() 
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/20 active:scale-95" 
                        : "bg-slate-900 text-slate-600 cursor-not-allowed"
                    }`}
                    aria-label="Send message"
                  >
                    <span className="material-symbols-outlined text-base">send</span>
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
