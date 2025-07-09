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
  chatId?: string;
  streamingMessage?: string;
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages, isLoading, chatId, streamingMessage }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatId, streamingMessage]); // Re-scroll when chat changes or streaming

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4 md:p-12 bg-zinc-800 md:bg-zinc-100">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-normal mb-6 md:mb-8 leading-tight">
            <span className="text-white md:text-zinc-800">
              Hey, Ama. Ready to dive in?
            </span>
          </h1>
          <p className="text-base md:text-lg text-zinc-400 md:text-zinc-600 mb-12 md:mb-16 leading-relaxed">
            I'm here to help with questions, creative projects, and more. I'll remember our conversation context to provide better responses.
          </p>
          
          <div className="hidden md:grid grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="group bg-white border border-zinc-300 p-4 md:p-6 rounded-2xl hover:border-zinc-400 hover:shadow-md transition-all cursor-pointer">
              <div className="text-xl md:text-2xl mb-2 md:mb-3">💡</div>
              <h3 className="font-semibold text-zinc-900 mb-1 md:mb-2 text-base md:text-lg">Creative writing</h3>
              <p className="text-sm md:text-base text-zinc-600">Help me write a story about... (I'll remember the context)</p>
            </div>
            <div className="group bg-white border border-zinc-300 p-4 md:p-6 rounded-2xl hover:border-zinc-400 hover:shadow-md transition-all cursor-pointer">
              <div className="text-xl md:text-2xl mb-2 md:mb-3">🔍</div>
              <h3 className="font-semibold text-zinc-900 mb-1 md:mb-2 text-base md:text-lg">Research</h3>
              <p className="text-sm md:text-base text-zinc-600">Find information about... (with conversation memory)</p>
            </div>
            <div className="group bg-white border border-zinc-300 p-4 md:p-6 rounded-2xl hover:border-zinc-400 hover:shadow-md transition-all cursor-pointer">
              <div className="text-xl md:text-2xl mb-2 md:mb-3">💻</div>
              <h3 className="font-semibold text-zinc-900 mb-1 md:mb-2 text-base md:text-lg">Code help</h3>
              <p className="text-sm md:text-base text-zinc-600">Debug this code... (I'll track our coding discussion)</p>
            </div>
            <div className="group bg-white border border-zinc-300 p-4 md:p-6 rounded-2xl hover:border-zinc-400 hover:shadow-md transition-all cursor-pointer">
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
          <div className="flex gap-3 md:gap-6 p-4 md:p-8 border-b border-zinc-700 md:border-zinc-300">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                <div className="w-4 h-4 text-white font-bold text-xs">G</div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 md:mb-3">
                <span className="font-semibold text-white md:text-zinc-900">ChatGPT</span>
              </div>
              {streamingMessage ? (
                <ChatMessage
                  message={{
                    id: 'streaming',
                    type: 'assistant',
                    content: streamingMessage,
                    timestamp: new Date()
                  }}
                  onCopy={handleCopy}
                  isStreaming={true}
                  streamingContent={streamingMessage}
                />
              ) : (
                <div className="flex items-center gap-1">
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