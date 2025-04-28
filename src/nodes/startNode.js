const { ChatOpenAI } = require('@langchain/openai');
const { createSQLiteMemory } = require('../memory/sqliteMemory');

/**
 * Creates and initializes the components needed for the LangGraph
 * @returns {Object} The initialized components
 */
const createStartNode = () => {
  // Initialize the LLM
  const llm = new ChatOpenAI({
    temperature: 0.7,
    modelName: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
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
