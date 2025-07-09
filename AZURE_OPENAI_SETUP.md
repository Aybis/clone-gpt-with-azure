# Azure OpenAI Integration Setup Guide

This guide will help you integrate your ChatGPT clone with Azure OpenAI services.

## Prerequisites

1. **Azure Subscription**: You need an active Azure subscription
2. **Azure OpenAI Resource**: Create an Azure OpenAI resource in the Azure portal
3. **Model Deployments**: Deploy the models you want to use

## Step 1: Create Azure OpenAI Resource

1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource"
3. Search for "Azure OpenAI"
4. Click "Create" and fill in the required information:
   - **Subscription**: Your Azure subscription
   - **Resource Group**: Create new or use existing
   - **Region**: Choose a region that supports Azure OpenAI
   - **Name**: Give your resource a unique name
   - **Pricing Tier**: Select appropriate tier

## Step 2: Deploy Models

1. Go to your Azure OpenAI resource
2. Click on "Model deployments" in the left menu
3. Click "Create new deployment"
4. Choose your model (e.g., GPT-4, GPT-3.5-turbo)
5. Give it a deployment name (you'll use this in your code)
6. Configure capacity settings

## Step 3: Get API Keys and Endpoint

1. In your Azure OpenAI resource, go to "Keys and Endpoint"
2. Copy the following:
   - **Endpoint**: Your resource endpoint URL
   - **Key 1** or **Key 2**: Your API key

## Step 4: Environment Variables

The project now uses Vite environment variables. Create a `.env` file in your project root with:

```env
VITE_AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com
VITE_AZURE_OPENAI_API_KEY=your-api-key-here
VITE_AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment-name
VITE_AZURE_OPENAI_API_VERSION=2024-02-15-preview

# Optional: Default model settings
VITE_DEFAULT_MODEL=gpt-4
VITE_MAX_TOKENS=1000
VITE_TEMPERATURE=0.7
```

**Important:** 
- Use `VITE_` prefix for all environment variables in Vite
- Never commit your `.env` file to version control
- Use `.env.example` as a template for other developers

## Step 5: Install Dependencies

```bash
npm install
```

## Step 6: Development vs Production

The application automatically detects if Azure OpenAI is configured:

**Development Mode (Mock):**
- If environment variables are not set, uses mock responses
- Perfect for development and testing
- No API costs incurred
- Shows "Mock Mode" status in sidebar

**Production Mode (Azure):**
- Uses actual Azure OpenAI when properly configured
- Shows connection status in sidebar
- Includes health check and error handling

## Step 7: Configuration Validation

The application includes automatic validation:
- Checks for required environment variables
- Validates API connection on startup
- Shows configuration status in the sidebar
- Provides helpful error messages

## API Endpoints You'll Use

### 1. Chat Completions
```
POST {endpoint}/openai/deployments/{deployment-name}/chat/completions?api-version=2024-02-15-preview
```

### 2. List Models
```
GET {endpoint}/openai/models?api-version=2024-02-15-preview
```

### 3. Embeddings (if needed)
```
POST {endpoint}/openai/deployments/{deployment-name}/embeddings?api-version=2024-02-15-preview
```

## Headers Required

```javascript
{
  'Content-Type': 'application/json',
  'api-key': 'your-api-key'
}
```

## Sample Request Body (Chat Completion)

```json
{
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "max_tokens": 1000,
  "temperature": 0.7,
  "top_p": 0.95,
  "frequency_penalty": 0,
  "presence_penalty": 0,
  "stream": false
}
```

## Streaming Support

For real-time responses, set `"stream": true` in your request and handle Server-Sent Events (SSE).

## Error Handling

Common error codes:
- `401`: Invalid API key
- `429`: Rate limit exceeded
- `403`: Quota exceeded
- `404`: Deployment not found

## Security Best Practices

1. **Never expose API keys in client-side code**
2. **Use environment variables**
3. **Implement proper error handling**
4. **Set up rate limiting**
5. **Monitor usage and costs**

## Cost Optimization

1. **Use appropriate models** (GPT-3.5 for simple tasks, GPT-4 for complex ones)
2. **Set max_tokens limits**
3. **Implement caching for repeated queries**
4. **Monitor token usage**

## Testing

Use the dummy data provided in `src/data/dummyData.ts` to test your integration before connecting to the actual API.

## Troubleshooting

### Common Issues:

1. **CORS errors**: Make sure you're making requests from your backend, not frontend
2. **Authentication errors**: Verify your API key and endpoint
3. **Model not found**: Ensure your deployment name matches exactly
4. **Rate limiting**: Implement exponential backoff for retries

### Debug Steps:

1. Test API connection with a simple curl command
2. Verify environment variables are loaded correctly
3. Check Azure OpenAI resource status in portal
4. Review request/response logs

## Next Steps

1. Implement the service in your React app
2. Add error handling and loading states
3. Implement streaming for better UX
4. Add conversation memory management
5. Implement user authentication and session management

## Support

- [Azure OpenAI Documentation](https://docs.microsoft.com/en-us/azure/cognitive-services/openai/)
- [Azure OpenAI REST API Reference](https://docs.microsoft.com/en-us/azure/cognitive-services/openai/reference)
- [Azure Support](https://azure.microsoft.com/en-us/support/)