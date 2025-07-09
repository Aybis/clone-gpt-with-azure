import React, { useState, useRef } from 'react';
import { Send, Paperclip, Mic, Square } from 'lucide-react';

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
    <div className="border-t border-gray-200 bg-white p-3 md:p-4">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end gap-2 md:gap-3 bg-gray-50 rounded-2xl p-2 md:p-3">
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
            >
              <Paperclip size={18} className="md:w-5 md:h-5" />
            </button>
            
            <div className="flex-1 min-w-0">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                className="w-full bg-transparent border-none outline-none resize-none text-gray-900 placeholder-gray-500 max-h-32 text-sm md:text-base"
                rows={1}
                disabled={isLoading}
              />
            </div>
            
            <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={toggleRecording}
                className={`p-2 rounded-lg transition-colors ${
                  isRecording
                    ? 'text-red-500 hover:text-red-600 hover:bg-red-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Mic size={18} className="md:w-5 md:h-5" />
              </button>
              
              {isLoading ? (
                <button
                  type="button"
                  onClick={onStopGeneration}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Square size={18} className="md:w-5 md:h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className={`p-2 rounded-lg transition-colors ${
                    input.trim()
                      ? 'text-blue-500 hover:text-blue-600 hover:bg-blue-50'
                      : 'text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <Send size={18} className="md:w-5 md:h-5" />
                </button>
              )}
            </div>
          </div>
        </form>
        
        <div className="flex items-center justify-center mt-2 md:mt-3 text-xs text-gray-500">
          <span>ChatGPT can make mistakes. Check important info.</span>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;