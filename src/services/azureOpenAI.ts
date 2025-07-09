import { 
  AzureOpenAIConfig, 
  ChatCompletionRequest, 
  ChatCompletionResponse,
  StreamChunk,
  ModelsResponse 
} from '../types/azure-openai';

class AzureOpenAIService {
  private config: AzureOpenAIConfig;

  constructor(config: AzureOpenAIConfig) {
    this.config = config;
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'api-key': this.config.apiKey,
    };
  }

  private getBaseUrl(): string {
    return `${this.config.endpoint}/openai/deployments/${this.config.deploymentName}`;
  }

  // Get available models
  async getModels(): Promise<ModelsResponse> {
    const url = `${this.config.endpoint}/openai/models?api-version=${this.config.apiVersion}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }

    return response.json();
  }

  // Send chat completion request
  async createChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const url = `${this.getBaseUrl()}/chat/completions?api-version=${this.config.apiVersion}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Chat completion failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Stream chat completion
  async createChatCompletionStream(
    request: ChatCompletionRequest,
    onChunk: (chunk: StreamChunk) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    const url = `${this.getBaseUrl()}/chat/completions?api-version=${this.config.apiVersion}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ ...request, stream: true }),
      });

      if (!response.ok) {
        throw new Error(`Stream failed: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          onComplete();
          break;
        }

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

  // Generate embeddings
  async createEmbeddings(input: string | string[]): Promise<any> {
    const url = `${this.getBaseUrl()}/embeddings?api-version=${this.config.apiVersion}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ input }),
    });

    if (!response.ok) {
      throw new Error(`Embeddings failed: ${response.statusText}`);
    }

    return response.json();
  }
}

export default AzureOpenAIService;