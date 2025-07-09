// Mock Azure OpenAI API for development and testing
import { 
  ChatCompletionResponse, 
  ModelsResponse, 
  StreamChunk,
  ChatCompletionRequest 
} from '../types/azure-openai';
import { 
  dummyChatResponse, 
  dummyModelsResponse, 
  dummyStreamChunks 
} from '../data/dummyData';

export class MockAzureOpenAIService {
  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  async getModels(): Promise<ModelsResponse> {
    await this.delay(500); // Simulate network delay
    return dummyModelsResponse;
  }

  async createChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    await this.delay(1000); // Simulate processing time
    
    // Generate a more contextual response based on the user's message
    const userMessage = request.messages[request.messages.length - 1]?.content || '';
    const response = this.generateContextualResponse(userMessage);
    
    return {
      ...dummyChatResponse,
      choices: [{
        ...dummyChatResponse.choices[0],
        message: {
          role: 'assistant',
          content: response
        }
      }]
    };
  }

  async createChatCompletionStream(
    request: ChatCompletionRequest,
    onChunk: (chunk: StreamChunk) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const userMessage = request.messages[request.messages.length - 1]?.content || '';
      const response = this.generateContextualResponse(userMessage);
      const words = response.split(' ');
      
      // Send initial chunk with role
      onChunk({
        id: 'mock-stream-id',
        object: 'chat.completion.chunk',
        created: Date.now(),
        model: 'gpt-4',
        choices: [{
          index: 0,
          delta: { role: 'assistant', content: '' },
          finish_reason: null
        }]
      });

      // Stream words with realistic timing
      for (let i = 0; i < words.length; i++) {
        await this.delay(50 + Math.random() * 100); // Variable delay between words
        
        const content = i === 0 ? words[i] : ' ' + words[i];
        
        onChunk({
          id: 'mock-stream-id',
          object: 'chat.completion.chunk',
          created: Date.now(),
          model: 'gpt-4',
          choices: [{
            index: 0,
            delta: { content },
            finish_reason: null
          }]
        });
      }

      // Send final chunk
      await this.delay(100);
      onChunk({
        id: 'mock-stream-id',
        object: 'chat.completion.chunk',
        created: Date.now(),
        model: 'gpt-4',
        choices: [{
          index: 0,
          delta: {},
          finish_reason: 'stop'
        }]
      });

      onComplete();
    } catch (error) {
      onError(error as Error);
    }
  }

  private generateContextualResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    
    // Programming related
    if (lowerMessage.includes('react') || lowerMessage.includes('javascript') || lowerMessage.includes('code')) {
      return `Great question about ${userMessage.includes('React') ? 'React' : 'programming'}! 

Here's what you need to know:

**Key Points:**
• Modern development practices emphasize clean, maintainable code
• Component-based architecture makes applications more scalable
• Testing and documentation are crucial for long-term success

**Best Practices:**
1. Start with a solid foundation
2. Follow established patterns and conventions
3. Write tests for critical functionality
4. Keep components small and focused

**Example Implementation:**
\`\`\`javascript
const MyComponent = () => {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // Handle side effects
  }, [dependencies]);
  
  return <div>Your content here</div>;
};
\`\`\`

Would you like me to elaborate on any specific aspect or help you with implementation details?`;
    }

    // AI/ML related
    if (lowerMessage.includes('ai') || lowerMessage.includes('machine learning') || lowerMessage.includes('model')) {
      return `Excellent question about AI and machine learning!

**Understanding AI Models:**
• Large Language Models (LLMs) like GPT are trained on vast amounts of text data
• They learn patterns and relationships in language to generate human-like responses
• Different models have different strengths and use cases

**Key Concepts:**
1. **Training**: Models learn from massive datasets
2. **Inference**: Using trained models to generate responses
3. **Fine-tuning**: Adapting models for specific tasks
4. **Prompt Engineering**: Crafting inputs for better outputs

**Practical Applications:**
- Content generation and editing
- Code assistance and debugging
- Data analysis and insights
- Customer service automation

The field is rapidly evolving with new breakthroughs regularly. What specific aspect interests you most?`;
    }

    // General/default response
    return `I understand you're asking about "${userMessage}". This is an interesting topic!

**Here's my analysis:**

**Key Considerations:**
• Context and requirements are crucial for any solution
• Best practices vary depending on your specific use case
• It's important to consider both short-term and long-term implications

**Recommended Approach:**
1. **Research**: Gather information from reliable sources
2. **Plan**: Create a structured approach to tackle the problem
3. **Implement**: Start with a minimal viable solution
4. **Iterate**: Refine based on feedback and results

**Additional Insights:**
- Consider the broader ecosystem and how your solution fits
- Think about scalability and maintainability
- Don't forget about user experience and accessibility

Would you like me to dive deeper into any particular aspect, or do you have specific questions about implementation?`;
  }
}

// Export singleton instance
export const mockAzureAPI = new MockAzureOpenAIService();