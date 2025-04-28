const { buildLangGraph } = require('../langgraph/flow');

// Store active sessions with their state and graph references
const activeSessions = new Map();

// Session configuration
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const SESSION_CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Get or create a session with its graph and state
 * @param {string} sessionId - The session identifier
 * @returns {Object} The session object with graph and state
 */
const getOrCreateSession = async (sessionId) => {
  if (!activeSessions.has(sessionId)) {
    console.log(`Creating new session: ${sessionId}`);
    const { executeGraph, initialState } = await buildLangGraph();

    activeSessions.set(sessionId, {
      executeGraph,
      state: {
        ...initialState,
        sessionId,
        messages: [],
        userInfo: {},
      },
      lastAccessed: Date.now(),
    });
  } else {
    // Update last accessed time
    const session = activeSessions.get(sessionId);
    session.lastAccessed = Date.now();
    activeSessions.set(sessionId, session);
  }

  return activeSessions.get(sessionId);
};

/**
 * Clean up expired sessions
 */
const cleanupExpiredSessions = () => {
  const now = Date.now();
  let expiredCount = 0;

  for (const [sessionId, session] of activeSessions.entries()) {
    if (now - session.lastAccessed > SESSION_TIMEOUT) {
      console.log(`Cleaning up expired session: ${sessionId}`);
      activeSessions.delete(sessionId);
      expiredCount++;
    }
  }

  if (expiredCount > 0) {
    console.log(
      `Cleaned up ${expiredCount} expired sessions. Active sessions: ${activeSessions.size}`,
    );
  }
};

// Start the cleanup interval
setInterval(cleanupExpiredSessions, SESSION_CLEANUP_INTERVAL);

/**
 * Process a message in an existing session
 * @param {string} sessionId - The session identifier
 * @param {string} message - The user message to process
 * @returns {Object} The response object
 */
exports.processMessage = async (sessionId, message) => {
  try {
    // Generate a random session ID if not provided
    const currentSessionId = sessionId || `session_${Date.now()}`;

    // Get or create session
    const session = await getOrCreateSession(currentSessionId);

    console.log(
      `Processing message for session ${currentSessionId}: "${message}"`,
    );

    // Update state with the latest user message
    const updatedState = {
      ...session.state,
      latestUserMessage: message,
      enableTools: true,
    };

    // Execute the graph with conditional routing
    const finalState = await session.executeGraph(updatedState);

    // Update session state for future interactions
    activeSessions.set(currentSessionId, {
      ...session,
      state: finalState,
      lastAccessed: Date.now(),
    });

    return {
      sessionId: currentSessionId,
      response: finalState.lastAgentResponse,
      userInfo: finalState.userInfo,
      agentType: finalState.targetAgent || 'reception', // Include the agent type in the response
    };
  } catch (error) {
    console.error('Error processing message:', error);
    throw new Error(`Failed to process message: ${error.message}`);
  }
};

/**
 * Get conversation history for a session
 * @param {string} sessionId - The session identifier
 * @returns {Array} The conversation history
 */
exports.getSessionHistory = (sessionId) => {
  const session = activeSessions.get(sessionId);
  return session ? session.state.messages : [];
};

/**
 * Get all active sessions
 * @returns {Array} Array of session IDs and their last accessed time
 */
exports.getActiveSessions = () => {
  return Array.from(activeSessions.entries()).map(([id, session]) => ({
    sessionId: id,
    lastAccessed: new Date(session.lastAccessed).toISOString(),
    agentType: session.state.targetAgent || 'unknown',
  }));
};

/**
 * Clear a specific session
 * @param {string} sessionId - The session identifier
 * @returns {boolean} Whether the session was successfully cleared
 */
exports.clearSession = (sessionId) => {
  if (activeSessions.has(sessionId)) {
    activeSessions.delete(sessionId);
    return true;
  }
  return false;
};
