import { useState, useCallback, useMemo } from 'react';
import { createAIService, BaseAIService } from '../services/ai-service';
import { getAIConfig, getCurrentProvider, getProviderInfo, isSpecificProviderConfigured, getSpecificProviderConfig } from '../config/ai-providers';
import { ChatMessage, StreamChunk, AIProvider } from '../types/ai-providers';
import { mockAzureAPI } from '../utils/mockAzureAPI';

export const useAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(getCurrentProvider());
  
  const currentProvider = selectedProvider;
  const isConfigured = useMemo(() => {
    return isSpecificProviderConfigured(currentProvider);
  }, [currentProvider]);
  
  const shouldUseMock = !isConfigured;
  
  const service = useMemo((): BaseAIService | null => {
    if (shouldUseMock) return null;
    
    const config = getSpecificProviderConfig(currentProvider);
    if (!config) return null;
    
    try {
      return createAIService(config);
    } catch (error) {
      console.error('Failed to create AI service:', error);
      return null;
    }
  }, [shouldUseMock, currentProvider]);

  // Test connection to AI service
  const testConnection = useCallback(async (): Promise<boolean> => {
    // Always allow testing, even in mock mode
    if (shouldUseMock) {
      setIsConnected(true);
      setError(null);
      return true;
    }

    if (!service) {
      setIsConnected(false);
      setError('AI service not configured');
      return false;
    }

    try {
      setError(null); // Clear any previous errors
      const connected = await service.healthCheck();
      setIsConnected(connected);
      if (!connected) {
        setError('Failed to connect to AI service');
      } else {
        setError(null); // Clear error on successful connection
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
    messages: ChatMessage[] | string,
    model: string,
    conversationHistory?: ChatMessage[],
    onStreamChunk?: (content: string) => void
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);

    // Validate model parameter
    if (!model) {
      setIsLoading(false);
      const errorMessage = 'No model specified';
      setError(errorMessage);
      throw new Error(errorMessage);
    }

    // Convert string input to proper message format with context
    let chatMessages: ChatMessage[];
    
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
      // Use mock service if not configured
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
        throw new Error('AI service not available');
      }

      if (onStreamChunk) {
        // Streaming response
        let fullResponse = '';
        
        return new Promise((resolve, reject) => {
          service.sendMessageStream(
            {
              messages: chatMessages,
              model,
              maxTokens: 1000,
              temperature: 0.7,
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
        const response = await service.sendMessage({
          messages: chatMessages,
          model,
          maxTokens: 1000,
          temperature: 0.7
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
      throw new Error('AI service not available');
    }

    try {
      const response = await service.getModels();
      return response.data || response.models || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch models';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [service, shouldUseMock]);

  const getServiceInfo = useCallback(() => {
    const providerInfo = getProviderInfo(currentProvider);
    
    if (shouldUseMock) {
      return {
        mode: 'mock',
        provider: currentProvider,
        providerName: providerInfo.name,
        configured: false,
        endpoint: 'Mock Service',
        deploymentName: 'mock-gpt-4'
      };
    }

    if (!service) {
      return {
        mode: 'error',
        provider: currentProvider,
        providerName: providerInfo.name,
        configured: false,
        error: 'Service not available'
      };
    }

    const config = getSpecificProviderConfig(currentProvider);
    return {
      mode: currentProvider,
      provider: currentProvider,
      providerName: providerInfo.name,
      configured: isConfigured,
      endpoint: config?.baseUrl || (config as any)?.endpoint,
      deploymentName: (config as any)?.deploymentName,
      hasApiKey: !!config?.apiKey
    };
  }, [service, shouldUseMock, currentProvider, isConfigured]);

  // Change the current AI provider
  const changeProvider = useCallback((provider: AIProvider) => {
    setSelectedProvider(provider);
    setIsConnected(null); // Reset connection status when changing providers
    setError(null); // Clear any previous errors
  }, []);

  // Get all available models from all providers
  const getAllModels = useCallback(async () => {
    try {
      const models = await getModels();
      return models.map(model => ({
        id: model.id,
        name: model.name || model.id,
        provider: currentProvider
      }));
    } catch (error) {
      console.error('Failed to get models:', error);
      return [];
    }
  }, [getModels, currentProvider]);

  // Auto-detect provider based on selected model
  const handleModelChange = useCallback(async (modelId: string) => {
    // Find which provider this model belongs to
    try {
      const allModels = await getAllModels();
      const selectedModel = allModels.find(m => m.id === modelId);
    
      if (selectedModel && selectedModel.provider !== currentProvider) {
        console.log('Switching provider from', currentProvider, 'to', selectedModel.provider);
        setSelectedProvider(selectedModel.provider);
        setIsConnected(null); // Reset connection status
        setError(null); // Clear any previous errors
      }
    } catch (error) {
      console.error('Error handling model change:', error);
      setError('Failed to switch model');
    }
  }, [currentProvider, getAllModels]);

  return {
    sendMessage,
    getModels,
    testConnection,
    getServiceInfo,
    isLoading,
    error,
    isConnected,
    isConfigured,
    isMockMode: shouldUseMock,
    currentProvider,
    providerInfo: getProviderInfo(currentProvider),
    clearError: () => setError(null),
    changeProvider,
    handleModelChange
  };
};