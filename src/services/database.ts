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
export const isSupabaseAvailable = (): boolean => {
  return supabase !== null;
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
    if (!supabase) {
      throw new Error('Supabase client not initialized. Please check your environment variables.');
    }

    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching chats:', error);
      throw new Error('Failed to fetch chats');
    }

    return data || [];
  }

  // Get a specific chat with its messages
  static async getChatWithMessages(chatId: string): Promise<ChatWithMessages | null> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Please check your environment variables.');
    }

    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .single();

    if (chatError) {
      console.error('Error fetching chat:', chatError);
      throw new Error('Failed to fetch chat');
    }

    if (!chat) return null;

    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      throw new Error('Failed to fetch messages');
    }

    return {
      ...chat,
      messages: messages || []
    };
  }

  // Create a new chat
  static async createChat(title: string, preview: string = ''): Promise<DatabaseChat> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Please check your environment variables.');
    }

    // Check chat limit first
    const { data: canCreate, error: limitError } = await supabase.rpc('check_chat_limit');
    
    if (limitError) {
      console.error('Error checking chat limit:', limitError);
      throw new Error('Failed to check chat limit');
    }
    
    if (!canCreate) {
      throw new Error('CHAT_LIMIT_EXCEEDED');
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
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
      throw new Error('Failed to create chat');
    }

    return data;
  }

  // Update chat title and preview
  static async updateChat(chatId: string, updates: { title?: string; preview?: string }): Promise<DatabaseChat> {
    if (!supabase) {
      throwSupabaseError();
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
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        throw new Error('Chat not found or no data returned');
      }

      return data;
    } catch (err) {
      if (err instanceof Error) {
        // Re-throw our custom errors
        if (err.message.startsWith('Database error:') || err.message.startsWith('Chat not found')) {
          throw err;
        }
        // Handle network/fetch errors
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
          throw new Error('Unable to connect to database. Please check your internet connection and Supabase configuration.');
        }
      }
      // Re-throw unknown errors
      throw new Error(`Failed to update chat: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }
}

// Export helper functions for components to check database availability
export { isSupabaseAvailable };

// Mock service for when Supabase is not available
export class MockChatService {
  private static chats: DatabaseChat[] = [];
  private static messages: DatabaseMessage[] = [];

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

// Export the appropriate service based on Supabase availability
export const DatabaseService = isSupabaseAvailable() ? ChatService : MockChatService;

// Update other service methods to use the same error handling pattern
export class ChatService {
  // Get all chats for the current user
  static async getChats(): Promise<DatabaseChat[]> {
    if (!supabase) {
      throwSupabaseError();
    }

    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching chats:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data || [];
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('Database error:')) {
        throw err;
      }
      throw new Error(`Failed to fetch chats: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  // Get a specific chat with its messages
  static async getChatWithMessages(chatId: string): Promise<ChatWithMessages | null> {
    if (!supabase) {
      throwSupabaseError();
    }

    try {
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .single();

      if (chatError) {
        console.error('Error fetching chat:', chatError);
        throw new Error(`Database error: ${chatError.message}`);
      }

      if (!chat) return null;

      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        throw new Error(`Database error: ${messagesError.message}`);
      }

      return {
        ...chat,
        messages: messages || []
      };
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('Database error:')) {
        throw err;
      }
      throw new Error(`Failed to fetch chat: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  // Create a new chat
  static async createChat(title: string, preview: string = ''): Promise<DatabaseChat> {
    if (!supabase) {
      throwSupabaseError();
    }

    try {
      // Check chat limit first
      const { data: canCreate, error: limitError } = await supabase.rpc('check_chat_limit');
      
      if (limitError) {
        console.error('Error checking chat limit:', limitError);
        throw new Error(`Database error: ${limitError.message}`);
      }
      
      if (!canCreate) {
        throw new Error('CHAT_LIMIT_EXCEEDED');
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
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
        throw new Error(`Database error: ${error.message}`);
      }

      return data;
    } catch (err) {
      if (err instanceof Error && (err.message.startsWith('Database error:') || err.message === 'CHAT_LIMIT_EXCEEDED' || err.message === 'User not authenticated')) {
        throw err;
      }
      throw new Error(`Failed to create chat: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  // Update chat title and preview
  static async updateChat(chatId: string, updates: { title?: string; preview?: string }): Promise<DatabaseChat> {
    if (!supabase) {
      throwSupabaseError();
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
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        throw new Error('Chat not found or no data returned');
      }

      return data;
    } catch (err) {
      if (err instanceof Error) {
        // Re-throw our custom errors
        if (err.message.startsWith('Database error:') || err.message.startsWith('Chat not found')) {
          throw err;
        }
        // Handle network/fetch errors
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
          throw new Error('Unable to connect to database. Please check your internet connection and Supabase configuration.');
        }
      }
      // Re-throw unknown errors
      throw new Error(`Failed to update chat: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  // Delete a chat (messages will be deleted automatically due to CASCADE)
  static async deleteChat(chatId: string): Promise<void> {
    if (!supabase) {
      throwSupabaseError();
    }

    try {
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);

      if (error) {
        console.error('Error deleting chat:', error);
        throw new Error(`Database error: ${error.message}`);
      }
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('Database error:')) {
        throw err;
      }
      throw new Error(`Failed to delete chat: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  // Add a message to a chat
  static async addMessage(chatId: string, role: 'user' | 'assistant', content: string): Promise<DatabaseMessage> {
    if (!supabase) {
      throwSupabaseError();
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
        throw new Error(`Database error: ${error.message}`);
      }

      // Update chat's updated_at timestamp
      await supabase
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId);

      return data;
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('Database error:')) {
        throw err;
      }
      throw new Error(`Failed to add message: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  // Get messages for a specific chat
  static async getMessages(chatId: string): Promise<DatabaseMessage[]> {
    if (!supabase) {
      throwSupabaseError();
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data || [];
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('Database error:')) {
        throw err;
      }
      throw new Error(`Failed to fetch messages: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  // Search chats by title
  static async searchChats(query: string): Promise<DatabaseChat[]> {
    if (!supabase) {
      throwSupabaseError();
    }

    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .ilike('title', `%${query}%`)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error searching chats:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data || [];
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('Database error:')) {
        throw err;
      }
      throw new Error(`Failed to search chats: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }
}

// Subscription operations with improved error handling
export class SubscriptionService {
  // Get user subscription info
  static async getUserSubscription(): Promise<UserSubscription> {
    if (!supabase) {
      throwSupabaseError();
    }

    try {
      const { data, error } = await supabase.rpc('get_user_subscription');
      
      if (error) {
        console.error('Error fetching subscription:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data[0] || { plan: 'free', chat_limit: 5, current_count: 0 };
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('Database error:')) {
        throw err;
      }
      throw new Error(`Failed to fetch subscription: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  // Upgrade to plus
  static async upgradeToPlusSubscription(): Promise<void> {
    if (!supabase) {
      throwSupabaseError();
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
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
        throw new Error(`Database error: ${error.message}`);
      }
    } catch (err) {
      if (err instanceof Error && (err.message.startsWith('Database error:') || err.message === 'User not authenticated')) {
        throw err;
      }
      throw new Error(`Failed to upgrade subscription: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }
}

// Authentication helpers with improved error handling
export class AuthService {
  // Sign up with email and password
  static async signUp(email: string, password: string) {
    if (!supabase) {
      throwSupabaseError();
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
      throwSupabaseError();
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
      throwSupabaseError();
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