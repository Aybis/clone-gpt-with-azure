// AI Provider Types
export type AIProvider = 'azure' | 'openai' | 'gemini';

export interface BaseAIConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl?: string;
}

export interface AzureAIConfig extends BaseAIConfig {
  provider: 'azure';
  endpoint: string;
  deploymentName: string;
  apiVersion: string;
}

export interface OpenAIConfig extends BaseAIConfig {
  provider: 'openai';
  baseUrl: string;
}

export interface GeminiConfig extends BaseAIConfig {
  provider: 'gemini';
  baseUrl: string;
}

export type AIConfig = AzureAIConfig | OpenAIConfig | GeminiConfig;

export interface AIModel {
  id: string;
  name: string;
  description: string;
  provider: AIProvider;
  maxTokens: number;
  costPer1kTokens?: number;
  deploymentName?: string; // For Azure
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  model: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stream?: boolean;
}

export interface ChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finishReason: string;
  }[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface StreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finishReason?: string;
  }[];
}