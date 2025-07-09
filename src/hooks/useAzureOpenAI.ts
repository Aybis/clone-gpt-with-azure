import { useState, useCallback } from 'react';
import AzureOpenAIService from '../services/azureOpenAI';
import { azureConfig } from '../config/azure-config';
import { ChatCompletionMessage, StreamChunk } from '../types/azure-openai';

export const useAzureOpenAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const service = new AzureOpenAIService(azureConfig);

  const sendMessage = useCallback(async (
    messages: ChatCompletionMessage[],
    onStreamChunk?: (content: string) => void
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      if (onStreamChunk) {
        // Streaming response
        let fullResponse = '';
        
        return new Promise((resolve, reject) => {
          service.createChatCompletionStream(
            {
              messages,
              max_tokens: 1000,
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
        const response = await service.createChatCompletion({
          messages,
          max_tokens: 1000,
          temperature: 0.7,
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
  }, [service]);

  const getModels = useCallback(async () => {
    try {
      const response = await service.getModels();
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch models';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [service]);

  return {
    sendMessage,
    getModels,
    isLoading,
    error,
    clearError: () => setError(null)
  };
};