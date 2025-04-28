/**
 * Implementation of a conditional flow graph executor for LangChain nodes
 * This enables routing user queries to specialized agents with conversation continuity
 */

const { createStartNode } = require('../nodes/startNode');
const { createConditionNode } = require('../nodes/conditionNode');
const { createReceptionAgentNode } = require('../nodes/receptionAgentNode');
const { createRestaurantAgentNode } = require('../nodes/restaurantAgentNode');
const { createMaintenanceAgentNode } = require('../nodes/maintenanceAgentNode');
const { createEndNode } = require('../nodes/endNode');
const { extractUserInfo } = require('../utils/userInfoExtractor');

/**
 * Build and return the components needed for our conditional conversation flow
 */
async function buildLangGraph() {
  // Initialize components from start node
  const { llm, memory, state: initialState } = createStartNode();

  // Create nodes
  const conditionNode = createConditionNode();
  const receptionNode = createReceptionAgentNode({ llm, memory });
  const restaurantNode = createRestaurantAgentNode({ llm, memory });
  const maintenanceNode = createMaintenanceAgentNode({ llm, memory });
  const endNode = createEndNode();

  /**
   * Graph execution flow:
   * 1. Condition Node → Determine which agent to route to (or continue with current agent)
   * 2. Agent Node (Reception/Restaurant/Maintenance) → Process request
   * 3. End Node → Finalize session
   */
  const executeGraph = async (state) => {
    try {
      console.log(`🔄 Processing message: "${state.latestUserMessage}"`);

      // Pre-process the message to extract any user info before routing
      // This ensures that even if we route to a different agent, the info is captured
      const userInfo = extractUserInfo(
        state.latestUserMessage,
        state.userInfo || {},
      );
      const stateWithUserInfo = {
        ...state,
        userInfo,
      };

      // First, run the condition node to decide routing
      let currentState = await conditionNode(stateWithUserInfo);

      // Check if we're switching agents and need to transfer context
      if (state.targetAgent && currentState.targetAgent !== state.targetAgent) {
        console.log(
          `🔀 Switching from ${state.targetAgent} to ${currentState.targetAgent} agent`,
        );

        // Add a note about the agent switch for context
        if (!currentState.agentSwitchContext) {
          currentState.agentSwitchContext = [];
        }

        currentState.agentSwitchContext.push({
          from: state.targetAgent,
          to: currentState.targetAgent,
          timestamp: new Date().toISOString(),
        });
      }

      // Route to the appropriate agent based on the condition node's decision
      switch (currentState.next) {
        case 'restaurant':
          console.log(`👨‍🍳 Routing to Restaurant Agent`);
          currentState = await restaurantNode(currentState);
          break;
        case 'maintenance':
          console.log(`👨‍🔧 Routing to Maintenance Agent`);
          currentState = await maintenanceNode(currentState);
          break;
        default:
          console.log(`👨‍💼 Routing to Reception Agent`);
          currentState = await receptionNode(currentState);
      }

      // Finally, run the end node to finalize the session
      currentState = await endNode(currentState);

      return currentState;
    } catch (error) {
      console.error(`❌ Error in graph execution: ${error.message}`);
      console.error(error.stack);

      // Return the original state with an error flag
      return {
        ...state,
        error: error.message,
        lastAgentResponse:
          "I'm sorry, but I encountered an error processing your request. Please try again.",
      };
    }
  };

  return { executeGraph, initialState };
}

module.exports = { buildLangGraph };
