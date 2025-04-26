const { createStartNode } = require('../nodes/startNode');
const { createAgentNode } = require('../nodes/agentNode');
const { createEndNode } = require('../nodes/endNode');

// Store active sessions
const sessions = new Map();

// Initialize a new session
const initializeSession = async (sessionId) => {
  // Create the start node and get initial components
  const { llm, memory, state } = createStartNode();
  
  // Create the agent and end node functions
  const agentNode = createAgentNode({ llm, memory });
  const endNode = createEndNode();
  
  // Store session components
  sessions.set(sessionId, {
    llm,
    memory,
    state: {
      ...state,
      sessionId,
      messages: []
    },
    agentNode,
    endNode
  });
  
  return sessions.get(sessionId);
};

// Process a message in an existing or new session
exports.processMessage = async (sessionId, message) => {
  // Generate a random session ID if not provided
  const currentSessionId = sessionId || `session_${Date.now()}`;
  
  // Get or create session
  let session = sessions.get(currentSessionId);
  if (!session) {
    session = await initializeSession(currentSessionId);
  }
  
  // Update state with the latest user message
  const updatedState = {
    ...session.state,
    latestUserMessage: message,
    enableTools: true
  };
  
  // Process through the agent node
  const agentState = await session.agentNode(updatedState);
  
  // Process through the end node
  const finalState = await session.endNode(agentState);
  
  // Update session state
  sessions.set(currentSessionId, {
    ...session,
    state: finalState
  });
  
  return {
    sessionId: currentSessionId,
    response: finalState.lastAgentResponse,
    userInfo: finalState.userInfo
  };
};

// Get conversation history for a session
exports.getSessionHistory = (sessionId) => {
  const session = sessions.get(sessionId);
  return session ? session.state.messages : [];
};