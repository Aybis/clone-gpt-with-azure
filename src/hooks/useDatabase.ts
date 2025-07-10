import { useState, useEffect, useCallback } from 'react';
import { ChatService, DatabaseChat, DatabaseMessage, AuthService, SubscriptionService, UserSubscription } from '../services/database';

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
    AuthService.getCurrentUser().then(async (user) => {
      setUser(user);
      if (user) {
        try {
          const sub = await SubscriptionService.getUserSubscription();
          setSubscription(sub);
        } catch (err) {
          console.error('Failed to load subscription:', err);
        }
      }
    });

    // Listen for auth changes
    const { data: { subscription: authSubscription } } = AuthService.onAuthStateChange(async (user) => {
      setUser(user);
      if (user) {
        try {
          const sub = await SubscriptionService.getUserSubscription();
          setSubscription(sub);
        } catch (err) {
          console.error('Failed to load subscription:', err);
          setSubscription(null);
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
  }, []);

  // Load chats from database
  const loadChats = useCallback(async () => {
    if (!user) return [];

    setIsLoading(true);
    setError(null);

    try {
      const dbChats = await ChatService.getChats();
      return dbChats.map(chat => convertDatabaseChatToAppChat(chat));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load chats';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load specific chat with messages
  const loadChatWithMessages = useCallback(async (chatId: string) => {
    if (!user) return null;

    setIsLoading(true);
    setError(null);

    try {
      const chatWithMessages = await ChatService.getChatWithMessages(chatId);
      if (!chatWithMessages) return null;

      return convertDatabaseChatToAppChat(chatWithMessages, chatWithMessages.messages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load chat';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Create new chat
  const createChat = useCallback(async (title: string, preview: string = '') => {
    if (!user) throw new Error('User not authenticated');

    setIsLoading(true);
    setError(null);

    try {
      const dbChat = await ChatService.createChat(title, preview);
      
      // Refresh subscription info after creating chat
      const updatedSub = await SubscriptionService.getUserSubscription();
      setSubscription(updatedSub);
      
      return convertDatabaseChatToAppChat(dbChat);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create chat';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Update chat
  const updateChat = useCallback(async (chatId: string, updates: { title?: string; preview?: string }) => {
    if (!user) throw new Error('User not authenticated');

    setIsLoading(true);
    setError(null);

    try {
      const dbChat = await ChatService.updateChat(chatId, updates);
      return convertDatabaseChatToAppChat(dbChat);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update chat';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Delete chat
  const deleteChat = useCallback(async (chatId: string) => {
    if (!user) throw new Error('User not authenticated');

    setIsLoading(true);
    setError(null);

    try {
      await ChatService.deleteChat(chatId);
      
      // Refresh subscription info after deleting chat
      const updatedSub = await SubscriptionService.getUserSubscription();
      setSubscription(updatedSub);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete chat';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Add message to chat
  const addMessage = useCallback(async (chatId: string, role: 'user' | 'assistant', content: string) => {
    if (!user) throw new Error('User not authenticated');

    setIsLoading(true);
    setError(null);

    try {
      const dbMessage = await ChatService.addMessage(chatId, role, content);
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
  }, [user]);

  // Search chats
  const searchChats = useCallback(async (query: string) => {
    if (!user) return [];

    setIsLoading(true);
    setError(null);

    try {
      const dbChats = await ChatService.searchChats(query);
      return dbChats.map(chat => convertDatabaseChatToAppChat(chat));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search chats';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Authentication methods
  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await AuthService.signIn(email, password);
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
      const result = await AuthService.signUp(email, password);
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
      await AuthService.signOut();
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
    if (!user) throw new Error('User not authenticated');

    setIsLoading(true);
    setError(null);

    try {
      await SubscriptionService.upgradeToPlusSubscription();
      const updatedSub = await SubscriptionService.getUserSubscription();
      setSubscription(updatedSub);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upgrade subscription';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

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