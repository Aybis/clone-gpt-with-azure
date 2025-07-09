// Simple API types for backend integration
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface SendMessageRequest {
  message: string;
  chat_id?: string;
  model?: string;
}

export interface SendMessageResponse {
  message: ChatMessage;
  chat_id: string;
}

export interface Model {
  id: string;
  name: string;
  description: string;
}