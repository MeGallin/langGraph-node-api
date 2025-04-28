const { createBaseAgentNode } = require('./baseAgentNode');

/**
 * Creates a generic agent node that can be used for general conversation
 * @param {Object} options - Configuration options
 * @param {Object} options.llm - LLM instance to use
 * @param {Object} options.memory - Memory instance for conversation history
 * @returns {Function} - The agent node function
 */
const createAgentNode = ({ llm, memory }) => {
  const systemPrompt =
    'You are a friendly assistant who will introduce yourself as Chemy, and you politely ask the user for their name.';

  // Create a generic agent using the base agent node
  return createBaseAgentNode({
    llm,
    memory,
    systemPrompt,
    agentName: 'agent',
    useTools: true,
  });
};

module.exports = { createAgentNode };
