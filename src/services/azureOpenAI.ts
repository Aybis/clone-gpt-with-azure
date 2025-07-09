import { 
  AzureOpenAIConfig, 
  ChatCompletionRequest, 
  ChatCompletionResponse,
  StreamChunk,
  ModelsResponse,
  ModelConfig
} from '../types/azure-openai';

class AzureOpenAIService {
  private config: AzureOpenAIConfig;
  private defaultModelConfig: ModelConfig;

  constructor(config: AzureOpenAIConfig, modelConfig?: ModelConfig) {
    this.config = config;
    this.defaultModelConfig = modelConfig || {
      model: 'gpt-4',
      maxTokens: 1000,
      temperature: 0.7,
      topP: 0.95,
      frequencyPenalty: 0,
      presencePenalty: 0
    };
    
    this.validateConfig();
  }

  private validateConfig(): void {
    if (!this.config.endpoint) {
      throw new Error('Azure OpenAI endpoint is required');
    }
    if (!this.config.apiKey) {
      throw new Error('Azure OpenAI API key is required');
    }
    if (!this.config.deploymentName) {
      throw new Error('Azure OpenAI deployment name is required');
    }
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'api-key': this.config.apiKey,
      'User-Agent': 'ChatGPT-Clone/1.0',
    };
  }

  private getBaseUrl(): string {
    return `${this.config.endpoint}/openai/deployments/${this.config.deploymentName}`;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
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
  // Get available models
  async getModels(): Promise<ModelsResponse> {
    const url = `${this.config.endpoint}/openai/models?api-version=${this.config.apiVersion}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      
      return this.handleResponse<ModelsResponse>(response);
    } catch (error) {
      throw new Error(`Failed to fetch models: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Send chat completion request
  async createChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const url = `${this.getBaseUrl()}/chat/completions?api-version=${this.config.apiVersion}`;
    
    // Merge with default configuration
    const requestBody = {
      ...this.defaultModelConfig,
      ...request,
      max_tokens: request.max_tokens || this.defaultModelConfig.maxTokens,
      temperature: request.temperature ?? this.defaultModelConfig.temperature,
      top_p: request.top_p ?? this.defaultModelConfig.topP,
      frequency_penalty: request.frequency_penalty ?? this.defaultModelConfig.frequencyPenalty,
      presence_penalty: request.presence_penalty ?? this.defaultModelConfig.presencePenalty,
    };
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestBody),
      });
      
      return this.handleResponse<ChatCompletionResponse>(response);
    } catch (error) {
      throw new Error(`Chat completion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Stream chat completion
  async createChatCompletionStream(
    request: ChatCompletionRequest,
    onChunk: (chunk: StreamChunk) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    const url = `${this.getBaseUrl()}/chat/completions?api-version=${this.config.apiVersion}`;
    
    // Merge with default configuration
    const requestBody = {
      ...this.defaultModelConfig,
      ...request,
      stream: true,
      max_tokens: request.max_tokens || this.defaultModelConfig.maxTokens,
      temperature: request.temperature ?? this.defaultModelConfig.temperature,
      top_p: request.top_p ?? this.defaultModelConfig.topP,
      frequency_penalty: request.frequency_penalty ?? this.defaultModelConfig.frequencyPenalty,
      presence_penalty: request.presence_penalty ?? this.defaultModelConfig.presencePenalty,
    };
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Stream failed: ${response.status} ${response.statusText} - ${errorText}`);
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
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ input }),
      });
      
      return this.handleResponse(response);
    } catch (error) {
      throw new Error(`Embeddings failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      await this.getModels();
      return true;
    } catch {
      return false;
    }
  }

  // Get current configuration (without sensitive data)
  getConfigInfo() {
    return {
      endpoint: this.config.endpoint,
      apiVersion: this.config.apiVersion,
      deploymentName: this.config.deploymentName,
      hasApiKey: !!this.config.apiKey,
      modelConfig: this.defaultModelConfig
    };
  }
}

export default AzureOpenAIService;