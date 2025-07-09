# Frontend API Integration Guide

## Required API Endpoints for Backend Integration

### 1. **GET /api/chats**
Get all user chats
```json
Response: [
  {
    "id": "chat_123",
    "title": "My Chat Title",
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T10:30:00Z"
  }
]
```

### 2. **GET /api/chats/:chatId**
Get specific chat with messages
```json
Response: {
  "id": "chat_123",
  "title": "My Chat Title",
  "messages": [
    {
      "id": "msg_456",
      "role": "user",
      "content": "Hello",
      "timestamp": "2024-01-01T10:00:00Z"
    },
    {
      "id": "msg_789",
      "role": "assistant", 
      "content": "Hi there!",
      "timestamp": "2024-01-01T10:01:00Z"
    }
  ],
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:30:00Z"
}
```

### 3. **POST /api/chats**
Create new chat
```json
Request: {
  "title": "Optional chat title"
}

Response: {
  "id": "chat_123",
  "title": "New Chat",
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z"
}
```

### 4. **POST /api/messages**
Send message to chat
```json
Request: {
  "message": "User message content",
  "chat_id": "chat_123", // optional, creates new chat if not provided
  "model": "gpt-4" // optional, uses default if not provided
}

Response: {
  "message": {
    "id": "msg_789",
    "role": "assistant",
    "content": "AI response in markdown format",
    "timestamp": "2024-01-01T10:01:00Z"
  },
  "chat_id": "chat_123"
}
```

### 5. **POST /api/messages/stream**
Stream message response (Server-Sent Events)
```json
Request: {
  "message": "User message content",
  "chat_id": "chat_123",
  "model": "gpt-4"
}

Response: Stream of chunks
data: {"content": "Hello", "done": false}
data: {"content": " there!", "done": false}
data: {"content": "", "done": true}
```

### 6. **DELETE /api/chats/:chatId**
Delete chat
```json
Response: {
  "success": true
}
```

### 7. **PATCH /api/chats/:chatId**
Update chat title
```json
Request: {
  "title": "New chat title"
}

Response: {
  "id": "chat_123",
  "title": "New chat title",
  "updated_at": "2024-01-01T10:30:00Z"
}
```

### 8. **GET /api/models**
Get available AI models
```json
Response: [
  {
    "id": "gpt-4",
    "name": "GPT-4",
    "description": "Most capable model"
  },
  {
    "id": "gpt-3.5-turbo",
    "name": "GPT-3.5 Turbo", 
    "description": "Fast and efficient"
  }
]
```

## Environment Variables Needed

```env
REACT_APP_API_URL=http://localhost:3001/api
```

## Important Notes

1. **Markdown Support**: All AI responses should be in markdown format
2. **Responsive Design**: UI works on mobile, tablet, and desktop
3. **Real-time**: Use streaming endpoint for better UX
4. **Error Handling**: Handle network errors gracefully
5. **Authentication**: Add auth headers if needed

## Usage in Frontend

```javascript
import { apiService } from './services/api';

// Send message
const response = await apiService.sendMessage({
  message: "Hello",
  chat_id: "chat_123",
  model: "gpt-4"
});

// Get chats
const chats = await apiService.getChats();

// Stream message
const stream = await apiService.streamMessage({
  message: "Hello",
  chat_id: "chat_123"
});
```