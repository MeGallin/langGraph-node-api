/**
 * Creates an end node that finalizes the session
 * @returns {Function} - The end node function
 */
const createEndNode = () => {
  const endNode = async (state) => {
    try {
      // Log session completion
      console.log(
        `✅ Session ${state.sessionId || 'unknown'} interaction completed.`,
      );

      // Log the agent that handled the request
      const agent = state.targetAgent || 'unknown';
      console.log(`👤 Request handled by: ${agent} agent`);

      // Log user info if available
      if (state.userInfo && Object.keys(state.userInfo).length > 0) {
        console.log(`📝 User info: ${JSON.stringify(state.userInfo, null, 2)}`);
      }

      // Log the conversation history (last 3 messages for brevity)
      if (state.messages && state.messages.length > 0) {
        console.log(`💬 Recent conversation:`);
        const recentMessages = state.messages.slice(-3); // Get last 3 messages
        recentMessages.forEach((msg, index) => {
          console.log(
            `   ${index + 1}. [${msg.from}] ${msg.content.substring(0, 100)}${
              msg.content.length > 100 ? '...' : ''
            }`,
          );
        });
      }

      // Return the final state
      return state;
    } catch (error) {
      console.error(`❌ Error in end node: ${error.message}`);
      // Still return the state even if there was an error in logging
      return state;
    }
  };

  return endNode;
};

module.exports = { createEndNode };
