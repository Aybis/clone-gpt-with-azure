import React from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Copy, ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react';
import StreamingText from './StreamingText';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  onCopy: (content: string) => void;
  isStreaming?: boolean;
  streamingContent?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  onCopy, 
  isStreaming = false, 
  streamingContent = '' 
}) => {
  const isUser = message.type === 'user';

  if (isUser) {
    // User messages - right aligned
    return (
      <div className="group flex justify-end gap-3 md:gap-6 p-4 md:p-8 bg-zinc-800 md:bg-zinc-50 border-b border-zinc-700 md:border-zinc-300 hover:bg-zinc-700/50 md:hover:bg-zinc-50 transition-colors">
        <div className="flex-1 min-w-0 max-w-3xl">
          <div className="flex items-center justify-end gap-2 mb-2 md:mb-3">
            <span className="font-semibold text-white md:text-zinc-900">You</span>
          </div>
          
          <div className="flex justify-end">
            <div className="bg-blue-600 text-white p-3 md:p-4 rounded-2xl rounded-br-md max-w-full">
              <p className="leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                {message.content}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
        </div>
      </div>
    );
  }

  // AI messages - left aligned with centered icon
  return (
    <div className="group flex gap-3 md:gap-6 p-4 md:p-8 bg-zinc-800 md:bg-zinc-100 border-b border-zinc-700 md:border-zinc-300 hover:bg-zinc-700/50 md:hover:bg-zinc-50 transition-colors">
      <div className="flex-shrink-0 flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
          <div className="w-4 h-4 text-white font-bold text-xs flex items-center justify-center">G</div>
        </div>
      </div>
      
      <div className="flex-1 min-w-0 max-w-3xl">
        <div className="flex items-center gap-2 mb-2 md:mb-3">
          <span className="font-semibold text-white md:text-zinc-900">ChatGPT</span>
        </div>
        
        <div className="prose prose-gray max-w-none">
          <div className="text-zinc-200 md:text-zinc-800 leading-relaxed text-sm md:text-base">
            {isStreaming ? (
              <StreamingText content={streamingContent} />
            ) : (
              <ReactMarkdown 
                components={{
                  code: ({ node, inline, children, ...props }) => {
                    if (inline) {
                      return (
                        <code className="bg-zinc-700 md:bg-zinc-200 px-1.5 py-0.5 rounded text-sm font-mono text-zinc-200 md:text-zinc-800" {...props}>
                          {children}
                        </code>
                      );
                    }
                    return (
                      <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg overflow-x-auto my-4">
                        <code className="text-xs md:text-sm" {...props}>
                          {children}
                        </code>
                      </pre>
                    );
                  },
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-zinc-600 md:border-zinc-400 pl-4 italic text-zinc-300 md:text-zinc-700 my-4">
                      {children}
                    </blockquote>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-1 md:space-y-2 my-3 md:my-4">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside space-y-1 md:space-y-2 my-3 md:my-4">
                      {children}
                    </ol>
                  ),
                  h1: ({ children }) => (
                    <h1 className="text-xl md:text-2xl font-bold mt-4 md:mt-6 mb-3 md:mb-4 text-white md:text-zinc-900">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-lg md:text-xl font-bold mt-4 md:mt-5 mb-2 md:mb-3 text-white md:text-zinc-900">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-base md:text-lg font-bold mt-3 md:mt-4 mb-2 text-white md:text-zinc-900">
                      {children}
                    </h3>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-3 md:my-4">
                      <table className="min-w-full border-collapse border border-zinc-600 md:border-zinc-400 rounded-lg">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border border-zinc-600 md:border-zinc-400 px-2 md:px-4 py-1 md:py-2 bg-zinc-700 md:bg-zinc-100 font-semibold text-left text-white md:text-zinc-900 text-sm md:text-base">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-zinc-600 md:border-zinc-400 px-2 md:px-4 py-1 md:py-2 text-zinc-200 md:text-zinc-800 text-sm md:text-base">
                      {children}
                    </td>
                  ),
                  p: ({ children }) => (
                    <p className="mb-3 md:mb-4 last:mb-0 leading-relaxed">
                      {children}
                    </p>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        </div>
        
        {!isStreaming && (
          <div className="flex items-center gap-1 md:gap-2 mt-3 md:mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onCopy(message.content)}
              className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm text-zinc-400 md:text-zinc-600 hover:text-zinc-200 md:hover:text-zinc-800 hover:bg-zinc-700 md:hover:bg-zinc-200 rounded-lg transition-all transform hover:scale-105 active:scale-95"
            >
              <Copy size={12} className="md:w-3.5 md:h-3.5" />
              Copy
            </button>
            <button className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm text-zinc-400 md:text-zinc-600 hover:text-zinc-200 md:hover:text-zinc-800 hover:bg-zinc-700 md:hover:bg-zinc-200 rounded-lg transition-all transform hover:scale-105 active:scale-95">
              <ThumbsUp size={12} className="md:w-3.5 md:h-3.5" />
              Good
            </button>
            <button className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm text-zinc-400 md:text-zinc-600 hover:text-zinc-200 md:hover:text-zinc-800 hover:bg-zinc-700 md:hover:bg-zinc-200 rounded-lg transition-all transform hover:scale-105 active:scale-95">
              <ThumbsDown size={12} className="md:w-3.5 md:h-3.5" />
              Bad
            </button>
            <button className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm text-zinc-400 md:text-zinc-600 hover:text-zinc-200 md:hover:text-zinc-800 hover:bg-zinc-700 md:hover:bg-zinc-200 rounded-lg transition-all transform hover:scale-105 active:scale-95">
              <RotateCcw size={12} className="md:w-3.5 md:h-3.5" />
              Regenerate
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;