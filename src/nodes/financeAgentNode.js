/**
 * Finance Agent Node
 * Handles all finance-related queries in the hotel system including
 * billing inquiries, payments, refunds, and other financial matters.
 */
const { createBaseAgentNode } = require('./baseAgentNode');
const { financeSystemPrompt } = require('../prompts/financePrompt');

/**
 * Creates a finance agent node for the LangGraph
 * @param {Object} options Configuration options
 * @param {Object} options.llm LLM instance to use
 * @param {Object} options.memory Memory instance for storing conversation history
 * @returns {Function} The finance agent node function
 */
const createFinanceAgentNode = ({ llm, memory }) => {
  console.log('🏦 Creating Finance Agent Node');

  // Create a finance agent using the base agent node
  return createBaseAgentNode({
    llm,
    memory,
    systemPrompt: financeSystemPrompt,
    agentName: 'finance',
    useTools: true,
  });
};

module.exports = {
  createFinanceAgentNode,
};
