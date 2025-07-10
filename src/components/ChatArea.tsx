import React, { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import StreamingText from './StreamingText';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  chatId?: string;
  streamingMessage?: string;
  user?: any;
  onSendMessage?: (message: string) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages, isLoading, chatId, streamingMessage, user, onSendMessage }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatId, streamingMessage]); // Re-scroll when chat changes or streaming

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  // Extract user's first name from email or use "there" as fallback
  const getUserName = () => {
    if (!user?.email) return 'there';
    
    // Try to extract name from email (before @)
    const emailPrefix = user.email.split('@')[0];
    
    // Capitalize first letter and clean up common separators
    const cleanName = emailPrefix
      .replace(/[._-]/g, ' ')
      .split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    return cleanName || 'there';
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (onSendMessage) {
      onSendMessage(suggestion);
    }
  };

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4 md:p-12 bg-zinc-800 md:bg-zinc-100">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-normal mb-6 md:mb-8 leading-tight">
            <span className="text-white md:text-zinc-800">
              Hey, {getUserName()}. Ready to dive in?
            </span>
          </h1>
          <p className="text-base md:text-lg text-zinc-400 md:text-zinc-600 mb-12 md:mb-16 leading-relaxed">
            I'm here to help with questions, creative projects, and more. I'll remember our conversation context to provide better responses.
          </p>
          
          <div className="hidden md:grid grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div 
              onClick={() => handleSuggestionClick("Help me write a story about a mysterious library that appears only at midnight")}
              className="group bg-white border border-zinc-300 p-4 md:p-6 rounded-2xl hover:border-zinc-400 hover:shadow-md transition-all cursor-pointer transform hover:scale-105 active:scale-95"
            >
              <div className="text-xl md:text-2xl mb-2 md:mb-3">💡</div>
              <h3 className="font-semibold text-zinc-900 mb-1 md:mb-2 text-base md:text-lg">Creative writing</h3>
              <p className="text-sm md:text-base text-zinc-600">Help me write a story about... (I'll remember the context)</p>
            </div>
            <div 
              onClick={() => handleSuggestionClick("Find information about the latest developments in artificial intelligence and machine learning")}
              className="group bg-white border border-zinc-300 p-4 md:p-6 rounded-2xl hover:border-zinc-400 hover:shadow-md transition-all cursor-pointer transform hover:scale-105 active:scale-95"
            >
              <div className="text-xl md:text-2xl mb-2 md:mb-3">🔍</div>
              <h3 className="font-semibold text-zinc-900 mb-1 md:mb-2 text-base md:text-lg">Research</h3>
              <p className="text-sm md:text-base text-zinc-600">Find information about... (with conversation memory)</p>
            </div>
            <div 
              onClick={() => handleSuggestionClick("Debug this React component that's not rendering properly and help me understand the issue")}
              className="group bg-white border border-zinc-300 p-4 md:p-6 rounded-2xl hover:border-zinc-400 hover:shadow-md transition-all cursor-pointer transform hover:scale-105 active:scale-95"
            >
              <div className="text-xl md:text-2xl mb-2 md:mb-3">💻</div>
              <h3 className="font-semibold text-zinc-900 mb-1 md:mb-2 text-base md:text-lg">Code help</h3>
              <p className="text-sm md:text-base text-zinc-600">Debug this code... (I'll track our coding discussion)</p>
            </div>
            <div 
              onClick={() => handleSuggestionClick("Explain the concept of quantum computing in simple terms with practical examples")}
              className="group bg-white border border-zinc-300 p-4 md:p-6 rounded-2xl hover:border-zinc-400 hover:shadow-md transition-all cursor-pointer transform hover:scale-105 active:scale-95"
            >
              <div className="text-xl md:text-2xl mb-2 md:mb-3">📚</div>
              <h3 className="font-semibold text-zinc-900 mb-1 md:mb-2 text-base md:text-lg">Learning</h3>
              <p className="text-sm md:text-base text-zinc-600">Explain this concept... (with contextual follow-ups)</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-zinc-800 md:bg-zinc-100">
      <div className="max-w-4xl mx-auto">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onCopy={handleCopy}
          />
        ))}
        
        {(isLoading || streamingMessage) && (
          <div className="group flex gap-3 md:gap-6 p-4 md:p-8 bg-zinc-800 md:bg-zinc-100 border-b border-zinc-700 md:border-zinc-300 hover:bg-zinc-700/50 md:hover:bg-zinc-50 transition-colors min-h-[120px]">
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                <div className="w-4 h-4 text-white font-bold text-xs flex items-center justify-center">G</div>
              </div>
            </div>
            <div className="flex-1 min-w-0 max-w-3xl">
              <div className="flex items-center gap-2 mb-2 md:mb-3">
                <span className="font-semibold text-white md:text-zinc-900">ChatGPT</span>
              </div>
              {streamingMessage ? (
                <div className="prose prose-gray max-w-none">
                  <div className="text-zinc-200 md:text-zinc-800 leading-relaxed text-sm md:text-base">
                    <StreamingText content={streamingMessage} />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1 py-4">
                  <div className="w-2 h-2 bg-zinc-500 md:bg-zinc-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-zinc-500 md:bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-zinc-500 md:bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatArea;