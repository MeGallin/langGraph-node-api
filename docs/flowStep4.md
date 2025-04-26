# 📄 FlowStep4.md — LangGraph Assembly and Execution

## 🧠 Step 4 — Assemble LangGraph (start ➔ agent ➔ end)

In LangGraph, we:
- Define the **nodes** (startNode, agentNode, endNode)
- Define the **edges** (the flow between nodes)
- Create a **GraphExecutor** to run it

---

## 📄 LangGraph Flow Setup: `flow.js`

```javascript
// api/src/langgraph/flow.js

const { Graph } = require('langgraph'); // LangGraphJS
const { createStartNode } = require('./nodes/startNode');
const { createAgentNode } = require('./nodes/agentNode');
const { createEndNode } = require('./nodes/endNode');

async function buildLangGraph() {
  const { llm, memory, state: initialState } = createStartNode();

  const agentNode = createAgentNode({ llm, memory });
  const endNode = createEndNode();

  const graph = new Graph()
    .addNode('start', async (state) => {
      return state;
    })
    .addNode('agent', agentNode)
    .addNode('end', endNode);

  graph.addEdge('start', 'agent');
  graph.addEdge('agent', 'end');

  return { graph, initialState };
}

module.exports = { buildLangGraph };
```

---

## 📬 Hook Into Express API: `agentService.js`

```javascript
// api/src/services/agentService.js

const { buildLangGraph } = require('../langgraph/flow');

exports.processMessage = async (sessionId, message) => {
  const { graph, initialState } = await buildLangGraph();

  initialState.sessionId = sessionId;
  initialState.latestUserMessage = message;

  const finalState = await graph.invoke(initialState, { startAt: 'start' });

  return finalState.lastAgentResponse;
};
```

---

## 🗺 Architecture Diagram (Current Simple Flow)

```mermaid
flowchart TD
  A[Express /api/agent/run] --> B[LangGraph StartNode]
  B --> C[AgentNode (LLM Response)]
  C --> D[EndNode (Log + Return Final State)]
  D --> E[API Sends Final Agent Response]
```

---

# ✅ Summary

- **StartNode**: Initializes conversation memory, model, and state.
- **AgentNode**: Processes user message with system prompt.
- **EndNode**: Finalizes session and logs final state.
- **Graph**: Orchestrates the nodes sequentially.

---

# 📋 Next Step

- Implement `sqliteMemory.js` to handle real persistent memory.
- Prepare a simple SQLite database file.