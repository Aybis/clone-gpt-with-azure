import { AIConfig, ChatRequest, ChatResponse, StreamChunk, ChatMessage } from '../types/ai-providers';

export abstract class BaseAIService {
  protected config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  abstract sendMessage(request: ChatRequest): Promise<ChatResponse>;
  abstract sendMessageStream(
    request: ChatRequest,
    onChunk: (chunk: StreamChunk) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void>;
  abstract healthCheck(): Promise<boolean>;
  abstract getModels(): Promise<any>;

  protected getHeaders(): HeadersInit {
    const baseHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    switch (this.config.provider) {
      case 'azure':
        return {
          ...baseHeaders,
          'api-key': this.config.apiKey,
        };
      case 'openai':
        return {
          ...baseHeaders,
          'Authorization': `Bearer ${this.config.apiKey}`,
        };
      case 'gemini':
        return {
          ...baseHeaders,
          'x-goog-api-key': this.config.apiKey,
        };
      default:
        return baseHeaders;
    }
  }

  protected async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        }
      } catch {
        // Use default error message if JSON parsing fails
      }
      
      throw new Error(errorMessage);
    }
    
    return response.json();
  }
}

// Azure OpenAI Service
export class AzureAIService extends BaseAIService {
  private getBaseUrl(): string {
    const config = this.config as any;
    return `${config.endpoint}/openai/deployments/${config.deploymentName}`;
  }

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const config = this.config as any;
    const url = `${this.getBaseUrl()}/chat/completions?api-version=${config.apiVersion}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        messages: request.messages,
        max_tokens: request.maxTokens,
        temperature: request.temperature,
        top_p: request.topP,
        frequency_penalty: request.frequencyPenalty,
        presence_penalty: request.presencePenalty,
      }),
    });

    return this.handleResponse<ChatResponse>(response);
  }

  async sendMessageStream(
    request: ChatRequest,
    onChunk: (chunk: StreamChunk) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    const config = this.config as any;
    const url = `${this.getBaseUrl()}/chat/completions?api-version=${config.apiVersion}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          messages: request.messages,
          max_tokens: request.maxTokens,
          temperature: request.temperature,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Stream failed: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              onComplete();
              return;
            }
            
            try {
              const chunk: StreamChunk = JSON.parse(data);
              onChunk(chunk);
            } catch (e) {
              console.warn('Failed to parse chunk:', data);
            }
          }
        }
      }
    } catch (error) {
      onError(error as Error);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.getModels();
      return true;
    } catch {
      return false;
    }
  }

  async getModels(): Promise<any> {
    const config = this.config as any;
    const url = `${config.endpoint}/openai/models?api-version=${config.apiVersion}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse(response);
  }
}

// OpenAI Service
export class OpenAIService extends BaseAIService {
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const config = this.config as any;
    const url = `${config.baseUrl}/chat/completions`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        max_tokens: request.maxTokens,
        temperature: request.temperature,
        top_p: request.topP,
        frequency_penalty: request.frequencyPenalty,
        presence_penalty: request.presencePenalty,
      }),
    });

    return this.handleResponse<ChatResponse>(response);
  }

  async sendMessageStream(
    request: ChatRequest,
    onChunk: (chunk: StreamChunk) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    const config = this.config as any;
    const url = `${config.baseUrl}/chat/completions`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          max_tokens: request.maxTokens,
          temperature: request.temperature,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Stream failed: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              onComplete();
              return;
            }
            
            try {
              const chunk: StreamChunk = JSON.parse(data);
              onChunk(chunk);
            } catch (e) {
              console.warn('Failed to parse chunk:', data);
            }
          }
        }
      }
    } catch (error) {
      onError(error as Error);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.getModels();
      return true;
    } catch {
      return false;
    }
  }

  async getModels(): Promise<any> {
    const config = this.config as any;
    const url = `${config.baseUrl}/models`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse(response);
  }
}

// Gemini Service
export class GeminiService extends BaseAIService {
  private convertMessagesToGemini(messages: ChatMessage[]) {
    const systemMessage = messages.find(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');
    
    const contents = conversationMessages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    return {
      systemInstruction: systemMessage ? { parts: [{ text: systemMessage.content }] } : undefined,
      contents
    };
  }

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const config = this.config as any;
    const url = `${config.baseUrl}/models/${request.model}:generateContent?key=${config.apiKey}`;
    
    const geminiRequest = this.convertMessagesToGemini(request.messages);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...geminiRequest,
        generationConfig: {
          maxOutputTokens: request.maxTokens,
          temperature: request.temperature,
          topP: request.topP,
        }
      }),
    });

    const data = await this.handleResponse<any>(response);
    
    // Convert Gemini response to standard format
    return {
      id: `gemini-${Date.now()}`,
      object: 'chat.completion',
      created: Date.now(),
      model: request.model,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: data.candidates[0]?.content?.parts[0]?.text || ''
        },
        finishReason: 'stop'
      }],
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount || 0,
        completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata?.totalTokenCount || 0
      }
    };
  }

  async sendMessageStream(
    request: ChatRequest,
    onChunk: (chunk: StreamChunk) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    const config = this.config as any;
    const url = `${config.baseUrl}/models/${request.model}:streamGenerateContent?key=${config.apiKey}`;
    
    const geminiRequest = this.convertMessagesToGemini(request.messages);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...geminiRequest,
          generationConfig: {
            maxOutputTokens: request.maxTokens,
            temperature: request.temperature,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Stream failed: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                const chunk: StreamChunk = {
                  id: `gemini-${Date.now()}`,
                  object: 'chat.completion.chunk',
                  created: Date.now(),
                  model: request.model,
                  choices: [{
                    index: 0,
                    delta: {
                      content: data.candidates[0].content.parts[0].text
                    },
                    finishReason: data.candidates[0].finishReason === 'STOP' ? 'stop' : undefined
                  }]
                };
                onChunk(chunk);
              }
            } catch (e) {
              console.warn('Failed to parse Gemini chunk:', line);
            }
          }
        }
      }
      
      onComplete();
    } catch (error) {
      onError(error as Error);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.getModels();
      return true;
    } catch {
      return false;
    }
  }

  async getModels(): Promise<any> {
    const config = this.config as any;
    const url = `${config.baseUrl}/models?key=${config.apiKey}`;
    
    const response = await fetch(url, {
      method: 'GET',
    });
    
    return this.handleResponse(response);
  }
}

// Factory function to create appropriate service
export function createAIService(config: AIConfig): BaseAIService {
  switch (config.provider) {
    case 'azure':
      return new AzureAIService(config);
    case 'openai':
      return new OpenAIService(config);
    case 'gemini':
      return new GeminiService(config);
    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}

export { BaseAIServices }
export { BaseAIService };