import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export class AuthService {
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

export class ChatService {
  async getChats(userId: string) {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    return { data, error }
  }

  async createChat(userId: string, title: string) {
    const { data, error } = await supabase
      .from('chats')
      .insert([
        { user_id: userId, title }
      ])
      .select()
      .single()
    
    return { data, error }
  }

  async updateChat(chatId: string, updates: any) {
    const { data, error } = await supabase
      .from('chats')
      .update(updates)
      .eq('id', chatId)
      .select()
      .single()
    
    return { data, error }
  }

  async deleteChat(chatId: string) {
    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('id', chatId)
    
    return { error }
  }

  async getMessages(chatId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
    
    return { data, error }
  }

  async createMessage(chatId: string, content: string, role: 'user' | 'assistant') {
    const { data, error } = await supabase
      .from('messages')
      .insert([
        { chat_id: chatId, content, role }
      ])
      .select()
      .single()
    
    return { data, error }
  }
}

export class SubscriptionService {
  async getUserSubscription(userId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    return { data, error }
  }

  async createSubscription(userId: string, plan: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([
        { user_id: userId, plan, status: 'active' }
      ])
      .select()
      .single()
    
    return { data, error }
  }

  async updateSubscription(subscriptionId: string, updates: any) {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', subscriptionId)
      .select()
      .single()
    
    return { data, error }
  }

  async cancelSubscription(subscriptionId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('id', subscriptionId)
      .select()
      .single()
    
    return { data, error }
  }
}

// Export service instances
export const authService = new AuthService()
export const chatService = new ChatService()
export const subscriptionService = new SubscriptionService()