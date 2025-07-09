import { AzureOpenAIConfig } from '../types/azure-openai';

// Azure OpenAI Configuration
// You'll need to replace these with your actual Azure OpenAI values
export const azureConfig: AzureOpenAIConfig = {
  // Your Azure OpenAI endpoint (e.g., https://your-resource-name.openai.azure.com/)
  endpoint: process.env.REACT_APP_AZURE_OPENAI_ENDPOINT || 'https://your-openai-resource.openai.azure.com',
  
  // Your Azure OpenAI API key
  apiKey: process.env.REACT_APP_AZURE_OPENAI_API_KEY || 'your-api-key-here',
  
  // API version (use the latest stable version)
  apiVersion: '2024-02-15-preview',
  
  // Your deployment name (the name you gave to your model deployment)
  deploymentName: process.env.REACT_APP_AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4',
};

// Available Azure OpenAI Models
export const azureModels = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'Most capable model, great for complex tasks',
    maxTokens: 8192,
    deploymentName: 'gpt-4'
  },
  {
    id: 'gpt-4-32k',
    name: 'GPT-4 32K',
    description: 'GPT-4 with extended context length',
    maxTokens: 32768,
    deploymentName: 'gpt-4-32k'
  },
  {
    id: 'gpt-35-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Fast and efficient for most tasks',
    maxTokens: 4096,
    deploymentName: 'gpt-35-turbo'
  },
  {
    id: 'gpt-35-turbo-16k',
    name: 'GPT-3.5 Turbo 16K',
    description: 'GPT-3.5 with extended context length',
    maxTokens: 16384,
    deploymentName: 'gpt-35-turbo-16k'
  }
];

// Environment variables you need to set:
// REACT_APP_AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com
// REACT_APP_AZURE_OPENAI_API_KEY=your-api-key-here
// REACT_APP_AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment-name