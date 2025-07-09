import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import ChatInput from './components/ChatInput';
import ModelSelector from './components/ModelSelector';
import { Menu } from 'lucide-react';
import { useAI } from './hooks/useAI';
import { getAvailableModels } from './config/ai-providers';

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
  const [selectedModel, setSelectedModel] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { sendMessage, currentProvider } = useAI();

  // Initialize with default model for current provider
  useEffect(() => {
    const availableModels = getAvailableModels(currentProvider);
    if (availableModels.length > 0 && !selectedModel) {
      setSelectedModel(availableModels[0].id);
    }
  }, [currentProvider, selectedModel]);

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

    // Get current chat with all messages for context
    const currentChatWithNewMessage = chats.find(chat => chat.id === chatId);
    const allMessages = currentChatWithNewMessage ? [...currentChatWithNewMessage.messages, userMessage] : [userMessage];
    
    // Convert to AI service format
    const conversationHistory = allMessages.slice(0, -1).map(msg => ({
      role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.content
    }));
    
    // Send message to AI service
    setIsLoading(true);
    
    try {
      const response = await sendMessage(content, selectedModel, conversationHistory);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setChats(prev => prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, messages: [...chat.messages, assistantMessage] }
          : chat
      ));
    } catch (error) {
      console.error('Failed to send message:', error);
      // You could add error handling UI here
    } finally {
      setIsLoading(false);
    }
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