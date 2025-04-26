const createEndNode = () => {
  const endNode = async (state) => {
    console.log(`✅ Ending session: ${state.sessionId}`);
    console.log(`Final Messages:`, state.messages);
    return state;
  };

  return endNode;
};

module.exports = { createEndNode };