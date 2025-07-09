// Dummy data for testing Azure OpenAI integration
import { ChatCompletionMessage, ChatCompletionResponse, ModelsResponse } from '../types/azure-openai';

// Sample chat messages for testing
export const dummyMessages: ChatCompletionMessage[] = [
  {
    role: 'system',
    content: 'You are a helpful AI assistant. Provide clear, concise, and accurate responses.'
  },
  {
    role: 'user',
    content: 'What is the difference between React hooks and class components?'
  },
  {
    role: 'assistant',
    content: 'React hooks and class components are two different ways to create components in React:\n\n**Hooks (Functional Components):**\n- Introduced in React 16.8\n- Use functions instead of classes\n- State management with useState()\n- Side effects with useEffect()\n- More concise and easier to test\n- Better performance optimization\n\n**Class Components:**\n- Traditional way before hooks\n- Use ES6 classes\n- State managed with this.state\n- Lifecycle methods like componentDidMount()\n- More verbose syntax\n- Being phased out in favor of hooks\n\nHooks are now the recommended approach for new React applications.'
  }
];

// Sample API response for chat completion
export const dummyChatResponse: ChatCompletionResponse = {
  id: 'chatcmpl-8VqKjF2mVZGKQxKzQVqKjF2mVZGK',
  object: 'chat.completion',
  created: 1701234567,
  model: 'gpt-4',
  choices: [
    {
      index: 0,
      message: {
        role: 'assistant',
        content: 'I understand you\'re asking about React development. This is a great question!\n\nReact hooks provide a more modern and functional approach to building components compared to class components. Here are the key differences:\n\n**Hooks Benefits:**\n- Simpler syntax and less boilerplate\n- Better code reusability with custom hooks\n- Easier testing and debugging\n- Better performance with React.memo and useMemo\n\n**When to use each:**\n- Use hooks for all new development\n- Class components are still supported but not recommended for new projects\n- Consider migrating existing class components gradually\n\nWould you like me to show you some specific examples of converting class components to hooks?'
      },
      finish_reason: 'stop'
    }
  ],
  usage: {
    prompt_tokens: 45,
    completion_tokens: 150,
    total_tokens: 195
  }
};

// Sample models response
export const dummyModelsResponse: ModelsResponse = {
  object: 'list',
  data: [
    {
      id: 'gpt-4',
      object: 'model',
      created: 1687882411,
      owned_by: 'openai',
      permission: [],
      root: 'gpt-4',
      parent: null
    },
    {
      id: 'gpt-4-32k',
      object: 'model',
      created: 1687882411,
      owned_by: 'openai',
      permission: [],
      root: 'gpt-4-32k',
      parent: null
    },
    {
      id: 'gpt-35-turbo',
      object: 'model',
      created: 1677610602,
      owned_by: 'openai',
      permission: [],
      root: 'gpt-35-turbo',
      parent: null
    },
    {
      id: 'gpt-35-turbo-16k',
      object: 'model',
      created: 1683758102,
      owned_by: 'openai',
      permission: [],
      root: 'gpt-35-turbo-16k',
      parent: null
    }
  ]
};

// Sample streaming chunks
export const dummyStreamChunks = [
  {
    id: 'chatcmpl-8VqKjF2mVZGKQxKzQVqKjF2mVZGK',
    object: 'chat.completion.chunk',
    created: 1701234567,
    model: 'gpt-4',
    choices: [
      {
        index: 0,
        delta: { role: 'assistant', content: '' },
        finish_reason: null
      }
    ]
  },
  {
    id: 'chatcmpl-8VqKjF2mVZGKQxKzQVqKjF2mVZGK',
    object: 'chat.completion.chunk',
    created: 1701234567,
    model: 'gpt-4',
    choices: [
      {
        index: 0,
        delta: { content: 'I' },
        finish_reason: null
      }
    ]
  },
  {
    id: 'chatcmpl-8VqKjF2mVZGKQxKzQVqKjF2mVZGK',
    object: 'chat.completion.chunk',
    created: 1701234567,
    model: 'gpt-4',
    choices: [
      {
        index: 0,
        delta: { content: ' understand' },
        finish_reason: null
      }
    ]
  },
  {
    id: 'chatcmpl-8VqKjF2mVZGKQxKzQVqKjF2mVZGK',
    object: 'chat.completion.chunk',
    created: 1701234567,
    model: 'gpt-4',
    choices: [
      {
        index: 0,
        delta: { content: ' you\'re asking about...' },
        finish_reason: null
      }
    ]
  }
];

// Error responses for testing error handling
export const dummyErrorResponses = {
  unauthorized: {
    error: {
      message: 'Incorrect API key provided',
      type: 'invalid_request_error',
      param: null,
      code: 'invalid_api_key'
    }
  },
  rateLimited: {
    error: {
      message: 'Rate limit reached for requests',
      type: 'requests',
      param: null,
      code: 'rate_limit_exceeded'
    }
  },
  quotaExceeded: {
    error: {
      message: 'You exceeded your current quota',
      type: 'insufficient_quota',
      param: null,
      code: 'insufficient_quota'
    }
  }
};