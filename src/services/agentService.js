const { buildLangGraph } = require('../langgraph/flow');

// Store active sessions with their state and graph references
const activeSessions = new Map();

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
    });
  }

  return activeSessions.get(sessionId);
};

// Process a message in an existing session
exports.processMessage = async (sessionId, message) => {
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
  });

  return {
    sessionId: currentSessionId,
    response: finalState.lastAgentResponse,
    userInfo: finalState.userInfo,
  };
};

// Get conversation history for a session
exports.getSessionHistory = (sessionId) => {
  const session = activeSessions.get(sessionId);
  return session ? session.state.messages : [];
};
