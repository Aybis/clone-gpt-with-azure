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
      <div className="h-full flex flex-col items-center justify-center p-6 md:p-12 bg-white">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-normal text-gray-800 mb-6 leading-tight">
            Hey, Ama. Ready to dive in?
          </h1>
          <p className="text-base md:text-lg text-gray-600 mb-12 leading-relaxed">
            I'm here to help with questions, creative projects, and more.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <div className="group bg-white border border-gray-200 p-6 rounded-2xl hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
              <div className="text-2xl mb-3">💡</div>
              <h3 className="font-semibold text-gray-900 mb-2 text-lg">Creative writing</h3>
              <p className="text-gray-600">Help me write a story about...</p>
            </div>
            <div className="group bg-white border border-gray-200 p-6 rounded-2xl hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
              <div className="text-2xl mb-3">🔍</div>
              <h3 className="font-semibold text-gray-900 mb-2 text-lg">Research</h3>
              <p className="text-gray-600">Find information about...</p>
            </div>
            <div className="group bg-white border border-gray-200 p-6 rounded-2xl hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
              <div className="text-2xl mb-3">💻</div>
              <h3 className="font-semibold text-gray-900 mb-2 text-lg">Code help</h3>
              <p className="text-gray-600">Debug this code...</p>
            </div>
            <div className="group bg-white border border-gray-200 p-6 rounded-2xl hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
              <div className="text-2xl mb-3">📚</div>
              <h3 className="font-semibold text-gray-900 mb-2 text-lg">Learning</h3>
              <p className="text-gray-600">Explain this concept...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="max-w-4xl mx-auto">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onCopy={handleCopy}
          />
        ))}
        
        {isLoading && (
          <div className="flex gap-4 md:gap-6 p-6 md:p-8 border-b border-gray-100">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                <div className="w-4 h-4 text-white font-bold text-xs">G</div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-semibold text-gray-900">ChatGPT</span>
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