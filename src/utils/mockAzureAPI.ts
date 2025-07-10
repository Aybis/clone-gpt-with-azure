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
    
    // Check if this looks like a follow-up question
    const followUpIndicators = ['what about', 'and', 'also', 'can you', 'how about', 'what if', 'but', 'however', 'tell me more', 'explain', 'elaborate', 'continue', 'more details'];
    const isFollowUp = followUpIndicators.some(indicator => lowerMessage.includes(indicator));
    
    // Programming related
    if (lowerMessage.includes('react') || lowerMessage.includes('javascript') || lowerMessage.includes('code')) {
      const contextualIntro = isFollowUp 
        ? `Building on our previous discussion, let me address your follow-up about ${userMessage.includes('React') ? 'React' : 'programming'}:`
        : `Great question about ${userMessage.includes('React') ? 'React' : 'programming'}!`;
        
      return `${contextualIntro}

## Key Points:
• Modern development practices emphasize clean, maintainable code
• Component-based architecture makes applications more scalable
• Testing and documentation are crucial for long-term success
${isFollowUp ? '• This builds on the concepts we discussed earlier' : ''}

## Best Practices:
1. Start with a solid foundation
2. Follow established patterns and conventions
3. Write tests for critical functionality
4. Keep components small and focused
${isFollowUp ? '5. Consider how this integrates with our previous discussion' : ''}

## Example Implementation:
\`\`\`javascript
const MyComponent = () => {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // Handle side effects
  }, [dependencies]);
  
  return <div>Your content here</div>;
};
\`\`\`

${isFollowUp ? 'This approach complements what we discussed earlier. ' : ''}Would you like me to elaborate on any specific aspect${isFollowUp ? ' or continue building on our conversation' : ''}?`;
    }

    // AI/ML related with context awareness
    if (lowerMessage.includes('ai') || lowerMessage.includes('machine learning') || lowerMessage.includes('model')) {
      const contextualIntro = isFollowUp
        ? `Continuing our AI discussion, you're now asking about **${userMessage}**. Great follow-up!`
        : `Excellent question about AI and machine learning!`;
        
      return `${contextualIntro}

## Understanding AI Models:
• Large Language Models (LLMs) like GPT are trained on vast amounts of text data
• They learn patterns and relationships in language to generate human-like responses
• Different models have different strengths and use cases
${isFollowUp ? '• This connects to the concepts we were exploring earlier' : ''}

## Key Concepts:
1. **Training**: Models learn from massive datasets
2. **Inference**: Using trained models to generate responses
3. **Fine-tuning**: Adapting models for specific tasks
4. **Prompt Engineering**: Crafting inputs for better outputs
${isFollowUp ? '5. **Context Continuity**: How models maintain conversation flow (like we\'re doing now!)' : ''}

## Practical Applications:
- Content generation and editing
- Code assistance and debugging
- Data analysis and insights
- Customer service automation
${isFollowUp ? '- Contextual conversation (as demonstrated in our chat)' : ''}

${isFollowUp ? 'Building on our conversation, this ' : 'The '}field is rapidly evolving with new breakthroughs regularly. What specific aspect interests you most${isFollowUp ? ' as we continue our discussion' : ''}?`;
    }

    // Handle general follow-up questions
    if (isFollowUp) {
      return `## Following up on our conversation

I see you're asking about **${userMessage}** as a follow-up to our previous discussion. This shows great continuity in your thinking!

### Building on our conversation:
- **Previous context**: We've been exploring related concepts
- **Current question**: "${userMessage}" adds a new dimension
- **Connection**: This naturally extends our discussion

### Contextual Analysis:

**How this relates to what we discussed:**
1. **Conceptual continuity**: Your question builds logically on previous topics
2. **Deeper exploration**: You're diving into more specific aspects
3. **Practical application**: This shows you're thinking about implementation

**Key insights for your follow-up:**
- Context matters significantly in any solution
- Building incrementally on previous knowledge is effective
- Follow-up questions often reveal the most important details

### Integrated Approach:

| Previous Discussion | Current Question | Combined Insight |
|-------------------|------------------|------------------|
| Foundation concepts | Specific application | Comprehensive understanding |
| General principles | Detailed implementation | Practical solution |
| Theoretical framework | Real-world usage | Actionable strategy |

> **Great follow-up!** This type of progressive questioning leads to much deeper understanding.

Would you like me to explore how this specifically connects to our earlier points, or shall we dive deeper into this particular aspect?`;
    }

    // Default response
    return `## Response to: "${userMessage}"

I understand you're asking about **${userMessage}**. This is an interesting topic!

### Analysis:

**Key Considerations:**
• Context and requirements are crucial for any solution
• Best practices vary depending on your specific use case
• It's important to consider both short-term and long-term implications

**Recommended Approach:**
1. **Research**: Gather information from reliable sources
2. **Plan**: Create a structured approach to tackle the problem
3. **Implement**: Start with a minimal viable solution
4. **Iterate**: Refine based on feedback and results

### Additional Insights:

| Aspect | Consideration |
|--------|---------------|
| Scalability | Think about future growth |
| Maintainability | Code should be easy to update |
| User Experience | Always consider the end user |

> **Remember:** Don't forget about accessibility and performance optimization.

**Would you like me to dive deeper into any particular aspect?**`;
  }
}

// Export singleton instance
export const mockAzureAPI = new MockAzureOpenAIService();