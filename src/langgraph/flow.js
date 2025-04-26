/**
 * Simple implementation of a graph executor for LangChain nodes
 * This replaces the need for an external langgraph package
 */

const { createStartNode } = require('../nodes/startNode');
const { createAgentNode } = require('../nodes/agentNode');
const { createEndNode } = require('../nodes/endNode');

/**
 * Build and return the components needed for our conversation flow
 */
async function buildLangGraph() {
  // Initialize components from start node
  const { llm, memory, state: initialState } = createStartNode();

  // Create agent and end nodes
  const agentNode = createAgentNode({ llm, memory });
  const endNode = createEndNode();

  // Create a simple graph executor function that runs the nodes in sequence
  const executeGraph = async (state) => {
    console.log('🔄 Starting graph execution with state:', state);
    
    // Sequential execution: start -> agent -> end
    // Note: We don't need a separate start node function since it just returns the state
    const agentState = await agentNode(state);
    const finalState = await endNode(agentState);

    return finalState;
  };

  return { executeGraph, initialState };
}

module.exports = { buildLangGraph };