import React, { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4 md:p-12 bg-gray-900 md:bg-white">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-normal mb-6 md:mb-8 leading-tight">
            <span className="text-white md:text-gray-800">
              Hey, Ama. Ready to dive in?
            </span>
          </h1>
          <p className="text-base md:text-lg text-gray-400 md:text-gray-600 mb-12 md:mb-16 leading-relaxed">
            I'm here to help with questions, creative projects, and more.
          </p>
          
          <div className="hidden md:grid grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="group bg-white border border-gray-200 p-4 md:p-6 rounded-2xl hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
              <div className="text-xl md:text-2xl mb-2 md:mb-3">💡</div>
              <h3 className="font-semibold text-gray-900 mb-1 md:mb-2 text-base md:text-lg">Creative writing</h3>
              <p className="text-sm md:text-base text-gray-600">Help me write a story about...</p>
            </div>
            <div className="group bg-white border border-gray-200 p-4 md:p-6 rounded-2xl hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
              <div className="text-xl md:text-2xl mb-2 md:mb-3">🔍</div>
              <h3 className="font-semibold text-gray-900 mb-1 md:mb-2 text-base md:text-lg">Research</h3>
              <p className="text-sm md:text-base text-gray-600">Find information about...</p>
            </div>
            <div className="group bg-white border border-gray-200 p-4 md:p-6 rounded-2xl hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
              <div className="text-xl md:text-2xl mb-2 md:mb-3">💻</div>
              <h3 className="font-semibold text-gray-900 mb-1 md:mb-2 text-base md:text-lg">Code help</h3>
              <p className="text-sm md:text-base text-gray-600">Debug this code...</p>
            </div>
            <div className="group bg-white border border-gray-200 p-4 md:p-6 rounded-2xl hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
              <div className="text-xl md:text-2xl mb-2 md:mb-3">📚</div>
              <h3 className="font-semibold text-gray-900 mb-1 md:mb-2 text-base md:text-lg">Learning</h3>
              <p className="text-sm md:text-base text-gray-600">Explain this concept...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-900 md:bg-white">
      <div className="max-w-4xl mx-auto">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onCopy={handleCopy}
          />
        ))}
        
        {isLoading && (
          <div className="flex gap-3 md:gap-6 p-4 md:p-8 border-b border-gray-800 md:border-gray-100">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                <div className="w-4 h-4 text-white font-bold text-xs">G</div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 md:mb-3">
                <span className="font-semibold text-white md:text-gray-900">ChatGPT</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-500 md:bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 md:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-500 md:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatArea;