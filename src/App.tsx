import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import ChatInput from './components/ChatInput';
import ModelSelector from './components/ModelSelector';
import { Menu } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Chat {
  id: string;
  title: string;
  timestamp: Date;
  preview: string;
  messages: Message[];
}

function App() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Initialize with sample chats
  useEffect(() => {
    const sampleChats: Chat[] = [
      {
        id: '1',
        title: 'NextResponse redirect vs rewrite',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        preview: 'What is the difference between redirect and rewrite...',
        messages: [
          {
            id: '1-1',
            type: 'user',
            content: 'What is the difference between redirect and rewrite in NextResponse?',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          {
            id: '1-2',
            type: 'assistant',
            content: `Great question! In Next.js, **NextResponse.redirect()** and **NextResponse.rewrite()** serve different purposes:

## NextResponse.redirect()
- Sends a 301/302 HTTP redirect response to the client
- Changes the URL in the browser address bar
- The client makes a new request to the redirect destination
- Visible to the user and search engines

## NextResponse.rewrite()
- Internally forwards the request to a different URL
- Keeps the original URL in the browser address bar
- The client doesn't know about the internal forwarding
- Invisible to the user and search engines

### Example Usage:

\`\`\`javascript
// Redirect - user sees new URL
return NextResponse.redirect(new URL('/login', request.url))

// Rewrite - user keeps original URL
return NextResponse.rewrite(new URL('/api/v2/users', request.url))
\`\`\`

**Use redirect for:** permanent moves, temporary redirects, or when you want users to see the new URL.

**Use rewrite for:** A/B testing, internationalization, or serving different content while keeping the same URL.`,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000)
          }
        ]
      },
      {
        id: '2',
        title: 'Wultra SSL Pinning iOS',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        preview: 'How to implement SSL pinning in iOS with Wultra...',
        messages: [
          {
            id: '2-1',
            type: 'user',
            content: 'How to implement SSL pinning in iOS with Wultra?',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        ]
      },
      {
        id: '3',
        title: 'Dokumentasi API Maya',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        preview: 'Can you help me create API documentation...',
        messages: [
          {
            id: '3-1',
            type: 'user',
            content: 'Can you help me create API documentation for Maya project?',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          }
        ]
      }
    ];
    
    setChats(sampleChats);
  }, []);

  const getCurrentChat = () => {
    return chats.find(chat => chat.id === activeChat);
  };

  const handleNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      timestamp: new Date(),
      preview: '',
      messages: []
    };
    
    setChats(prev => [newChat, ...prev]);
    setActiveChat(newChat.id);
  };

  const handleChatSelect = (chatId: string) => {
    setActiveChat(chatId);
  };

  const handleDeleteChat = (chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    if (activeChat === chatId) {
      setActiveChat(null);
    }
  };

  const handleRenameChat = (chatId: string, newTitle: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, title: newTitle } : chat
    ));
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    let chatId = activeChat;
    
    // Create new chat if none is active
    if (!chatId) {
      const newChat: Chat = {
        id: Date.now().toString(),
        title: content.length > 50 ? content.substring(0, 50) + '...' : content,
        timestamp: new Date(),
        preview: content.length > 100 ? content.substring(0, 100) + '...' : content,
        messages: []
      };
      
      setChats(prev => [newChat, ...prev]);
      chatId = newChat.id;
      setActiveChat(chatId);
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };

    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { 
            ...chat, 
            messages: [...chat.messages, userMessage],
            preview: content.length > 100 ? content.substring(0, 100) + '...' : content,
            title: chat.title === 'New Chat' ? (content.length > 50 ? content.substring(0, 50) + '...' : content) : chat.title
          }
        : chat
    ));

    // Get current chat with all messages for context
    const currentChatWithNewMessage = chats.find(chat => chat.id === chatId);
    const allMessages = currentChatWithNewMessage ? [...currentChatWithNewMessage.messages, userMessage] : [userMessage];
    
    // Simulate AI response with context memory
    setIsLoading(true);
    
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateMarkdownResponse(content, allMessages),
        timestamp: new Date()
      };

      setChats(prev => prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, messages: [...chat.messages, assistantMessage] }
          : chat
      ));
      
      setIsLoading(false);
    }, 1500);
  };

  const generateMarkdownResponse = (input: string, conversationHistory: Message[]): string => {
    const lowerInput = input.toLowerCase();
    
    // Extract context from conversation history
    const previousMessages = conversationHistory.slice(0, -1); // Exclude current message
    const hasContext = previousMessages.length > 0;
    
    // Check if this is a follow-up question
    const followUpIndicators = ['what about', 'and', 'also', 'can you', 'how about', 'what if', 'but', 'however', 'tell me more', 'explain', 'elaborate'];
    const isFollowUp = followUpIndicators.some(indicator => lowerInput.includes(indicator));
    
    // Get recent context (last 3 messages for better performance)
    const recentContext = previousMessages.slice(-3);
    const contextTopics = recentContext
      .filter(msg => msg.type === 'user')
      .map(msg => msg.content.toLowerCase())
      .join(' ');
    
    if (lowerInput.includes('code') || lowerInput.includes('programming')) {
      const contextualIntro = hasContext && isFollowUp 
        ? `# Following up on our coding discussion\n\nBuilding on what we discussed earlier about ${getMainTopic(contextTopics)}, let me address your question about **${input}**.\n\n`
        : `# Code Help Response\n\nI'd be happy to help you with **${input}**!\n\n`;
        
      return `${contextualIntro}## Key Points:
- Modern development practices emphasize clean, maintainable code
- Component-based architecture makes applications more scalable
- Testing and documentation are crucial for long-term success
${hasContext ? '- Building on our previous discussion, here are additional considerations' : ''}

### Example Implementation:

\`\`\`javascript
const MyComponent = () => {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // Handle side effects
    fetchData();
  }, [dependencies]);
  
  return (
    <div className="container">
      <h1>Your content here</h1>
    </div>
  );
};
\`\`\`

${hasContext ? `> **Building on our conversation:** This approach complements what we discussed about ${getMainTopic(contextTopics)}.` : '> **Pro tip:** Always follow established patterns and conventions in your field.'}

Would you like me to elaborate on any specific aspect${hasContext ? ' or continue with our previous discussion' : ''}?`;
    }

    // Handle follow-up questions with context
    if (hasContext && isFollowUp) {
      return `# Continuing our conversation

I see you're asking about **${input}** in relation to our previous discussion about ${getMainTopic(contextTopics)}.

## Building on what we covered:

### Previous Context:
${recentContext.filter(msg => msg.type === 'user').map((msg, index) => 
  `${index + 1}. You asked about: "${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}"`
).join('\n')}

### Now addressing: "${input}"

This is a great follow-up question! Here's how it connects to our discussion:

- **Relationship to previous topics**: This builds directly on the concepts we explored
- **New insights**: ${input} adds another dimension to consider
- **Practical implications**: This affects the approach we discussed earlier

### Updated Recommendations:

| Aspect | Previous Discussion | Current Question | Combined Approach |
|--------|-------------------|------------------|-------------------|
| Context | ${getMainTopic(contextTopics)} | ${input.substring(0, 30)}... | Integrated solution |
| Approach | Foundation laid | Building upon it | Comprehensive strategy |
| Next Steps | Initial direction | Refined focus | Clear action plan |

> **Connecting the dots:** This question shows you're thinking deeply about the topic. The combination of ${getMainTopic(contextTopics)} and ${input} creates interesting possibilities.

Would you like me to dive deeper into how these concepts work together, or do you have other related questions?`;
    }

    // Default response with context awareness
    const contextualIntro = hasContext 
      ? `# Response to: "${input}"\n\nI notice we've been discussing ${getMainTopic(contextTopics)}. Now you're asking about **${input}** - let me address this in context.\n\n`
      : `# Response to: "${input}"\n\nI understand you're asking about **${input}**. This is an interesting topic!\n\n`;

    return `${contextualIntro}## Analysis:

### Key Considerations:
- Context and requirements are crucial for any solution
- Best practices vary depending on your specific use case
- It's important to consider both short-term and long-term implications
${hasContext ? `- This relates to our earlier discussion about ${getMainTopic(contextTopics)}` : ''}

### Recommended Approach:

1. **Research**: Gather information from reliable sources
2. **Plan**: Create a structured approach to tackle the problem
3. **Implement**: Start with a minimal viable solution
4. **Iterate**: Refine based on feedback and results
${hasContext ? '5. **Connect**: Consider how this integrates with our previous topics' : ''}

### Additional Insights:

| Aspect | Consideration |
|--------|---------------|
| Scalability | Think about future growth |
| Maintainability | Code should be easy to update |
| User Experience | Always consider the end user |
${hasContext ? `| Context Integration | How this fits with ${getMainTopic(contextTopics)} |` : ''}

> **Remember:** ${hasContext ? `Building on our conversation about ${getMainTopic(contextTopics)}, don't forget about` : 'Don\'t forget about'} accessibility and performance optimization.

**Would you like me to dive deeper into any particular aspect${hasContext ? ' or explore how this connects to our previous discussion' : ''}?**`;
  };

  // Helper function to extract main topic from context
  const getMainTopic = (contextText: string): string => {
    const topics = {
      'react': 'React development',
      'javascript': 'JavaScript programming', 
      'code': 'coding practices',
      'api': 'API development',
      'database': 'database design',
      'ui': 'user interface design',
      'css': 'CSS styling',
      'typescript': 'TypeScript development',
      'azure': 'Azure services',
      'ai': 'artificial intelligence',
      'machine learning': 'machine learning',
      'deployment': 'application deployment',
      'testing': 'software testing',
      'performance': 'performance optimization'
    }

    for (const [keyword, topic] of Object.entries(topics)) {
      if (contextText.includes(keyword)) {
        return topic;
      }
    }
    
    return 'our previous topics';
  };

  const handleStopGeneration = () => {
    setIsLoading(false);
  };

  const currentChat = getCurrentChat();

  return (
    <div className="flex h-screen bg-zinc-800 md:bg-zinc-100">
      <Sidebar
        chats={chats}
        activeChat={activeChat}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header with Model Selector */}
        <div className="bg-zinc-800 border-b border-zinc-700 p-3 flex-shrink-0">
          <div className={`max-w-4xl mx-auto flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between lg:justify-center'}`}>
            {/* Mobile Menu Button */}
            <div className={`flex items-center gap-2 ${isSidebarCollapsed ? 'absolute left-4' : ''}`}>
              {isSidebarCollapsed && (
                <button
                  onClick={() => setIsSidebarCollapsed(false)}
                  className="hidden lg:block p-2 text-white hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  <Menu size={20} />
                </button>
              )}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 text-white hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <Menu size={20} />
              </button>
            </div>
            
            {/* Model Selector */}
            <ModelSelector 
              selectedModel={selectedModel} 
              onModelSelect={setSelectedModel} 
            />
            
            {/* Spacer for mobile to center the model selector */}
            <div className={`lg:hidden w-10 ${isSidebarCollapsed ? 'hidden' : ''}`}></div>
          </div>
        </div>
        
        <div className="flex-1 min-h-0">
          <ChatArea
            messages={currentChat?.messages || []}
            isLoading={isLoading}
          />
        </div>
        
        <div className="flex-shrink-0">
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onStopGeneration={handleStopGeneration}
          />
        </div>
      </div>
    </div>
  );
}

export default App;

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
  };

  const handleStopGeneration = () => {
    setIsLoading(false);
  };

  const currentChat = getCurrentChat();

  return (
    <div className="flex h-screen bg-zinc-800 md:bg-zinc-100">
      <Sidebar
        chats={chats}
        activeChat={activeChat}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header with Model Selector */}
        <div className="bg-zinc-800 border-b border-zinc-700 p-3 flex-shrink-0">
          <div className={`max-w-4xl mx-auto flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between lg:justify-center'}`}>
            {/* Mobile Menu Button */}
            <div className={`flex items-center gap-2 ${isSidebarCollapsed ? 'absolute left-4' : ''}`}>
              {isSidebarCollapsed && (
                <button
                  onClick={() => setIsSidebarCollapsed(false)}
                  className="hidden lg:block p-2 text-white hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  <Menu size={20} />
                </button>
              )}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 text-white hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <Menu size={20} />
              </button>
            </div>
            
            {/* Model Selector */}
            <ModelSelector 
              selectedModel={selectedModel} 
              onModelSelect={setSelectedModel} 
            />
            
            {/* Spacer for mobile to center the model selector */}
            <div className={`lg:hidden w-10 ${isSidebarCollapsed ? 'hidden' : ''}`}></div>
          </div>
        </div>
        
        <div className="flex-1 min-h-0">
          <ChatArea
            messages={currentChat?.messages || []}
            isLoading={isLoading}
          />
        </div>
        
        <div className="flex-shrink-0">
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onStopGeneration={handleStopGeneration}
          />
        </div>
      </div>
    </div>
  );
}

export default App;