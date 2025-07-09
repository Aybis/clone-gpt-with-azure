import { AIConfig, AIModel, AIProvider } from '../types/ai-providers';

// Get current AI provider from environment
export const getCurrentProvider = (): AIProvider => {
  const provider = import.meta.env.VITE_AI_PROVIDER as AIProvider;
  return provider || 'azure';
};

// Validate and get AI configuration
export const getAIConfig = (): AIConfig | null => {
  const provider = getCurrentProvider();

  switch (provider) {
    case 'azure':
      const azureConfig = {
        provider: 'azure' as const,
        endpoint: import.meta.env.VITE_AZURE_OPENAI_ENDPOINT,
        apiKey: import.meta.env.VITE_AZURE_OPENAI_API_KEY,
        deploymentName: import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME,
        apiVersion: import.meta.env.VITE_AZURE_OPENAI_API_VERSION || '2024-02-15-preview',
      };
      
      if (!azureConfig.endpoint || !azureConfig.apiKey || !azureConfig.deploymentName) {
        return null;
      }
      
      return azureConfig;

    case 'openai':
      const openaiConfig = {
        provider: 'openai' as const,
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        baseUrl: import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1',
      };
      
      if (!openaiConfig.apiKey) {
        return null;
      }
      
      return openaiConfig;

    case 'gemini':
      const geminiConfig = {
        provider: 'gemini' as const,
        apiKey: import.meta.env.VITE_GEMINI_API_KEY,
        baseUrl: import.meta.env.VITE_GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta',
      };
      
      if (!geminiConfig.apiKey) {
        return null;
      }
      
      return geminiConfig;

    default:
      return null;
  }
};

// Available models for each provider
export const getAvailableModels = (provider: AIProvider): AIModel[] => {
  switch (provider) {
    case 'azure':
      return [
        {
          id: 'gpt-4',
          name: 'GPT-4',
          description: 'Most capable model, great for complex tasks',
          provider: 'azure',
          maxTokens: 8192,
          costPer1kTokens: 0.03,
          deploymentName: 'gpt-4'
        },
        {
          id: 'gpt-4-32k',
          name: 'GPT-4 32K',
          description: 'GPT-4 with extended context length',
          provider: 'azure',
          maxTokens: 32768,
          costPer1kTokens: 0.06,
          deploymentName: 'gpt-4-32k'
        },
        {
          id: 'gpt-35-turbo',
          name: 'GPT-3.5 Turbo',
          description: 'Fast and efficient for most tasks',
          provider: 'azure',
          maxTokens: 4096,
          costPer1kTokens: 0.002,
          deploymentName: 'gpt-35-turbo'
        },
        {
          id: 'gpt-35-turbo-16k',
          name: 'GPT-3.5 Turbo 16K',
          description: 'GPT-3.5 with extended context length',
          provider: 'azure',
          maxTokens: 16384,
          costPer1kTokens: 0.004,
          deploymentName: 'gpt-35-turbo-16k'
        }
      ];

    case 'openai':
      return [
        {
          id: 'gpt-4o',
          name: 'GPT-4o',
          description: 'Most advanced model with multimodal capabilities',
          provider: 'openai',
          maxTokens: 128000,
          costPer1kTokens: 0.005
        },
        {
          id: 'gpt-4o-mini',
          name: 'GPT-4o Mini',
          description: 'Faster and more affordable GPT-4o',
          provider: 'openai',
          maxTokens: 128000,
          costPer1kTokens: 0.00015
        },
        {
          id: 'gpt-4-turbo',
          name: 'GPT-4 Turbo',
          description: 'Latest GPT-4 model with improved performance',
          provider: 'openai',
          maxTokens: 128000,
          costPer1kTokens: 0.01
        },
        {
          id: 'gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo',
          description: 'Fast and efficient for most tasks',
          provider: 'openai',
          maxTokens: 16385,
          costPer1kTokens: 0.0005
        }
      ];

    case 'gemini':
      return [
        {
          id: 'gemini-1.5-pro',
          name: 'Gemini 1.5 Pro',
          description: 'Most capable Gemini model with long context',
          provider: 'gemini',
          maxTokens: 2097152,
          costPer1kTokens: 0.00125
        },
        {
          id: 'gemini-1.5-flash',
          name: 'Gemini 1.5 Flash',
          description: 'Fast and efficient Gemini model',
          provider: 'gemini',
          maxTokens: 1048576,
          costPer1kTokens: 0.000075
        },
        {
          id: 'gemini-1.0-pro',
          name: 'Gemini 1.0 Pro',
          description: 'Balanced performance and efficiency',
          provider: 'gemini',
          maxTokens: 32768,
          costPer1kTokens: 0.0005
        }
      ];

    default:
      return [];
  }
};

// Get all available models across providers
export const getAllModels = (): AIModel[] => {
  return [
    ...getAvailableModels('azure'),
    ...getAvailableModels('openai'),
    ...getAvailableModels('gemini')
  ];
};

// Check if current provider is configured
export const isProviderConfigured = (): boolean => {
  return getAIConfig() !== null;
};

// Get provider display information
export const getProviderInfo = (provider: AIProvider) => {
  switch (provider) {
    case 'azure':
      return {
        name: 'Azure OpenAI',
        description: 'Microsoft Azure OpenAI Service',
        icon: '🔷',
        color: 'blue'
      };
    case 'openai':
      return {
        name: 'OpenAI',
        description: 'OpenAI GPT Models',
        icon: '🤖',
        color: 'green'
      };
    case 'gemini':
      return {
        name: 'Google Gemini',
        description: 'Google Gemini AI Models',
        icon: '✨',
        color: 'purple'
      };
    default:
      return {
        name: 'Unknown',
        description: 'Unknown provider',
        icon: '❓',
        color: 'gray'
      };
  }
};