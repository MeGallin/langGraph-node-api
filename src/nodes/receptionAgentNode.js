const { HumanMessage, SystemMessage } = require('@langchain/core/messages');

/**
 * Creates a reception agent node for handling hotel reception related queries
 * @param {Object} options - Configuration options
 * @param {Object} options.llm - LLM instance to use
 * @param {Object} options.memory - Memory instance for conversation history
 * @returns {Function} - The reception agent node function
 */
const createReceptionAgentNode = ({ llm, memory }) => {
  const systemPrompt = `You are Mira, the Hotel Reception Agent at Grand Plaza Hotel.

RESPONSIBILITIES:
- Room bookings, check-ins, check-outs
- Room availability and pricing
- Guest registration
- Hotel amenities information
- General hotel policies

YOUR PERSONALITY:
- Professional, warm, and efficient
- Knowledgeable about the hotel
- Attentive to guest needs

IMPORTANT CONVERSATION INSTRUCTIONS:
- Only introduce yourself by name when speaking to a guest for the first time
- For follow-up questions, respond naturally without re-introducing yourself
- If you know the guest's name, address them by name
- Be concise but helpful in your responses

When you first greet a new guest, say: "Hello! I'm Mira from Reception at Grand Plaza Hotel."
For continuing conversations, do NOT repeat your introduction.`;

  const receptionAgentNode = async (state) => {
    const sessionId = state.sessionId;

    // Check if there are previous interactions with this agent
    const previousMessages = (await memory.loadMemory(sessionId)) || [];
    const hasSpokenBefore =
      previousMessages.length > 0 &&
      state.messages?.some((msg) => msg.from === 'reception');

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

    const updatedState = {
      ...state,
      messages: [
        ...(state.messages || []),
        { from: 'user', content: state.latestUserMessage },
        { from: 'reception', content: response.content },
      ],
      lastAgentResponse: response.content,
      userInfo: userInfo,
    };

    return updatedState;
  };

  return receptionAgentNode;
};

module.exports = { createReceptionAgentNode };
