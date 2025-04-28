const { HumanMessage, SystemMessage } = require('@langchain/core/messages');

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

  const restaurantAgentNode = async (state) => {
    const sessionId = state.sessionId;

    // Check if there are previous interactions with this agent
    const previousMessages = (await memory.loadMemory(sessionId)) || [];
    const hasSpokenBefore =
      previousMessages.length > 0 &&
      state.messages?.some((msg) => msg.from === 'restaurant');

    let updatedSystemPrompt = systemPrompt;
    if (hasSpokenBefore) {
      // Modify prompt for continuing conversation
      updatedSystemPrompt +=
        "\n\nThis is a continuing conversation with a guest you've already greeted. DO NOT introduce yourself again.";
    }

    // Add user info to prompt if available
    if (state.userInfo?.name) {
      updatedSystemPrompt += `\n\nThe guest's name is ${state.userInfo.name}. Address them by name in your response.`;
    }

    // Add dietary preferences to prompt if available
    if (
      state.userInfo?.dietaryPreferences &&
      state.userInfo.dietaryPreferences.length > 0
    ) {
      updatedSystemPrompt += `\n\nThe guest has the following dietary preferences/restrictions: ${state.userInfo.dietaryPreferences.join(
        ', ',
      )}. Keep these in mind when making recommendations.`;
    }

    const messages = [
      new SystemMessage(updatedSystemPrompt),
      ...previousMessages,
      new HumanMessage(state.latestUserMessage),
    ];

    // Get response from LLM
    const response = await llm.invoke(messages);

    // Save conversation to memory
    await memory.saveMemory(sessionId, [
      ...previousMessages,
      new HumanMessage(state.latestUserMessage),
      response,
    ]);

    // Extract user info if available
    let userInfo = state.userInfo || {};
    if (
      state.latestUserMessage.toLowerCase().includes('my name is') ||
      state.latestUserMessage.toLowerCase().includes("i'm") ||
      state.latestUserMessage.toLowerCase().includes('i am')
    ) {
      // Basic name extraction logic
      const namePrefixes = ['my name is ', "i'm ", 'i am '];
      let extractedName = null;

      for (const prefix of namePrefixes) {
        if (state.latestUserMessage.toLowerCase().includes(prefix)) {
          const startIndex =
            state.latestUserMessage.toLowerCase().indexOf(prefix) +
            prefix.length;
          extractedName = state.latestUserMessage
            .slice(startIndex)
            .split('.')[0]
            .split(',')[0]
            .trim();
          break;
        }
      }

      if (extractedName) {
        userInfo.name = extractedName;
      }
    }

    // Track dietary preferences if mentioned
    const dietaryKeywords = {
      vegetarian: true,
      vegan: true,
      'gluten-free': true,
      'nut allergy': true,
      'dairy-free': true,
      'lactose intolerant': true,
      'shellfish allergy': true,
    };

    const messageLower = state.latestUserMessage.toLowerCase();
    for (const [diet, _] of Object.entries(dietaryKeywords)) {
      if (messageLower.includes(diet)) {
        if (!userInfo.dietaryPreferences) {
          userInfo.dietaryPreferences = [];
        }
        if (!userInfo.dietaryPreferences.includes(diet)) {
          userInfo.dietaryPreferences.push(diet);
        }
      }
    }

    const updatedState = {
      ...state,
      messages: [
        ...(state.messages || []),
        { from: 'user', content: state.latestUserMessage },
        { from: 'restaurant', content: response.content },
      ],
      lastAgentResponse: response.content,
      userInfo: userInfo,
    };

    return updatedState;
  };

  return restaurantAgentNode;
};

module.exports = { createRestaurantAgentNode };
