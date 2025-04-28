const agentService = require('../services/agentService');

/**
 * Process a message with the appropriate agent
 */
exports.runAgent = async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Message is required and must be a non-empty string',
      });
    }

    const response = await agentService.processMessage(sessionId, message);
    res.json({ success: true, response });
  } catch (error) {
    console.error('Error in runAgent:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get conversation history for a session
 */
exports.getSessionHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required',
      });
    }

    const history = agentService.getSessionHistory(sessionId);
    res.json({ success: true, history });
  } catch (error) {
    console.error('Error in getSessionHistory:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get all active sessions
 */
exports.getActiveSessions = async (req, res) => {
  try {
    const sessions = agentService.getActiveSessions();
    res.json({ success: true, sessions });
  } catch (error) {
    console.error('Error in getActiveSessions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Clear a specific session
 */
exports.clearSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required',
      });
    }

    const success = agentService.clearSession(sessionId);

    if (success) {
      res.json({
        success: true,
        message: `Session ${sessionId} cleared successfully`,
      });
    } else {
      res
        .status(404)
        .json({ success: false, error: `Session ${sessionId} not found` });
    }
  } catch (error) {
    console.error('Error in clearSession:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
