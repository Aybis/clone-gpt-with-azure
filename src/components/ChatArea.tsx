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
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-gray-50">
        <div className="text-center max-w-md">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
            Hey, Ama. Ready to dive in?
          </h1>
          <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8">
            I'm here to help with questions, creative projects, and more.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-w-2xl">
            <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="font-semibold text-gray-900 mb-1 md:mb-2 text-sm md:text-base">💡 Creative writing</h3>
              <p className="text-xs md:text-sm text-gray-600">Help me write a story about...</p>
            </div>
            <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="font-semibold text-gray-900 mb-1 md:mb-2 text-sm md:text-base">🔍 Research</h3>
              <p className="text-xs md:text-sm text-gray-600">Find information about...</p>
            </div>
            <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="font-semibold text-gray-900 mb-1 md:mb-2 text-sm md:text-base">💻 Code help</h3>
              <p className="text-xs md:text-sm text-gray-600">Debug this code...</p>
            </div>
            <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="font-semibold text-gray-900 mb-1 md:mb-2 text-sm md:text-base">📚 Learning</h3>
              <p className="text-xs md:text-sm text-gray-600">Explain this concept...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="max-w-4xl mx-auto">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onCopy={handleCopy}
          />
        ))}
        
        {isLoading && (
          <div className="flex gap-3 md:gap-4 p-4 md:p-6 bg-gray-50">
            <div className="flex-shrink-0">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-sm md:text-base text-gray-900">ChatGPT</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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