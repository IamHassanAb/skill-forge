import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function ChatPanel({ messages = [], onSend, isLoading = false }) {
  const [inputText, setInputText] = useState("");
  const [attachedImage, setAttachedImage] = useState(null);
  const endOfMessagesRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll to the bottom when messages update or loading state changes
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((!inputText.trim() && !attachedImage) || isLoading) return;
    
    onSend(inputText.trim(), attachedImage?.base64, attachedImage?.mimeType);
    setInputText("");
    setAttachedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      setAttachedImage({ 
        base64, 
        mimeType: file.type,
        preview: reader.result
      });
    };
    reader.readAsDataURL(file);
    // Clear the value so the same file can be selected again if needed
    e.target.value = "";
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChipClick = (text) => {
    if (isLoading) return;
    onSend(text);
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0d0d] overflow-hidden">
      {/* Scrollable Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[70%] font-mono text-sm p-3 rounded-lg flex-shrink-0 break-words ${
              msg.role === 'user'
                ? 'ml-auto bg-accent/10 border border-accent/30 text-white'
                : 'mr-auto bg-zinc-900 border border-zinc-700 text-zinc-300'
            }`}
          >
            {msg.imagePreview && (
              <img 
                src={msg.imagePreview} 
                alt="Uploaded attachment" 
                className="max-h-48 max-w-sm object-cover rounded-lg border border-accent/30 mb-2"
              />
            )}
            {msg.role === 'user' ? (
              msg.text
            ) : (
              <div className="prose prose-invert prose-sm font-mono max-w-none">
                <ReactMarkdown>
                  {msg.text}
                </ReactMarkdown>
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="mr-auto max-w-[70%] bg-zinc-900 border border-zinc-700 text-zinc-300 font-mono text-sm p-3 rounded-lg flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-zinc-500 animate-typeIndicator" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-zinc-500 animate-typeIndicator" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-zinc-500 animate-typeIndicator" style={{ animationDelay: '300ms' }} />
          </div>
        )}
        
        {/* Invisible anchor for auto-scrolling */}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input Bar */}
      <div className="flex-shrink-0 border-t border-zinc-800 p-4 bg-[#0d0d0d] flex flex-col">
        {/* Suggestion Chips */}
        {messages.length <= 1 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {["📷 I have a camera, let's start", "📖 Start with theory", "🖼️ Review my photo"].map((chip, i) => (
              <button
                key={i}
                onClick={() => handleChipClick(chip)}
                className="bg-zinc-900 border border-zinc-700 hover:border-accent hover:text-accent text-zinc-400 font-mono text-xs px-3 py-2 rounded-full cursor-pointer transition-colors duration-200"
                disabled={isLoading}
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Attachment Preview Area */}
        {attachedImage && (
          <div className="relative mb-3 self-start">
            <img 
              src={attachedImage.preview} 
              alt="Preview" 
              className="h-16 w-16 object-cover rounded-lg border border-accent/30"
            />
            <button 
              onClick={() => {
                setAttachedImage(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="absolute -top-2 -right-2 bg-zinc-800 text-zinc-400 rounded-full w-5 h-5 flex items-center justify-center text-xs hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center">
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleImageSelect} 
            className="hidden" 
          />
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-zinc-400 hover:text-accent transition-colors mr-2 text-lg font-mono focus:outline-none"
            disabled={isLoading}
          >
            📎
          </button>
          <input
            type="text"
            className="flex-1 bg-zinc-900 border border-zinc-700 text-white font-mono p-3 rounded-lg focus:border-accent focus:outline-none transition-colors"
            placeholder="Type your message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-accent text-black font-bold font-mono px-4 py-2 rounded-lg ml-2 disabled:opacity-40 transition-opacity whitespace-nowrap"
            disabled={isLoading || (!inputText.trim() && !attachedImage)}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
