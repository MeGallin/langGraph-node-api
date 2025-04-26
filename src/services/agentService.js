exports.processMessage = async (sessionId, message) => {
  // 🧠 LangChain / LangGraph multi-agent logic will go here
  return `You said: ${message}. (Session: ${sessionId})`;
};