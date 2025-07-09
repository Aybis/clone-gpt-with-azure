# 🤖 ChatGPT Clone with Azure OpenAI

A beautiful, fully-featured ChatGPT clone built with React, TypeScript, and Tailwind CSS. Integrates seamlessly with Azure OpenAI for production use, with mock responses for development.

![ChatGPT Clone Screenshot](https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop)

## ✨ Features

- 🎨 **Beautiful UI** - Modern, responsive design that works on all devices
- 💬 **Real-time Chat** - Streaming responses with typing indicators
- 📱 **Mobile Friendly** - Optimized for mobile, tablet, and desktop
- 🔄 **Chat Management** - Create, rename, delete, and search conversations
- 🎯 **Model Selection** - Choose between different AI models
- 🔧 **Development Mode** - Mock responses for development without API costs
- 🚀 **Production Ready** - Full Azure OpenAI integration
- 📝 **Markdown Support** - Rich text formatting in responses
- 🎨 **Syntax Highlighting** - Code blocks with proper formatting
- 💾 **Local Storage** - Conversations persist between sessions

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd chatgpt-clone
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The app will start in **Mock Mode** - perfect for development! You'll see realistic AI responses without needing any API keys.

### 3. (Optional) Configure Azure OpenAI for Production

Create a `.env` file in the project root:

```env
VITE_AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com
VITE_AZURE_OPENAI_API_KEY=your-api-key-here
VITE_AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
VITE_AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

## 📋 Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **Azure OpenAI Resource** (for production only)

## 🔧 Environment Setup

### Supabase Database Setup

This application uses Supabase for data storage. You'll need to set up a Supabase project:

1. **Create a Supabase Project**
   - Go to [Supabase](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key from Settings > API

2. **Configure Environment Variables**
   
   Add these to your `.env` file:
   
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### Development Mode (Default)
No configuration needed! The app automatically uses mock responses when Azure OpenAI isn't configured.

### Production Mode (Azure OpenAI)

1. **Create Azure OpenAI Resource**
   - Go to [Azure Portal](https://portal.azure.com)
   - Create an "Azure OpenAI" resource
   - Note your endpoint URL and API key

2. **Deploy a Model**
   - In your Azure OpenAI resource, go to "Model deployments"
   - Deploy GPT-4 or GPT-3.5-turbo
   - Note your deployment name

3. **Configure Environment Variables**
   
   Copy `.env.example` to `.env` and fill in your values:
   
   ```env
   # Required for Azure OpenAI
   VITE_AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com
   VITE_AZURE_OPENAI_API_KEY=your-api-key-here
   VITE_AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
   VITE_AZURE_OPENAI_API_VERSION=2024-02-15-preview
   
   # Optional: Customize default settings
   VITE_DEFAULT_MODEL=gpt-4
   VITE_MAX_TOKENS=1000
   VITE_TEMPERATURE=0.7
   ```

4. **Restart the Development Server**
   ```bash
   npm run dev
   ```

## 🎯 How It Works

### Automatic Mode Detection

The app automatically detects your configuration:

- **🟡 Mock Mode**: No Azure configuration → Uses realistic mock responses
- **🟢 Connected**: Valid Azure configuration → Uses real Azure OpenAI
- **🔴 Error**: Invalid configuration → Shows error details

### Status Indicator

Check the sidebar for your current status:
- Connection status (Connected/Mock Mode/Error)
- Configuration details
- Test connection button

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ChatArea.tsx    # Main chat interface
│   ├── ChatInput.tsx   # Message input component
│   ├── ChatMessage.tsx # Individual message display
│   ├── ModelSelector.tsx # AI model selection
│   ├── Sidebar.tsx     # Chat history sidebar
│   └── AzureStatus.tsx # Connection status indicator
├── hooks/              # Custom React hooks
│   └── useAzureOpenAI.ts # Azure OpenAI integration
├── services/           # API services
│   ├── azureOpenAI.ts  # Azure OpenAI service
│   └── api.ts          # Backend API service
├── types/              # TypeScript type definitions
├── config/             # Configuration files
├── utils/              # Utility functions
└── data/               # Mock data for development
```

## 🛠️ Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## 🎨 Customization

### Styling
- Built with **Tailwind CSS**
- Responsive design with mobile-first approach
- Dark/light theme support
- Easily customizable color scheme

### Models
Add or modify available models in `src/config/azure-config.ts`:

```typescript
export const azureModels = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'Most capable model',
    maxTokens: 8192,
    deploymentName: 'gpt-4',
    costPer1kTokens: 0.03
  }
  // Add more models...
];
```

## 🔒 Security Best Practices

- ✅ Environment variables for sensitive data
- ✅ No API keys in client-side code
- ✅ Proper error handling
- ✅ Input validation and sanitization
- ✅ HTTPS enforcement in production

## 📱 Mobile Support

- Responsive design works on all screen sizes
- Touch-friendly interface
- Mobile-optimized sidebar
- Swipe gestures for navigation

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Netlify

1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Set environment variables in Netlify dashboard

### Deploy to Vercel

1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Environment Variables for Production

Make sure to set these in your hosting platform:

```
VITE_AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com
VITE_AZURE_OPENAI_API_KEY=your-api-key-here
VITE_AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
VITE_AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

## 🐛 Troubleshooting

### Common Issues

**"Mock Mode" showing when I configured Azure?**
- Check your `.env` file exists in project root
- Verify all required environment variables are set
- Restart the development server

**Connection errors?**
- Verify your Azure OpenAI endpoint URL
- Check your API key is correct
- Ensure your deployment name matches exactly
- Test connection using the "Test" button in sidebar

**Build errors?**
- Run `npm install` to ensure all dependencies are installed
- Check for TypeScript errors: `npm run lint`
- Clear node_modules and reinstall if needed

### Getting Help

1. Check the connection status in the sidebar
2. Look at browser console for error messages
3. Verify your Azure OpenAI resource is active
4. Test your API key with a simple curl request

## 📚 Learn More

- [Azure OpenAI Documentation](https://docs.microsoft.com/en-us/azure/cognitive-services/openai/)
- [React Documentation](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm run lint`
5. Commit changes: `git commit -m 'Add feature'`
6. Push to branch: `git push origin feature-name`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for the amazing GPT models
- Microsoft Azure for the OpenAI service
- The React and TypeScript communities
- Tailwind CSS for the beautiful styling system

---

**Made with ❤️ by [Your Name]**

*Ready to chat? Start the development server and begin your conversation!*