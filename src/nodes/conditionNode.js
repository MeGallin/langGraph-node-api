const { ChatPromptTemplate } = require('@langchain/core/prompts');

/**
 * Create a condition node that determines which agent should handle a request
 * Uses a simple keyword-based routing mechanism with improved routing logic
 * @returns {Function} - The condition node function
 */
const createConditionNode = () => {
  const conditionNode = async (state) => {
    const userMessage = (state.latestUserMessage || '').toLowerCase();

    // Always check for keywords first, regardless of ongoing conversations
    // Restaurant-related keywords
    if (
      userMessage.includes('food') ||
      userMessage.includes('table') ||
      userMessage.includes('menu') ||
      userMessage.includes('restaurant') ||
      userMessage.includes('dinner') ||
      userMessage.includes('breakfast') ||
      userMessage.includes('lunch') ||
      userMessage.includes('eat')
    ) {
      console.log(
        `🔄 Routing to Restaurant Agent for message: "${state.latestUserMessage}"`,
      );
      return {
        ...state,
        next: 'restaurant',
        targetAgent: 'restaurant',
      };
    }
    // Maintenance-related keywords
    else if (
      userMessage.includes('broken') ||
      userMessage.includes('repair') ||
      userMessage.includes('maintenance') ||
      userMessage.includes('fix') ||
      userMessage.includes('leak') ||
      userMessage.includes('not working') ||
      userMessage.includes('issue with') ||
      userMessage.includes('problem with') ||
      userMessage.includes("isn't working") ||
      userMessage.includes('cold') ||
      userMessage.includes('hot') ||
      userMessage.includes('heating') ||
      userMessage.includes('ac') ||
      userMessage.includes('toilet') ||
      userMessage.includes('shower') ||
      userMessage.includes('sink')
    ) {
      console.log(
        `🔄 Routing to Maintenance Agent for message: "${state.latestUserMessage}"`,
      );
      return {
        ...state,
        next: 'maintenance',
        targetAgent: 'maintenance',
      };
    }

    // If no specific keywords were found and we're in an ongoing conversation,
    // continue with the current agent
    if (state.targetAgent) {
      console.log(`🔄 Continuing conversation with ${state.targetAgent} Agent`);
      return {
        ...state,
        next: state.targetAgent,
      };
    }

    // Default to reception
    console.log(
      `🔄 Routing to Reception Agent (default) for message: "${state.latestUserMessage}"`,
    );
    return {
      ...state,
      next: 'reception',
      targetAgent: 'reception',
    };
  };

  return conditionNode;
};

/**
 * Simple heuristic to determine if a message indicates a topic change
 * @param {string} message - User message to analyze
 * @returns {boolean} - Whether this is likely a new topic
 */
function isNewTopic(message) {
  const newTopicIndicators = [
    'by the way',
    'also',
    'another thing',
    'different',
    'new',
    'change topic',
    'something else',
    'instead',
    'rather',
  ];

  // Short messages are likely responses to previous context, not new topics
  if (message.split(' ').length <= 3) {
    return false;
  }

  return newTopicIndicators.some((indicator) => message.includes(indicator));
}

module.exports = { createConditionNode };
