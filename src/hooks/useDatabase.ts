import { useState, useEffect, useCallback } from 'react';
import { chatService, DatabaseChat, DatabaseMessage, authService, subscriptionService, UserSubscription } from '../services/database';

// Convert database types to app types
const convertDatabaseChatToAppChat = (dbChat: DatabaseChat, messages: DatabaseMessage[] = []) => ({
  id: dbChat.id,
  title: dbChat.title,
  timestamp: new Date(dbChat.updated_at),
  preview: dbChat.preview,
  messages: messages.map(msg => ({
    id: msg.id,
    type: msg.role as 'user' | 'assistant',
    content: msg.content,
    timestamp: new Date(msg.created_at)
  }))
});

export const useDatabase = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);

  // Initialize auth state
  useEffect(() => {
    // Get initial user
    authService.getCurrentUser().then(async (user) => {
      setUser(user);
      if (user) {
        try {
          const sub = await subscriptionService.getUserSubscription();
          setSubscription(sub);
        } catch (err) {
          console.error('Failed to load subscription:', err);
          // Set default subscription for mock mode
          setSubscription({ plan: 'free', chat_limit: 999, current_count: 0 });
        }
      }
    }).catch((err) => {
      console.warn('Database not available, using mock mode:', err);
      // Set a mock user when database is not available
      setUser({ email: 'mock@user.com', id: 'mock-user' });
      setSubscription({ plan: 'free', chat_limit: 999, current_count: 0 });
    });

    // Listen for auth changes
    try {
      const { data: { subscription: authSubscription } } = authService.onAuthStateChange(async (user) => {
        setUser(user);
        if (user) {
          try {
            const sub = await subscriptionService.getUserSubscription();
            setSubscription(sub);
          } catch (err) {
            console.error('Failed to load subscription:', err);
            setSubscription({ plan: 'free', chat_limit: 999, current_count: 0 });
          }
        } else {
          setSubscription(null);
        }
      });

      return () => {
        if (authSubscription) {
          authSubscription.unsubscribe();
        }
      };
    } catch (err) {
      console.warn('Auth service not available, using mock mode');
      // Set mock user when auth is not available
      setUser({ email: 'mock@user.com', id: 'mock-user' });
      setSubscription({ plan: 'free', chat_limit: 999, current_count: 0 });
    }
  }, []);

  // Load chats from database
  const loadChats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const dbChats = await chatService.getChats();
      return dbChats.map(chat => convertDatabaseChatToAppChat(chat));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load chats';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load specific chat with messages
  const loadChatWithMessages = useCallback(async (chatId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const chatWithMessages = await chatService.getChatWithMessages(chatId);
      if (!chatWithMessages) return null;

      return convertDatabaseChatToAppChat(chatWithMessages, chatWithMessages.messages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load chat';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create new chat
  const createChat = useCallback(async (title: string, preview: string = '') => {
    setIsLoading(true);
    setError(null);

    try {
      const dbChat = await chatService.createChat(title, preview);
      
      // Refresh subscription info after creating chat
      try {
        const updatedSub = await subscriptionService.getUserSubscription();
        setSubscription(updatedSub);
      } catch (err) {
        console.warn('Failed to refresh subscription:', err);
      }
      
      return convertDatabaseChatToAppChat(dbChat);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create chat';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update chat
  const updateChat = useCallback(async (chatId: string, updates: { title?: string; preview?: string }) => {
    setIsLoading(true);
    setError(null);

    try {
      const dbChat = await chatService.updateChat(chatId, updates);
      return convertDatabaseChatToAppChat(dbChat);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update chat';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete chat
  const deleteChat = useCallback(async (chatId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await chatService.deleteChat(chatId);
      
      // Refresh subscription info after deleting chat
      try {
        const updatedSub = await subscriptionService.getUserSubscription();
        setSubscription(updatedSub);
      } catch (err) {
        console.warn('Failed to refresh subscription:', err);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete chat';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add message to chat
  const addMessage = useCallback(async (chatId: string, role: 'user' | 'assistant', content: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const dbMessage = await chatService.addMessage(chatId, role, content);
      return {
        id: dbMessage.id,
        type: dbMessage.role as 'user' | 'assistant',
        content: dbMessage.content,
        timestamp: new Date(dbMessage.created_at)
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add message';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Search chats
  const searchChats = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const dbChats = await chatService.searchChats(query);
      return dbChats.map(chat => convertDatabaseChatToAppChat(chat));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search chats';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Authentication methods
  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authService.signIn(email, password);
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authService.signUp(email, password);
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign up';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.signOut();
      setUser(null);
      setSubscription(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign out';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Upgrade to plus
  const upgradeToPlusSubscription = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await subscriptionService.upgradeToPlusSubscription();
      const updatedSub = await subscriptionService.getUserSubscription();
      setSubscription(updatedSub);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upgrade subscription';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // State
    isLoading,
    error,
    user,
    isAuthenticated: !!user,
    subscription,

    // Chat operations
    loadChats,
    loadChatWithMessages,
    createChat,
    updateChat,
    deleteChat,
    addMessage,
    searchChats,

    // Auth operations
    signIn,
    signUp,
    signOut,
    upgradeToPlusSubscription,

    // Utilities
    clearError: () => setError(null)
  };
};