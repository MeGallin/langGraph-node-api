/**
 * Creates an end node that finalizes the session
 * @returns {Function} - The end node function
 */
const createEndNode = () => {
  const endNode = async (state) => {
    console.log(`✅ Session ${state.sessionId} has ended.`);

    // Log the conversation history
    state.messages.forEach((msg, index) => {
      console.log(`${index + 1}. [${msg.from}] ${msg.content}`);
    });

    return state;
  };

  return endNode;
};

module.exports = { createEndNode };
