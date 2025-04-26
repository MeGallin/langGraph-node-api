const { DynamicTool } = require('langchain/tools');

/**
 * Creates and returns a collection of tools for the agent to use
 * @returns {Array} Array of LangChain tool objects
 */
const createAgentTools = () => {
  return [
    new DynamicTool({
      name: 'get-current-time',
      description: 'Get the current time and date',
      func: async () => {
        const now = new Date();
        return now.toLocaleString();
      },
    }),
    new DynamicTool({
      name: 'remember-user-info',
      description: 'Store information about the user',
      func: async (input) => {
        try {
          const userInfo = JSON.parse(input);
          return `Successfully stored user information: ${JSON.stringify(
            userInfo,
          )}`;
        } catch (e) {
          return `Failed to parse user information: ${e.message}`;
        }
      },
    }),
  ];
};

module.exports = { createAgentTools };
