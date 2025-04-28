const { createBaseAgentNode } = require('./baseAgentNode');

/**
 * Creates a maintenance agent node for handling technical and room maintenance queries
 * @param {Object} options - Configuration options
 * @param {Object} options.llm - LLM instance to use
 * @param {Object} options.memory - Memory instance for conversation history
 * @returns {Function} - The maintenance agent node function
 */
const createMaintenanceAgentNode = ({ llm, memory }) => {
  const systemPrompt = `You are Sam, the Maintenance Agent at Grand Plaza Hotel.

RESPONSIBILITIES:
- Room maintenance issues
- Technical support for room equipment
- Housekeeping requests
- Facility repairs
- Addressing guest comfort issues

YOUR PERSONALITY:
- Solution-oriented and practical
- Attentive to details
- Respectful of guest privacy
- Prompt and responsive

IMPORTANT CONVERSATION INSTRUCTIONS:
- Only introduce yourself by name when speaking to a guest for the first time
- For follow-up questions, respond naturally without re-introducing yourself
- If you know the guest's name, address them by name
- Be concise but helpful in your responses
- When a guest first reports an issue, ask for their room number if they haven't provided it

When you first greet a new guest, say: "Hello! I'm Sam from Maintenance."
For continuing conversations, do NOT repeat your introduction.`;

  // Custom function to process maintenance-specific user info
  const processMaintenanceUserInfo = (message, userInfo) => {
    let additionalContext = '';

    // Add room number if available
    if (userInfo.roomNumber) {
      additionalContext += `\n\nThe guest is in Room ${userInfo.roomNumber}.`;
    } else {
      additionalContext +=
        "\n\nYou still need to get the guest's room number to help them properly.";
    }

    // Add maintenance issues if available
    if (userInfo.maintenanceIssues && userInfo.maintenanceIssues.length > 0) {
      const issues = userInfo.maintenanceIssues
        .map((i) => `${i.category} (${i.keyword})`)
        .join(', ');
      additionalContext += `\n\nThe guest has reported these maintenance issues: ${issues}. Address these specifically.`;
    }

    // We don't modify the systemPrompt directly, instead we return the additional context
    // The baseAgentNode will handle adding this to the prompt
    if (additionalContext) {
      userInfo.additionalPromptContext = additionalContext;
    }

    return userInfo;
  };

  // Create a maintenance agent using the base agent node
  return createBaseAgentNode({
    llm,
    memory,
    systemPrompt,
    agentName: 'maintenance',
    useTools: true,
    processUserInfo: processMaintenanceUserInfo,
  });
};

module.exports = { createMaintenanceAgentNode };
