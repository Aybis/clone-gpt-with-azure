// API service for backend communication
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // 1. Get all chats
  async getChats() {
    return this.request('/chats');
  }

  // 2. Get specific chat with messages
  async getChat(chatId: string) {
    return this.request(`/chats/${chatId}`);
  }

  // 3. Create new chat
  async createChat(title?: string) {
    return this.request('/chats', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  }

  // 4. Send message
  async sendMessage(data: { message: string; chat_id?: string; model?: string }) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 5. Delete chat
  async deleteChat(chatId: string) {
    return this.request(`/chats/${chatId}`, {
      method: 'DELETE',
    });
  }

  // 6. Update chat title
  async updateChatTitle(chatId: string, title: string) {
    return this.request(`/chats/${chatId}`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    });
  }

  // 7. Get available models
  async getModels() {
    return this.request('/models');
  }

  // 8. Stream message (for real-time responses)
  async streamMessage(data: { message: string; chat_id?: string; model?: string }) {
    const response = await fetch(`${API_BASE_URL}/messages/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Stream Error: ${response.statusText}`);
    }

    return response.body;
  }
}

export const apiService = new ApiService();