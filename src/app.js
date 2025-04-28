const express = require('express');
const cors = require('cors');
const agentRoutes = require('./routes/agentRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`,
    );
  });
  next();
});

// Healthcheck route
app.get('/', (req, res) => {
  res.send('✅ Multi-Agent Server is up and running!');
});

// API Routes
app.use('/api/agent', agentRoutes);

// API documentation route
app.get('/api/docs', (req, res) => {
  res.json({
    version: '1.0.0',
    description: 'LangGraph Node.js Conditional Agent API',
    endpoints: [
      {
        path: '/api/agent/run',
        method: 'POST',
        description: 'Process a message with the appropriate agent',
        body: {
          sessionId: 'string (optional)',
          message: 'string (required)',
        },
        response: {
          success: 'boolean',
          response: {
            sessionId: 'string',
            response: 'string',
            userInfo: 'object',
          },
        },
      },
      {
        path: '/api/agent/history/:sessionId',
        method: 'GET',
        description: 'Get conversation history for a session',
        params: {
          sessionId: 'string (required)',
        },
        response: {
          success: 'boolean',
          history: 'array',
        },
      },
      {
        path: '/api/agent/sessions',
        method: 'GET',
        description: 'Get all active sessions',
        response: {
          success: 'boolean',
          sessions: 'array',
        },
      },
      {
        path: '/api/agent/sessions/:sessionId',
        method: 'DELETE',
        description: 'Clear a specific session',
        params: {
          sessionId: 'string (required)',
        },
        response: {
          success: 'boolean',
          message: 'string',
        },
      },
    ],
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Not found: ${req.originalUrl}`,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

module.exports = app;
