const { HumanMessage, SystemMessage } = require('@langchain/core/messages');

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

  const maintenanceAgentNode = async (state) => {
    const sessionId = state.sessionId;

    // Check if there are previous interactions with this agent
    const previousMessages = (await memory.loadMemory(sessionId)) || [];
    const hasSpokenBefore =
      previousMessages.length > 0 &&
      state.messages?.some((msg) => msg.from === 'maintenance');

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

    // Add room number if available
    if (state.userInfo?.roomNumber) {
      updatedSystemPrompt += `\n\nThe guest is in Room ${state.userInfo.roomNumber}.`;
    } else if (hasSpokenBefore) {
      updatedSystemPrompt +=
        "\n\nYou still need to get the guest's room number to help them properly.";
    }

    // Add maintenance issues if available
    if (
      state.userInfo?.maintenanceIssues &&
      state.userInfo.maintenanceIssues.length > 0
    ) {
      const issues = state.userInfo.maintenanceIssues
        .map((i) => `${i.category} (${i.keyword})`)
        .join(', ');
      updatedSystemPrompt += `\n\nThe guest has reported these maintenance issues: ${issues}. Address these specifically.`;
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

    // Track room number if mentioned
    const roomRegex = /room\s*(\d+)/i;
    const roomMatch = state.latestUserMessage.match(roomRegex);
    if (roomMatch && roomMatch[1]) {
      userInfo.roomNumber = roomMatch[1];
    } else if (/^(\d{1,4})$/.test(state.latestUserMessage.trim())) {
      // If the message is just a number, it's likely a room number
      userInfo.roomNumber = state.latestUserMessage.trim();
    }

    // Track maintenance issues
    const maintenanceIssues = {
      'air conditioning': 'HVAC',
      ac: 'HVAC',
      heating: 'HVAC',
      'hot water': 'Plumbing',
      water: 'Plumbing',
      toilet: 'Plumbing',
      sink: 'Plumbing',
      shower: 'Plumbing',
      leak: 'Plumbing',
      tv: 'Electronics',
      television: 'Electronics',
      remote: 'Electronics',
      wifi: 'Internet',
      internet: 'Internet',
      light: 'Electrical',
      power: 'Electrical',
      outlet: 'Electrical',
      cleaning: 'Housekeeping',
      towel: 'Housekeeping',
      bed: 'Housekeeping',
      sheet: 'Housekeeping',
      noise: 'Noise Complaint',
      door: 'Door/Lock',
      handle: 'Door/Lock',
      lock: 'Door/Lock',
      key: 'Door/Lock',
    };

    const messageLower = state.latestUserMessage.toLowerCase();
    for (const [keyword, category] of Object.entries(maintenanceIssues)) {
      if (messageLower.includes(keyword)) {
        if (!userInfo.maintenanceIssues) {
          userInfo.maintenanceIssues = [];
        }

        // Add maintenance issue if it's not already tracked
        const issue = { category, keyword, reported: new Date().toISOString() };
        const alreadyTracked = userInfo.maintenanceIssues.some(
          (existingIssue) =>
            existingIssue.category === category &&
            existingIssue.keyword === keyword,
        );

        if (!alreadyTracked) {
          userInfo.maintenanceIssues.push(issue);
        }
      }
    }

    const updatedState = {
      ...state,
      messages: [
        ...(state.messages || []),
        { from: 'user', content: state.latestUserMessage },
        { from: 'maintenance', content: response.content },
      ],
      lastAgentResponse: response.content,
      userInfo: userInfo,
    };

    return updatedState;
  };

  return maintenanceAgentNode;
};

module.exports = { createMaintenanceAgentNode };
