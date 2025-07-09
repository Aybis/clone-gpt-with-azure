import React, { useState, useRef } from 'react';
import { Send, Paperclip, Mic, Square, ArrowUp } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  onStopGeneration: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading, 
  onStopGeneration 
}) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div className="border-t border-zinc-700 md:border-zinc-300 bg-zinc-800 md:bg-zinc-100 p-4 md:p-6 flex-shrink-0">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end gap-2 md:gap-3 bg-zinc-700 md:bg-white border border-zinc-600 md:border-zinc-400 rounded-3xl p-3 md:p-4 shadow-sm focus-within:border-zinc-500 md:focus-within:border-zinc-500 focus-within:shadow-md transition-all">
            <button
              type="button"
              className="p-2 text-zinc-400 md:text-zinc-500 hover:text-zinc-200 md:hover:text-zinc-700 hover:bg-zinc-600 md:hover:bg-zinc-200 rounded-xl transition-colors flex-shrink-0"
            >
              <Paperclip size={20} />
            </button>
            
            <div className="flex-1 min-w-0">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything"
                className="w-full bg-transparent border-none outline-none resize-none text-white md:text-zinc-900 placeholder-zinc-400 md:placeholder-zinc-500 max-h-32 text-base leading-6 py-2"
                rows={1}
                disabled={isLoading}
              />
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={toggleRecording}
                className={`p-2 rounded-xl transition-colors hidden md:block ${
                  isRecording
                    ? 'text-red-500 hover:text-red-600 hover:bg-red-100'
                    : 'text-zinc-400 md:text-zinc-500 hover:text-zinc-200 md:hover:text-zinc-700 hover:bg-zinc-600 md:hover:bg-zinc-200'
                }`}
              >
                <Mic size={20} />
              </button>
              
              {isLoading ? (
                <button
                  type="button"
                  onClick={onStopGeneration}
                  className="p-1.5 md:p-2 text-zinc-400 md:text-zinc-500 hover:text-zinc-200 md:hover:text-zinc-700 hover:bg-zinc-600 md:hover:bg-zinc-200 rounded-xl transition-colors"
                >
                  <Square size={20} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className={`p-1.5 md:p-2 rounded-xl transition-colors ${
                    input.trim()
                      ? 'text-white bg-white hover:bg-zinc-200 md:text-white md:bg-black md:hover:bg-zinc-800'
                      : 'text-zinc-500 bg-zinc-600 md:text-zinc-400 md:bg-zinc-300 cursor-not-allowed'
                  }`}
                >
                  <ArrowUp size={20} className={input.trim() ? 'text-black md:text-white' : ''} />
                </button>
              )}
            </div>
          </div>
        </form>
        
        <div className="flex items-center justify-center mt-2 md:mt-3 text-xs text-zinc-400 md:text-zinc-500">
          <span>ChatGPT can make mistakes. Check important info.</span>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;