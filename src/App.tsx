import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import ChatInput from './components/ChatInput';
import ModelSelector from './components/ModelSelector';
import AuthModal from './components/AuthModal';
import UpgradeModal from './components/UpgradeModal';
import { Menu } from 'lucide-react';
import { useAI } from './hooks/useAI';
import { useDatabase } from './hooks/useDatabase';
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
  const [streamingMessage, setStreamingMessage] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const { sendMessage, currentProvider } = useAI();
  const { 
    user, 
    isAuthenticated, 
    subscription,
    loadChats, 
    loadChatWithMessages,
    createChat, 
    updateChat, 
    deleteChat, 
    addMessage,
    signIn, 
    signUp, 
    signOut,
    upgradeToPlusSubscription,
    isLoading: dbLoading,
    error: dbError,
    clearError
  } = useDatabase();
  
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { sendMessage, currentProvider, handleModelChange } = useAI();

  // Initialize with default model for current provider
  useEffect(() => {
    const availableModels = getAvailableModels(currentProvider);
    if (availableModels.length > 0 && !selectedModel) {
      setSelectedModel(availableModels[0].id);
    }
  }, [currentProvider, selectedModel]);

  // Load chats from database when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadChats().then(setChats);
    } else {
      setChats([]);
      setActiveChat(null);
    }
  }, [isAuthenticated, loadChats]);

  // Show auth modal if not authenticated and trying to use the app
  useEffect(() => {
    if (!isAuthenticated && !showAuthModal && chats.length === 0 && user === null) {
      setShowAuthModal(true);
    }
  }, [isAuthenticated, showAuthModal]);

  // Hide auth modal when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && showAuthModal) {
      setShowAuthModal(false);
    }
  }, [isAuthenticated, showAuthModal]);

  const getCurrentChat = () => {
    return chats.find(chat => chat.id === activeChat);
  };

  const handleNewChat = async () => {
    if (!isAuthenticated && user === null) {
      setShowAuthModal(true);
      return;
    }

    // Check chat limit for free users
    if (subscription?.plan === 'free' && subscription.current_count >= subscription.chat_limit) {
      setShowUpgradeModal(true);
      return;
    }

    try {
      const newChat = await createChat('New Chat');
      setChats(prev => [newChat, ...prev]);
      setActiveChat(newChat.id);
    } catch (error) {
      if (error instanceof Error && error.message === 'CHAT_LIMIT_EXCEEDED') {
        setShowUpgradeModal(true);
      } else {
        console.error('Failed to create chat:', error);
      }
    }
  };

  const handleChatSelect = async (chatId: string) => {
    if (!isAuthenticated && user === null) {
      setShowAuthModal(true);
      return;
    }

    setActiveChat(chatId);
    
    // Load full chat with messages if not already loaded
    const currentChat = chats.find(chat => chat.id === chatId);
    if (currentChat && currentChat.messages.length === 0) {
      try {
        const fullChat = await loadChatWithMessages(chatId);
        if (fullChat) {
          setChats(prev => prev.map(chat => 
            chat.id === chatId ? fullChat : chat
          ));
        }
      } catch (error) {
        console.error('Failed to load chat messages:', error);
      }
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!isAuthenticated) return;

    try {
      await deleteChat(chatId);
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      if (activeChat === chatId) {
        setActiveChat(null);
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  const handleRenameChat = async (chatId: string, newTitle: string) => {
    if (!isAuthenticated) return;

    if (!newTitle.trim()) {
      console.error('Cannot rename chat to empty title');
      return;
    }
    try {
      await updateChat(chatId, { title: newTitle });
      setChats(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, title: newTitle } : chat
      ));
    } catch (error) {
      console.error('Failed to rename chat:', error);
      // Show user-friendly error message
      if (error instanceof Error) {
        console.error('Rename error details:', error.message);
      }
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!isAuthenticated && user === null) {
      setShowAuthModal(true);
      return;
    }

    if (!content.trim()) return;

    let chatId = activeChat;
   let userMessage;
    
    // Create new chat if none is active
    if (!chatId) {
      // Check chat limit for free users
      if (subscription?.plan === 'free' && subscription.current_count >= subscription.chat_limit) {
        setShowUpgradeModal(true);
        return;
      }
      
      try {
        const title = content.length > 50 ? content.substring(0, 50) + '...' : content;
        const preview = content.length > 100 ? content.substring(0, 100) + '...' : content;
        const newChat = await createChat(title, preview);
        
        setChats(prev => [newChat, ...prev]);
        chatId = newChat.id;
        setActiveChat(chatId);
      } catch (error) {
        if (error instanceof Error && error.message === 'CHAT_LIMIT_EXCEEDED') {
          setShowUpgradeModal(true);
        } else {
          console.error('Failed to create chat:', error);
        }
        return;
      }
    }

    // Add user message to database and UI
    try {
     userMessage = await addMessage(chatId, 'user', content);
      
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
      
      // Update chat title and preview if it's a new chat
      if (chats.find(chat => chat.id === chatId)?.title === 'New Chat') {
        const title = content.length > 50 ? content.substring(0, 50) + '...' : content;
        const preview = content.length > 100 ? content.substring(0, 100) + '...' : content;
        await updateChat(chatId, { title, preview });
      }
    } catch (error) {
      console.error('Failed to add user message:', error);
      return;
    }

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
    setStreamingMessage('');
    
    try {
      // Use streaming for better UX
      const response = await sendMessage(
        conversationHistory.length > 0 ? conversationHistory.concat([{ role: 'user', content }]) : content,
        selectedModel, 
        [],
        (chunk: string) => {
          setStreamingMessage(prev => prev + chunk);
        }
      );
      
      // Add assistant message to database and UI
      const assistantMessage = await addMessage(chatId, 'assistant', streamingMessage || response);
      
      setChats(prev => prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, messages: [...chat.messages, assistantMessage] }
          : chat
      ));
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
      setStreamingMessage('');
    }
  };

  const handleStopGeneration = () => {
    setIsLoading(false);
    setStreamingMessage('');
  };

  const handleSignIn = async (email: string, password: string) => {
    await signIn(email, password);
  };

  const handleSignUp = async (email: string, password: string) => {
    await signUp(email, password);
  };

  const handleSignOut = async () => {
    await signOut();
    setChats([]);
    setActiveChat(null);
    setStreamingMessage('');
    setShowAuthModal(true);
  };

  const handleUpgrade = async () => {
    await upgradeToPlusSubscription();
    setShowUpgradeModal(false);
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
        onSignOut={handleSignOut}
        user={user}
        subscription={subscription}
        onUpgrade={handleUpgrade}
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
              onModelSelect={(modelId) => {
                setSelectedModel(modelId);
                handleModelChange(modelId);
              }}
            />
            
            {/* Spacer for mobile to center the model selector */}
            <div className={`lg:hidden w-10 ${isSidebarCollapsed ? 'hidden' : ''}`}></div>
          </div>
        </div>
        
        <div className="flex-1 min-h-0">
          <ChatArea
            messages={currentChat?.messages || []}
            isLoading={isLoading}
            streamingMessage={streamingMessage}
            user={user}
            onSendMessage={handleSendMessage}
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
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        isLoading={dbLoading}
        error={dbError}
      />
      
      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleUpgrade}
        isLoading={dbLoading}
        currentCount={subscription?.current_count || 0}
        limit={subscription?.chat_limit || 5}
      />
    </div>
  );
}

export default App;