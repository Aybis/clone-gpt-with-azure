import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Database features will be disabled.');
  console.warn('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
  console.warn('Please check your .env file or copy .env.example to .env and configure it.');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper function to check if Supabase is available
const isSupabaseAvailable = (): boolean => {
  return supabase !== null;
};

// Helper function to check if we can actually connect to Supabase
const canConnectToSupabase = async (): Promise<boolean> => {
  if (!supabase) return false;
  
  try {
    // Try a simple query to test connectivity
    const { error } = await supabase.from('chats').select('count', { count: 'exact', head: true });
    return !error;
  } catch (err) {
    console.warn('Supabase connection test failed:', err);
    return false;
  }
};

// Helper function to throw consistent error when Supabase is not available
const throwSupabaseError = (): never => {
  throw new Error('Database not available. Please configure Supabase environment variables in your .env file.');
};

// Database types
export interface DatabaseChat {
  id: string;
  user_id: string;
  title: string;
  preview: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseMessage {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface UserSubscription {
  plan: 'free' | 'plus';
  chat_limit: number;
  current_count: number;
}

export interface ChatWithMessages extends DatabaseChat {
  messages: DatabaseMessage[];
}

// Chat operations
export class ChatService {
  // Get all chats for the current user
  static async getChats(): Promise<DatabaseChat[]> {
    if (!supabase || !(await canConnectToSupabase())) {
      console.warn('Using mock chat service - database not available');
      return MockChatService.getChats();
    }

    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching chats:', error);
        console.warn('Falling back to mock service');
        return MockChatService.getChats();
      }

      return data || [];
    } catch (err) {
      console.error('Network error fetching chats:', err);
      console.warn('Falling back to mock service');
      return MockChatService.getChats();
    }
  }

  // Get a specific chat with its messages
  static async getChatWithMessages(chatId: string): Promise<ChatWithMessages | null> {
    if (!supabase || !(await canConnectToSupabase())) {
      console.warn('Using mock chat service - database not available');
      return MockChatService.getChatWithMessages(chatId);
    }

    try {
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .single();

      if (chatError) {
        console.error('Error fetching chat:', chatError);
        console.warn('Falling back to mock service');
        return MockChatService.getChatWithMessages(chatId);
      }

      if (!chat) return null;

      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        console.warn('Falling back to mock service');
        return MockChatService.getChatWithMessages(chatId);
      }

      return {
        ...chat,
        messages: messages || []
      };
    } catch (err) {
      console.error('Network error fetching chat:', err);
      console.warn('Falling back to mock service');
      return MockChatService.getChatWithMessages(chatId);
    }
  }

  // Create a new chat
  static async createChat(title: string, preview: string = ''): Promise<DatabaseChat> {
    if (!supabase || !(await canConnectToSupabase())) {
      console.warn('Using mock chat service - database not available');
      return MockChatService.createChat(title, preview);
    }

    try {
      // Check chat limit first
      const { data: canCreate, error: limitError } = await supabase.rpc('check_chat_limit');
      
      if (limitError) {
        console.error('Error checking chat limit:', limitError);
        console.warn('Falling back to mock service');
        return MockChatService.createChat(title, preview);
      }
      
      if (!canCreate) {
        throw new Error('CHAT_LIMIT_EXCEEDED');
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('User not authenticated, falling back to mock service');
        return MockChatService.createChat(title, preview);
      }

      const { data, error } = await supabase
        .from('chats')
        .insert({
          user_id: user.id,
          title,
          preview
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating chat:', error);
        console.warn('Falling back to mock service');
        return MockChatService.createChat(title, preview);
      }

      return data;
    } catch (err) {
      console.error('Network error creating chat:', err);
      console.warn('Falling back to mock service');
      return MockChatService.createChat(title, preview);
    }
  }

  // Update chat title and preview
  static async updateChat(chatId: string, updates: { title?: string; preview?: string }): Promise<DatabaseChat> {
    if (!supabase || !(await canConnectToSupabase())) {
      console.warn('Using mock chat service - database not available');
      return MockChatService.updateChat(chatId, updates);
    }

    // Validate inputs
    if (!chatId) {
      throw new Error('Chat ID is required');
    }

    // Ensure we have valid updates
    const validUpdates: any = {};
    if (updates.title !== undefined) validUpdates.title = updates.title;
    if (updates.preview !== undefined) validUpdates.preview = updates.preview;
    
    if (Object.keys(validUpdates).length === 0) {
      throw new Error('No valid updates provided');
    }

    try {
      const { data, error } = await supabase
        .from('chats')
        .update(validUpdates)
        .eq('id', chatId)
        .select()
        .single();

      if (error) {
        console.error('Supabase error updating chat:', error);
        console.warn('Falling back to mock service');
        return MockChatService.updateChat(chatId, updates);
      }

      if (!data) {
        console.warn('No data returned, falling back to mock service');
        return MockChatService.updateChat(chatId, updates);
      }

      return data;
    } catch (err) {
      console.error('Network error updating chat:', err);
      console.warn('Falling back to mock service');
      return MockChatService.updateChat(chatId, updates);
    }
  }

  // Delete a chat (messages will be deleted automatically due to CASCADE)
  static async deleteChat(chatId: string): Promise<void> {
    if (!supabase || !(await canConnectToSupabase())) {
      console.warn('Using mock chat service - database not available');
      return MockChatService.deleteChat(chatId);
    }

    try {
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);

      if (error) {
        console.error('Error deleting chat:', error);
        console.warn('Falling back to mock service');
        return MockChatService.deleteChat(chatId);
      }
    } catch (err) {
      console.error('Network error deleting chat:', err);
      console.warn('Falling back to mock service');
      return MockChatService.deleteChat(chatId);
    }
  }

  // Add a message to a chat
  static async addMessage(chatId: string, role: 'user' | 'assistant', content: string): Promise<DatabaseMessage> {
    if (!supabase || !(await canConnectToSupabase())) {
      console.warn('Using mock chat service - database not available');
      return MockChatService.addMessage(chatId, role, content);
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          role,
          content
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding message:', error);
        console.warn('Falling back to mock service');
        return MockChatService.addMessage(chatId, role, content);
      }

      // Update chat's updated_at timestamp
      try {
        await supabase
          .from('chats')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', chatId);
      } catch (updateErr) {
        console.warn('Failed to update chat timestamp:', updateErr);
      }

      return data;
    } catch (err) {
      console.error('Network error adding message:', err);
      console.warn('Falling back to mock service');
      return MockChatService.addMessage(chatId, role, content);
    }
  }

  // Search chats by title
  static async searchChats(query: string): Promise<DatabaseChat[]> {
    if (!supabase || !(await canConnectToSupabase())) {
      console.warn('Using mock chat service - database not available');
      return MockChatService.searchChats(query);
    }

    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .ilike('title', `%${query}%`)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error searching chats:', error);
        console.warn('Falling back to mock service');
        return MockChatService.searchChats(query);
      }

      return data || [];
    } catch (err) {
      console.error('Network error searching chats:', err);
      console.warn('Falling back to mock service');
      return MockChatService.searchChats(query);
    }
  }
}

// Subscription operations
export class SubscriptionService {
  // Get user subscription info
  static async getUserSubscription(): Promise<UserSubscription> {
    if (!supabase || !(await canConnectToSupabase())) {
      return { plan: 'free', chat_limit: 999, current_count: 0 };
    }

    try {
      const { data, error } = await supabase.rpc('get_user_subscription');
      
      if (error) {
        console.error('Error fetching subscription:', error);
        return { plan: 'free', chat_limit: 999, current_count: 0 };
      }

      return data[0] || { plan: 'free', chat_limit: 5, current_count: 0 };
    } catch (err) {
      console.error('Network error fetching subscription:', err);
      return { plan: 'free', chat_limit: 999, current_count: 0 };
    }
  }

  // Upgrade to plus
  static async upgradeToPlusSubscription(): Promise<void> {
    if (!supabase || !(await canConnectToSupabase())) {
      console.log('Mock upgrade to plus subscription');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('User not authenticated for upgrade');
        return;
      }

      const { error } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          plan: 'plus',
          chat_limit: 999999 // Unlimited
        });

      if (error) {
        console.error('Error upgrading subscription:', error);
        console.log('Mock upgrade to plus subscription');
      }
    } catch (err) {
      console.error('Network error upgrading subscription:', err);
      console.log('Mock upgrade to plus subscription');
    }
  }
}

// Authentication helpers
export class AuthService {
  // Sign up with email and password
  static async signUp(email: string, password: string) {
    if (!supabase) {
      // Mock successful signup
      return {
        data: { user: { id: 'mock-user', email }, session: null },
        error: null
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  // Sign in with email and password
  static async signIn(email: string, password: string) {
    if (!supabase) {
      // Mock successful signin
      return {
        data: { user: { id: 'mock-user', email }, session: { access_token: 'mock-token' } },
        error: null
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  // Sign out
  static async signOut() {
    if (!supabase) {
      return;
    }

    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new Error(error.message);
    }
  }

  // Get current user
  static async getCurrentUser() {
    if (!supabase) {
      return null;
    }

    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (user: any) => void) {
    if (!supabase) {
      callback(null);
      return { data: { subscription: null } };
    }

    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
  }
}

// Mock service for when Supabase is not available
export class MockChatService {
  private static chats: DatabaseChat[] = [];
  private static messages: DatabaseMessage[] = [];

  static async getChats(): Promise<DatabaseChat[]> {
    return [...this.chats];
  }

  static async createChat(title: string, preview: string = ''): Promise<DatabaseChat> {
    const newChat: DatabaseChat = {
      id: `mock-${Date.now()}`,
      user_id: 'mock-user',
      title,
      preview,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.chats.unshift(newChat);
    return newChat;
  }

  static async updateChat(chatId: string, updates: { title?: string; preview?: string }): Promise<DatabaseChat> {
    const chatIndex = this.chats.findIndex(chat => chat.id === chatId);
    if (chatIndex === -1) {
      throw new Error('Chat not found');
    }

    const updatedChat = {
      ...this.chats[chatIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    this.chats[chatIndex] = updatedChat;
    return updatedChat;
  }

  static async deleteChat(chatId: string): Promise<void> {
    this.chats = this.chats.filter(chat => chat.id !== chatId);
    this.messages = this.messages.filter(message => message.chat_id !== chatId);
  }

  static async addMessage(chatId: string, role: 'user' | 'assistant', content: string): Promise<DatabaseMessage> {
    const newMessage: DatabaseMessage = {
      id: `mock-msg-${Date.now()}`,
      chat_id: chatId,
      role,
      content,
      created_at: new Date().toISOString()
    };

    this.messages.push(newMessage);
    
    // Update chat timestamp
    const chatIndex = this.chats.findIndex(chat => chat.id === chatId);
    if (chatIndex !== -1) {
      this.chats[chatIndex].updated_at = new Date().toISOString();
    }

    return newMessage;
  }

  static async getMessages(chatId: string): Promise<DatabaseMessage[]> {
    return this.messages.filter(message => message.chat_id === chatId);
  }

  static async getChatWithMessages(chatId: string): Promise<ChatWithMessages | null> {
    const chat = this.chats.find(c => c.id === chatId);
    if (!chat) return null;

    const messages = await this.getMessages(chatId);
    return { ...chat, messages };
  }

  static async searchChats(query: string): Promise<DatabaseChat[]> {
    return this.chats.filter(chat => 
      chat.title.toLowerCase().includes(query.toLowerCase())
    );
  }
}

// Export service instances
export const authService = AuthService;
export const chatService = ChatService;
export const subscriptionService = SubscriptionService;

// Export helper functions for components to check database availability
export { isSupabaseAvailable };