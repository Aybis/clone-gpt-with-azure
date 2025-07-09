import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface StreamingTextProps {
  content: string;
  speed?: number;
}

const StreamingText: React.FC<StreamingTextProps> = ({ content, speed = 20 }) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < content.length) {
      const timer = setTimeout(() => {
        setDisplayedContent(content.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timer);
    }
  }, [content, currentIndex, speed]);

  // Reset when content changes
  useEffect(() => {
    setCurrentIndex(0);
    setDisplayedContent('');
  }, [content]);

  return (
    <div className="relative">
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
        {displayedContent}
      </ReactMarkdown>
      
      {/* Typing cursor */}
      {currentIndex < content.length && (
        <span className="inline-block w-2 h-5 bg-blue-500 ml-1 animate-pulse"></span>
      )}
    </div>
  );
};

export default StreamingText;