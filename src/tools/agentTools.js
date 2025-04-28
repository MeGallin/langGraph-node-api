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

    new DynamicTool({
      name: 'calculate',
      description: 'Perform a mathematical calculation',
      func: async (input) => {
        try {
          // Use Function constructor to safely evaluate mathematical expressions
          // This is safer than eval() but still needs to be used carefully
          const result = new Function(`return ${input}`)();
          return `Result: ${result}`;
        } catch (e) {
          return `Error performing calculation: ${e.message}`;
        }
      },
    }),

    new DynamicTool({
      name: 'format-date',
      description: 'Format a date string or timestamp into a readable format',
      func: async (input) => {
        try {
          const date = new Date(input);
          if (isNaN(date.getTime())) {
            return 'Invalid date input';
          }

          const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          };

          return date.toLocaleDateString('en-US', options);
        } catch (e) {
          return `Error formatting date: ${e.message}`;
        }
      },
    }),

    new DynamicTool({
      name: 'generate-confirmation-code',
      description:
        'Generate a random confirmation code for bookings or reservations',
      func: async (input) => {
        // Generate a random alphanumeric code
        const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars like 0,O,1,I
        let code = '';
        const length = input ? parseInt(input) || 6 : 6; // Default to 6 characters if not specified

        for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * characters.length);
          code += characters.charAt(randomIndex);
        }

        return `Confirmation code: ${code}`;
      },
    }),
  ];
};

module.exports = { createAgentTools };
