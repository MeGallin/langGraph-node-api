const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');

// Process a message with the appropriate agent
router.post('/run', agentController.runAgent);

// Get conversation history for a session
router.get('/history/:sessionId', agentController.getSessionHistory);

// Get all active sessions
router.get('/sessions', agentController.getActiveSessions);

// Clear a specific session
router.delete('/sessions/:sessionId', agentController.clearSession);

module.exports = router;
