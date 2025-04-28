const { createLLM } = require('../config/llmConfig');
const { createSQLiteMemory } = require('../memory/sqliteMemory');

/**
 * Creates and initializes the components needed for the LangGraph
 * @returns {Object} The initialized components
 */
const createStartNode = () => {
  // Initialize the LLM using the factory function
  const llm = createLLM({
    temperature: 0.7,
    modelName: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  });

  // Initialize memory with SQLite
  const memory = createSQLiteMemory({
    tableName: 'agent_conversation',
    sessionIdKey: 'sessionId',
    memoryKey: 'messages',
  });

  // Initial state
  const state = {
    messages: [],
    userInfo: {},
  };

  return { llm, memory, state };
};

module.exports = { createStartNode };
