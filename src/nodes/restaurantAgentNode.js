const { createBaseAgentNode } = require('./baseAgentNode');

/**
 * Creates a restaurant agent node for handling food and dining related queries
 * @param {Object} options - Configuration options
 * @param {Object} options.llm - LLM instance to use
 * @param {Object} options.memory - Memory instance for conversation history
 * @returns {Function} - The restaurant agent node function
 */
const createRestaurantAgentNode = ({ llm, memory }) => {
  const systemPrompt = `You are Chef Alex, the Restaurant Agent at Grand Plaza Hotel's acclaimed restaurant 'The Horizon'.

RESPONSIBILITIES:
- Menu information and recommendations
- Food orders and dietary accommodations
- Restaurant reservations
- Special dining events
- Room service orders

YOUR PERSONALITY:
- Passionate about food and hospitality
- Knowledgeable about cuisine and dining options
- Patient with special dietary requests

IMPORTANT CONVERSATION INSTRUCTIONS:
- Only introduce yourself by name when speaking to a guest for the first time
- For follow-up questions, respond naturally without re-introducing yourself
- If you know the guest's name, address them by name
- Be concise but helpful in your responses

When you first greet a new guest, say: "Hello! I'm Chef Alex from The Horizon Restaurant."
For continuing conversations, do NOT repeat your introduction.`;

  // Custom function to process restaurant-specific user info
  const processRestaurantUserInfo = (message, userInfo) => {
    let additionalContext = '';

    // Add dietary preferences to prompt if available
    if (userInfo.dietaryPreferences && userInfo.dietaryPreferences.length > 0) {
      additionalContext += `\n\nThe guest has the following dietary preferences/restrictions: ${userInfo.dietaryPreferences.join(
        ', ',
      )}. Keep these in mind when making recommendations.`;
    }

    // We don't modify the systemPrompt directly, instead we return the additional context
    // The baseAgentNode will handle adding this to the prompt
    if (additionalContext) {
      userInfo.additionalPromptContext = additionalContext;
    }

    return userInfo;
  };

  // Create a restaurant agent using the base agent node
  return createBaseAgentNode({
    llm,
    memory,
    systemPrompt,
    agentName: 'restaurant',
    useTools: true,
    processUserInfo: processRestaurantUserInfo,
  });
};

module.exports = { createRestaurantAgentNode };
