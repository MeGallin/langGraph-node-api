const { ChatOpenAI } = require('@langchain/openai');

// Initialize the OpenAI model with environment variables and default settings
const createLLM = (options = {}) => {
  return new ChatOpenAI({
    modelName: options.modelName || 'gpt-4o-mini',
    temperature: options.temperature !== undefined ? options.temperature : 0.5,
    streaming: options.streaming !== undefined ? options.streaming : true,
    openAIApiKey: process.env.OPENAI_API_KEY,
    ...options
  });
};

module.exports = {
  createLLM
};