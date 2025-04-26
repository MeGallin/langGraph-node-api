const agentService = require('../services/agentService');

exports.runAgent = async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    const response = await agentService.processMessage(sessionId, message);
    res.json({ success: true, response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};