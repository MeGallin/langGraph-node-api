const { createLLM } = require('../config/llmConfig');
const { SqliteMemory } = require('../memory/sqliteMemory');

const createStartNode = () => {
  // Use the centralized LLM configuration
  const llm = createLLM({
    modelName: 'gpt-4o-mini',
    temperature: 0.5,
    streaming: true,
  });

  const memory = new SqliteMemory({
    dbPath: './data/agent_memory.db',
  });

  const initialState = {
    messages: [],
    userInfo: null,
    sessionId: null,
  };

  return { llm, memory, state: initialState };
};

module.exports = { createStartNode };