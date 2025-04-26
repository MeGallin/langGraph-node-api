# API Documentation

This document describes the API endpoints available in the LangGraph-Node project.

## Base URL

```
http://localhost:8000
```

## Endpoints

### Health Check

```
GET /
```

Returns a simple message to confirm the server is running.

**Response**

```json
"✅ Multi-Agent Server is up and running!"
```

### Run Agent

```
POST /api/agent/run
```

Processes a user message through the agent and returns the response.

**Request Body**

```json
{
  "sessionId": "optional-session-id",
  "message": "Hello, my name is John"
}
```

| Parameter   | Type   | Required | Description                                                                                            |
| ----------- | ------ | -------- | ------------------------------------------------------------------------------------------------------ |
| `sessionId` | string | No       | A unique identifier for the conversation session. If not provided, a new session ID will be generated. |
| `message`   | string | Yes      | The user message to process.                                                                           |

**Response**

```json
{
  "success": true,
  "response": {
    "sessionId": "session_1234567890",
    "response": "Hello John! I'm Chemy, your friendly assistant. How can I help you today?",
    "userInfo": {
      "name": "John"
    }
  }
}
```

| Field                | Type    | Description                                                 |
| -------------------- | ------- | ----------------------------------------------------------- |
| `success`            | boolean | Indicates if the request was successful.                    |
| `response.sessionId` | string  | The session ID for the conversation.                        |
| `response.response`  | string  | The agent's response to the user message.                   |
| `response.userInfo`  | object  | Information about the user extracted from the conversation. |

**Error Response**

```json
{
  "success": false,
  "error": "Error message"
}
```

## Using the API

### Example: Starting a Conversation

```javascript
fetch('http://localhost:8000/api/agent/run', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'Hi there!',
  }),
})
  .then((response) => response.json())
  .then((data) => {
    console.log(data.response);
    // Save the sessionId for future requests
    const sessionId = data.response.sessionId;
  });
```

### Example: Continuing a Conversation

```javascript
fetch('http://localhost:8000/api/agent/run', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    sessionId: 'session_1234567890',
    message: 'My name is John',
  }),
})
  .then((response) => response.json())
  .then((data) => {
    console.log(data.response);
  });
```
