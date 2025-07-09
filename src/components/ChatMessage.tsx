import React from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  onCopy: (content: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onCopy }) => {
  const isUser = message.type === 'user';

  return (
    <div className={`group flex gap-3 md:gap-4 p-4 md:p-6 hover:bg-gray-50 transition-colors ${isUser ? 'bg-white' : 'bg-gray-50'}`}>
      <div className="flex-shrink-0">
        <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center ${
          isUser 
            ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
            : 'bg-gradient-to-br from-green-500 to-blue-600'
        }`}>
          {isUser ? <User size={14} className="md:w-4 md:h-4 text-white" /> : <Bot size={14} className="md:w-4 md:h-4 text-white" />}
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 md:mb-2">
          <span className="font-medium text-sm md:text-base text-gray-900">
            {isUser ? 'You' : 'ChatGPT'}
          </span>
          <span className="text-xs text-gray-500">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        
        <div className="prose prose-sm md:prose max-w-none">
          {isUser ? (
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
              {message.content}
            </p>
          ) : (
            <ReactMarkdown 
              className="text-gray-800 leading-relaxed text-sm md:text-base"
              components={{
                code: ({ node, inline, className, children, ...props }) => {
                  if (inline) {
                    return (
                      <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                        {children}
                      </code>
                    );
                  }
                  return (
                    <pre className="bg-gray-900 text-gray-100 p-3 md:p-4 rounded-lg overflow-x-auto my-3">
                      <code className="text-sm" {...props}>
                        {children}
                      </code>
                    </pre>
                  );
                },
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-3">
                    {children}
                  </blockquote>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-1 my-3">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-1 my-3">
                    {children}
                  </ol>
                ),
                h1: ({ children }) => (
                  <h1 className="text-xl md:text-2xl font-bold mt-4 mb-2">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg md:text-xl font-bold mt-3 mb-2">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base md:text-lg font-bold mt-3 mb-1">
                    {children}
                  </h3>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-3">
                    <table className="min-w-full border-collapse border border-gray-300">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-gray-300 px-3 py-2 bg-gray-100 font-semibold text-left">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-gray-300 px-3 py-2">
                    {children}
                  </td>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
        
        {!isUser && (
          <div className="flex items-center gap-1 md:gap-2 mt-3 md:mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onCopy(message.content)}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-md transition-colors"
            >
              <Copy size={12} />
              <span className="hidden sm:inline">Copy</span>
            </button>
            <button className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-md transition-colors">
              <ThumbsUp size={12} />
              <span className="hidden sm:inline">Good</span>
            </button>
            <button className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-md transition-colors">
              <ThumbsDown size={12} />
              <span className="hidden sm:inline">Bad</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;