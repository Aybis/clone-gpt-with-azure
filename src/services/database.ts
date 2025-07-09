import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

export interface ChatWithMessages extends DatabaseChat {
  messages: DatabaseMessage[];
}

// Chat operations
export class ChatService {
  // Get all chats for the current user
  static async getChats(): Promise<DatabaseChat[]> {
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
    const { data, error } = await supabase
      .from('chats')
      .update(updates)
      .eq('id', chatId)
      .select()
      .single();

    if (error) {
      console.error('Error updating chat:', error);
      throw new Error('Failed to update chat');
    }

    return data;
  }

  // Delete a chat (messages will be deleted automatically due to CASCADE)
  static async deleteChat(chatId: string): Promise<void> {
    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('id', chatId);

    if (error) {
      console.error('Error deleting chat:', error);
      throw new Error('Failed to delete chat');
    }
  }

  // Add a message to a chat
  static async addMessage(chatId: string, role: 'user' | 'assistant', content: string): Promise<DatabaseMessage> {
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
      throw new Error('Failed to add message');
    }

    // Update chat's updated_at timestamp
    await supabase
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatId);

    return data;
  }

  // Get messages for a specific chat
  static async getMessages(chatId: string): Promise<DatabaseMessage[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      throw new Error('Failed to fetch messages');
    }

    return data || [];
  }

  // Search chats by title
  static async searchChats(query: string): Promise<DatabaseChat[]> {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .ilike('title', `%${query}%`)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error searching chats:', error);
      throw new Error('Failed to search chats');
    }

    return data || [];
  }
}

// Authentication helpers
export class AuthService {
  // Sign up with email and password
  static async signUp(email: string, password: string) {
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
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new Error(error.message);
    }
  }

  // Get current user
  static async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
  }
}