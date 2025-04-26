# LangGraph-Node

A Node.js implementation of LangGraph for building conversational agents with LangChain.

## Overview

LangGraph-Node is a framework for building conversational agents using a graph-based approach. It provides a structured way to implement multi-agent systems with LangChain and Node.js.

## Features

- 🧠 **LangGraph Architecture**: Sequential flow of nodes for agent processing
- 🔄 **Persistent Memory**: SQLite-based conversation memory
- 🛠️ **Tool Integration**: Support for agent tools like time retrieval and user info storage
- 🔌 **RESTful API**: Express.js API for easy integration
- 📝 **Session Management**: Conversation state tracking across sessions

## Project Structure

```
langGraph-node/
├── data/                # SQLite database storage
├── docs/                # Documentation
├── src/
│   ├── app.js           # Express app configuration
│   ├── config/          # Configuration files
│   ├── controllers/     # API controllers
│   ├── memory/          # Memory implementations
│   ├── nodes/           # LangGraph node definitions
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   └── tools/           # Agent tools
├── tests/               # Test files
├── .env                 # Environment variables
├── .gitignore           # Git ignore file
├── package.json         # Project configuration
└── server.js            # Main server entry point
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
cd api
npm install
```

3. Create a `.env` file in the `api` directory with your OpenAI API key:

```
PORT=8000
OPENAI_API_KEY=your-api-key-here
```

### Running the Server

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The server will be available at `http://localhost:8000`.

## API Usage

See [API Documentation](./docs/api.md) for detailed API usage.

Basic example:

```javascript
// Start a conversation
fetch('http://localhost:8000/api/agent/run', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Hello!' }),
})
  .then((response) => response.json())
  .then((data) => console.log(data));
```

## Documentation

- [API Documentation](./docs/api.md)
- [Environment Variables](./docs/environment.md)
- [Flow Implementation](./docs/flowStep123.md)
- [Migration Plan](./docs/workflow.md)

## License

MIT
