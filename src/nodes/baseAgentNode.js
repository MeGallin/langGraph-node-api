const { HumanMessage, SystemMessage } = require('@langchain/core/messages');
const { createAgentTools } = require('../tools/agentTools');
const { extractUserInfo } = require('../utils/userInfoExtractor');

/**
 * Creates a base agent node that can be extended by specialized agents
 * @param {Object} options - Configuration options
 * @param {Object} options.llm - LLM instance to use
 * @param {Object} options.memory - Memory instance for conversation history
 * @param {String} options.systemPrompt - System prompt for the agent
 * @param {String} options.agentName - Name of the agent (for message tracking)
 * @param {Boolean} options.useTools - Whether to enable tools for this agent
 * @param {Function} options.processUserInfo - Custom function to process user info
 * @returns {Function} - The agent node function
 */
const createBaseAgentNode = (options) => {
  const {
    llm,
    memory,
    systemPrompt,
    agentName,
    useTools = false,
    processUserInfo = null,
  } = options;

  // Get tools if enabled
  const tools = useTools ? createAgentTools() : [];

  const baseAgentNode = async (state) => {
    const sessionId = state.sessionId;

    // Check if there are previous interactions with this agent
    const previousMessages = (await memory.loadMemory(sessionId)) || [];
    const hasSpokenBefore =
      previousMessages.length > 0 &&
      state.messages?.some((msg) => msg.from === agentName);

    // Build the system prompt with dynamic elements
    let updatedSystemPrompt = systemPrompt;

    // Add continuation context if this is a follow-up conversation
    if (hasSpokenBefore) {
      updatedSystemPrompt +=
        "\n\nThis is a continuing conversation with a guest you've already greeted. DO NOT introduce yourself again.";
    }

    // Add user info to prompt if available
    if (state.userInfo?.name) {
      updatedSystemPrompt += `\n\nThe guest's name is ${state.userInfo.name}. Address them by name in your response.`;
    }

    // Add any additional context from specialized agents
    if (state.userInfo?.additionalPromptContext) {
      updatedSystemPrompt += state.userInfo.additionalPromptContext;
    }

    const messages = [
      new SystemMessage(updatedSystemPrompt),
      ...previousMessages,
      new HumanMessage(state.latestUserMessage),
    ];

    // Get response from LLM
    let response;
    if (useTools && state.enableTools === true) {
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

    // Extract user info from message
    let userInfo = extractUserInfo(
      state.latestUserMessage,
      state.userInfo || {},
    );

    // Apply custom user info processing if provided
    if (processUserInfo) {
      userInfo = processUserInfo(state.latestUserMessage, userInfo);
    }

    const updatedState = {
      ...state,
      messages: [
        ...(state.messages || []),
        { from: 'user', content: state.latestUserMessage },
        { from: agentName, content: response.content },
      ],
      lastAgentResponse: response.content,
      userInfo: userInfo,
    };

    return updatedState;
  };

  return baseAgentNode;
};

module.exports = { createBaseAgentNode };
