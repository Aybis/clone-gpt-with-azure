import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import ChatInput from './components/ChatInput';
import ModelSelector from './components/ModelSelector';
import { Menu } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Chat {
  id: string;
  title: string;
  timestamp: Date;
  preview: string;
  messages: Message[];
}

function App() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Initialize with sample chats
  useEffect(() => {
    const sampleChats: Chat[] = [
      {
        id: '1',
        title: 'NextResponse redirect vs rewrite',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        preview: 'What is the difference between redirect and rewrite...',
        messages: [
          {
            id: '1-1',
            type: 'user',
            content: 'What is the difference between redirect and rewrite in NextResponse?',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          {
            id: '1-2',
            type: 'assistant',
            content: `Great question! In Next.js, **NextResponse.redirect()** and **NextResponse.rewrite()** serve different purposes:

## NextResponse.redirect()
- Sends a 301/302 HTTP redirect response to the client
- Changes the URL in the browser address bar
- The client makes a new request to the redirect destination
- Visible to the user and search engines

## NextResponse.rewrite()
- Internally forwards the request to a different URL
- Keeps the original URL in the browser address bar
- The client doesn't know about the internal forwarding
- Invisible to the user and search engines

### Example Usage:

\`\`\`javascript
// Redirect - user sees new URL
return NextResponse.redirect(new URL('/login', request.url))

// Rewrite - user keeps original URL
return NextResponse.rewrite(new URL('/api/v2/users', request.url))
\`\`\`

**Use redirect for:** permanent moves, temporary redirects, or when you want users to see the new URL.

**Use rewrite for:** A/B testing, internationalization, or serving different content while keeping the same URL.`,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000)
          }
        ]
      },
      {
        id: '2',
        title: 'Wultra SSL Pinning iOS',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        preview: 'How to implement SSL pinning in iOS with Wultra...',
        messages: [
          {
            id: '2-1',
            type: 'user',
            content: 'How to implement SSL pinning in iOS with Wultra?',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        ]
      },
      {
        id: '3',
        title: 'Dokumentasi API Maya',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        preview: 'Can you help me create API documentation...',
        messages: [
          {
            id: '3-1',
            type: 'user',
            content: 'Can you help me create API documentation for Maya project?',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          }
        ]
      }
    ];
    
    setChats(sampleChats);
  }, []);

  const getCurrentChat = () => {
    return chats.find(chat => chat.id === activeChat);
  };

  const handleNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      timestamp: new Date(),
      preview: '',
      messages: []
    };
    
    setChats(prev => [newChat, ...prev]);
    setActiveChat(newChat.id);
  };

  const handleChatSelect = (chatId: string) => {
    setActiveChat(chatId);
  };

  const handleDeleteChat = (chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    if (activeChat === chatId) {
      setActiveChat(null);
    }
  };

  const handleRenameChat = (chatId: string, newTitle: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, title: newTitle } : chat
    ));
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    let chatId = activeChat;
    
    // Create new chat if none is active
    if (!chatId) {
      const newChat: Chat = {
        id: Date.now().toString(),
        title: content.length > 50 ? content.substring(0, 50) + '...' : content,
        timestamp: new Date(),
        preview: content.length > 100 ? content.substring(0, 100) + '...' : content,
        messages: []
      };
      
      setChats(prev => [newChat, ...prev]);
      chatId = newChat.id;
      setActiveChat(chatId);
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };

    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { 
            ...chat, 
            messages: [...chat.messages, userMessage],
            preview: content.length > 100 ? content.substring(0, 100) + '...' : content,
            title: chat.title === 'New Chat' ? (content.length > 50 ? content.substring(0, 50) + '...' : content) : chat.title
          }
        : chat
    ));

    // Simulate AI response with markdown
    setIsLoading(true);
    
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateMarkdownResponse(content),
        timestamp: new Date()
      };

      setChats(prev => prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, messages: [...chat.messages, assistantMessage] }
          : chat
      ));
      
      setIsLoading(false);
    }, 1500);
  };

  const generateMarkdownResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('code') || lowerInput.includes('programming')) {
      return `# Code Help Response

I'd be happy to help you with **${input}**!

## Key Points:
- Modern development practices emphasize clean, maintainable code
- Component-based architecture makes applications more scalable
- Testing and documentation are crucial for long-term success

### Example Implementation:

\`\`\`javascript
const MyComponent = () => {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // Handle side effects
    fetchData();
  }, [dependencies]);
  
  return (
    <div className="container">
      <h1>Your content here</h1>
    </div>
  );
};
\`\`\`

> **Pro tip:** Always follow established patterns and conventions in your field.

Would you like me to elaborate on any specific aspect?`;
    }

    return `# Response to: "${input}"

I understand you're asking about **${input}**. This is an interesting topic!

## Analysis:

### Key Considerations:
- Context and requirements are crucial for any solution
- Best practices vary depending on your specific use case
- It's important to consider both short-term and long-term implications

### Recommended Approach:

1. **Research**: Gather information from reliable sources
2. **Plan**: Create a structured approach to tackle the problem
3. **Implement**: Start with a minimal viable solution
4. **Iterate**: Refine based on feedback and results

### Additional Insights:

| Aspect | Consideration |
|--------|---------------|
| Scalability | Think about future growth |
| Maintainability | Code should be easy to update |
| User Experience | Always consider the end user |

> **Remember:** Don't forget about accessibility and performance optimization.

**Would you like me to dive deeper into any particular aspect?**`;
  };

  const handleStopGeneration = () => {
    setIsLoading(false);
  };

  const currentChat = getCurrentChat();

  return (
    <div className="flex h-screen bg-zinc-800 md:bg-zinc-100">
      <Sidebar
        chats={chats}
        activeChat={activeChat}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header with Model Selector */}
        <div className="bg-zinc-800 border-b border-zinc-700 p-3 flex-shrink-0">
          <div className={`max-w-4xl mx-auto flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between lg:justify-center'}`}>
            {/* Mobile Menu Button */}
            <div className={`flex items-center gap-2 ${isSidebarCollapsed ? 'absolute left-4' : ''}`}>
              {isSidebarCollapsed && (
                <button
                  onClick={() => setIsSidebarCollapsed(false)}
                  className="hidden lg:block p-2 text-white hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  <Menu size={20} />
                </button>
              )}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 text-white hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <Menu size={20} />
              </button>
            </div>
            
            {/* Model Selector */}
            <ModelSelector 
              selectedModel={selectedModel} 
              onModelSelect={setSelectedModel} 
            />
            
            {/* Spacer for mobile to center the model selector */}
            <div className={`lg:hidden w-10 ${isSidebarCollapsed ? 'hidden' : ''}`}></div>
          </div>
        </div>
        
        <div className="flex-1 min-h-0">
          <ChatArea
            messages={currentChat?.messages || []}
            isLoading={isLoading}
          />
        </div>
        
        <div className="flex-shrink-0">
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onStopGeneration={handleStopGeneration}
          />
        </div>
      </div>
    </div>
  );
}

export default App;