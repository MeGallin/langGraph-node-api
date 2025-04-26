const { HumanMessage, SystemMessage } = require('@langchain/core/messages');
const { createAgentTools } = require('../tools/agentTools');

const createAgentNode = ({ llm, memory }) => {
  const systemPrompt =
    'You are a friendly assistant who will introduce yourself as Chemy, and you politely ask the user for their name.';

  // Get tools from the centralized tools module
  const tools = createAgentTools();

  const agentNode = async (state) => {
    const sessionId = state.sessionId;
    const previousMessages = (await memory.loadMemory(sessionId)) || [];

    const messages = [
      new SystemMessage(systemPrompt),
      ...previousMessages,
      new HumanMessage(state.latestUserMessage),
    ];

    // Prepare LLM with tools if needed
    let response;
    if (state.enableTools === true) {
      // If we implement function-calling in the future
      response = await llm.invoke(messages);
    } else {
      response = await llm.invoke(messages);
    }

    // Save conversation to memory
    await memory.saveMemory(sessionId, [
      ...previousMessages,
      new HumanMessage(state.latestUserMessage),
      response,
    ]);

    // Extract user name from response or message if available
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
        ...state.messages,
        { from: 'user', content: state.latestUserMessage },
        { from: 'agent', content: response.content },
      ],
      lastAgentResponse: response.content,
      userInfo: userInfo,
    };

    return updatedState;
  };

  return agentNode;
};

module.exports = { createAgentNode };
