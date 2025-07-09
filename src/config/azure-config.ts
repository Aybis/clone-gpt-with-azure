import { AzureOpenAIConfig, ModelConfig } from '../types/azure-openai';

// Validate required environment variables
const validateEnvVars = () => {
  const required = [
    'VITE_AZURE_OPENAI_ENDPOINT',
    'VITE_AZURE_OPENAI_API_KEY',
    'VITE_AZURE_OPENAI_DEPLOYMENT_NAME'
  ];
  
  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    console.warn(`Missing Azure OpenAI environment variables: ${missing.join(', ')}`);
    console.warn('Please check your .env file and ensure all required variables are set.');
  }
  
  return missing.length === 0;
};

// Azure OpenAI Configuration from environment variables
export const azureConfig: AzureOpenAIConfig = {
  endpoint: import.meta.env.VITE_AZURE_OPENAI_ENDPOINT || '',
  apiKey: import.meta.env.VITE_AZURE_OPENAI_API_KEY || '',
  apiVersion: import.meta.env.VITE_AZURE_OPENAI_API_VERSION || '2024-02-15-preview',
  deploymentName: import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4',
};
// Available Azure OpenAI Models
export const azureModels = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'Most capable model, great for complex tasks',
    maxTokens: 8192,
// Check if Azure OpenAI is properly configured
export const isAzureConfigured = validateEnvVars();
    deploymentName: 'gpt-4'
// Development mode flag
export const isDevelopment = import.meta.env.DEV;
  },
  {
export const availableModels = [
    name: 'GPT-4 32K',
    description: 'GPT-4 with extended context length',
    maxTokens: 32768,
    deploymentName: 'gpt-4-32k'
  },
    deploymentName: 'gpt-4',
    costPer1kTokens: 0.03
    id: 'gpt-35-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Fast and efficient for most tasks',
    maxTokens: 4096,
    deploymentName: 'gpt-35-turbo'
  },
    deploymentName: 'gpt-4-32k',
    costPer1kTokens: 0.06
    id: 'gpt-35-turbo-16k',
    name: 'GPT-3.5 Turbo 16K',
    description: 'GPT-3.5 with extended context length',
    maxTokens: 16384,
    deploymentName: 'gpt-35-turbo-16k'
  }
    deploymentName: 'gpt-35-turbo',
    costPer1kTokens: 0.002

// Default model configuration
export const defaultModelConfig: ModelConfig = {
  model: import.meta.env.VITE_DEFAULT_MODEL || 'gpt-4',
  maxTokens: parseInt(import.meta.env.VITE_MAX_TOKENS || '1000'),
  temperature: parseFloat(import.meta.env.VITE_TEMPERATURE || '0.7'),
    deploymentName: 'gpt-35-turbo-16k',
    costPer1kTokens: 0.004
  frequencyPenalty: 0,
  presencePenalty: 0,
};