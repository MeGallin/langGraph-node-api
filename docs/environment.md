# Environment Variables

This document describes the environment variables used in the LangGraph-Node project.

## Required Environment Variables

| Variable         | Description                                    | Example  |
| ---------------- | ---------------------------------------------- | -------- |
| `PORT`           | The port on which the server will run          | `8000`   |
| `OPENAI_API_KEY` | Your OpenAI API key for accessing LLM services | `sk-...` |

## Optional Environment Variables

| Variable    | Description       | Default       | Example                  |
| ----------- | ----------------- | ------------- | ------------------------ |
| `NODE_ENV`  | Environment mode  | `development` | `production`             |
| `LOG_LEVEL` | Logging verbosity | `info`        | `debug`, `warn`, `error` |

## Setting Up Environment Variables

1. Create a `.env` file in the `api` directory
2. Add your environment variables in the format `KEY=VALUE`

Example `.env` file:

```
PORT=8000
OPENAI_API_KEY=sk-your-api-key-here
NODE_ENV=development
LOG_LEVEL=info
```

## Database Configuration

The SQLite database for conversation memory is stored in `./data/agent_memory.db`. This file will be created automatically when the application runs for the first time.

## Security Notes

- Never commit your `.env` file to version control
- The `.env` file is included in `.gitignore` to prevent accidental commits
- In production environments, consider using environment variables directly rather than a `.env` file
