import { useState, useCallback } from 'react';
import AzureOpenAIService from '../services/azureOpenAI';
import { azureConfig, defaultModelConfig, isAzureConfigured, isDevelopment } from '../config/azure-config';
import { ChatCompletionMessage, StreamChunk } from '../types/azure-openai';
import { mockAzureAPI } from '../utils/mockAzureAPI';

export const useAzureOpenAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  
  // Use mock service in development if Azure is not configured
  const shouldUseMock = isDevelopment && !isAzureConfigured;
  const service = shouldUseMock ? null : new AzureOpenAIService(azureConfig, defaultModelConfig);

  // Test connection to Azure OpenAI
  const testConnection = useCallback(async (): Promise<boolean> => {
    if (shouldUseMock) {
      setIsConnected(true);
      return true;
    }

    if (!service) {
      setIsConnected(false);
      setError('Azure OpenAI service not configured');
      return false;
    }

    try {
      const connected = await service.healthCheck();
      setIsConnected(connected);
      if (!connected) {
        setError('Failed to connect to Azure OpenAI');
      }
      return connected;
    } catch (err) {
      setIsConnected(false);
      const errorMessage = err instanceof Error ? err.message : 'Connection test failed';
      setError(errorMessage);
      return false;
    }
  }, [service, shouldUseMock]);
  const sendMessage = useCallback(async (
    messages: ChatCompletionMessage[] | string,
    conversationHistory?: ChatCompletionMessage[],
    onStreamChunk?: (content: string) => void
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);

    // Convert string input to proper message format with context
    let chatMessages: ChatCompletionMessage[];
    
    if (typeof messages === 'string') {
      // Build conversation context
      chatMessages = [
        {
          role: 'system',
          content: 'You are a helpful AI assistant. You have access to the conversation history and should provide contextual responses that reference previous messages when relevant. Maintain conversation continuity and build upon previous topics discussed.'
        },
        ...(conversationHistory || []),
        {
          role: 'user',
          content: messages
        }
      ];
    } else {
      chatMessages = messages;
    }

    try {
      // Use mock service if in development and not configured
      if (shouldUseMock) {
        if (onStreamChunk) {
          return new Promise((resolve, reject) => {
            mockAzureAPI.createChatCompletionStream(
              { messages: chatMessages },
              (chunk: StreamChunk) => {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) {
                  onStreamChunk(content);
                }
              },
              () => {
                setIsLoading(false);
                resolve('Mock response completed');
              },
              (error: Error) => {
                setIsLoading(false);
                setError(error.message);
                reject(error);
              }
            );
          });
        } else {
          const response = await mockAzureAPI.createChatCompletion({ messages: chatMessages });
          setIsLoading(false);
          return response.choices[0].message.content;
        }
      }

      if (!service) {
        throw new Error('Azure OpenAI service not available');
      }

      if (onStreamChunk) {
        // Streaming response
        let fullResponse = '';
        
        return new Promise((resolve, reject) => {
          service.createChatCompletionStream(
            {
              messages: chatMessages,
              stream: true
            },
            (chunk: StreamChunk) => {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                fullResponse += content;
                onStreamChunk(content);
              }
            },
            () => {
              setIsLoading(false);
              resolve(fullResponse);
            },
            (error: Error) => {
              setIsLoading(false);
              setError(error.message);
              reject(error);
            }
          );
        });
      } else {
        // Non-streaming response
        const response = await service.createChatCompletion({
          messages: chatMessages
        });

        setIsLoading(false);
        return response.choices[0].message.content;
      }
    } catch (err) {
      setIsLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [service, shouldUseMock]);

  const getModels = useCallback(async () => {
    if (shouldUseMock) {
      const response = await mockAzureAPI.getModels();
      return response.data;
    }

    if (!service) {
      throw new Error('Azure OpenAI service not available');
    }

    try {
      const response = await service.getModels();
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch models';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [service, shouldUseMock]);

  const getServiceInfo = useCallback(() => {
    if (shouldUseMock) {
      return {
        mode: 'mock',
        configured: false,
        endpoint: 'Mock Service',
        deploymentName: 'mock-gpt-4'
      };
    }

    if (!service) {
      return {
        mode: 'error',
        configured: false,
        error: 'Service not available'
      };
    }

    return {
      mode: 'azure',
      configured: isAzureConfigured,
      ...service.getConfigInfo()
    };
  }, [service, shouldUseMock]);

  return {
    sendMessage,
    getModels,
    testConnection,
    getServiceInfo,
    isLoading,
    error,
    isConnected,
    isConfigured: isAzureConfigured,
    isMockMode: shouldUseMock,
    clearError: () => setError(null)
  };
};