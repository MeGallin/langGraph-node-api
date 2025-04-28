# 📄 Conditional Agent Brief

## 🏗 Updated Architecture for Multi-Agent System

The new system will include:

| Node              | Responsibility                                    |
|-------------------|---------------------------------------------------|
| Start Node        | Initialize memory, model, and initial state.      |
| Condition Node    | Decide which agent (Reception, Restaurant, Maintenance) to route to. |
| Reception Agent   | Handle hotel reception related queries.           |
| Restaurant Agent  | Handle food, restaurant, booking related queries. |
| Maintenance Agent | Handle technical and room maintenance queries.    |
| End Node          | Finalize and close the conversation.              |

---

## 📂 Folder Structure

```
langGraph-node/
├── api/
│   ├── src/
│   │   ├── app.js
│   │   ├── routes/
│   │   │   └── agentRoutes.js
│   │   ├── controllers/
│   │   │   └── agentController.js
│   │   ├── services/
│   │   │   └── agentService.js
│   │   ├── config/
│   │   │   └── llmConfig.js
│   │   └── langgraph/
│   │       ├── flow.js
│   │       ├── memory/
│   │       │   └── sqliteMemory.js
│   │       └── nodes/
│   │           ├── startNode.js
│   │           ├── conditionNode.js
│   │           ├── receptionAgentNode.js
│   │           ├── restaurantAgentNode.js
│   │           ├── maintenanceAgentNode.js
│   │           └── endNode.js
```

---

## 🧠 Start Node Overview

**File:** `startNode.js`

- Initializes:
  - **ChatOpenAI LLM**
  - **SQLite Memory**
  - **Initial State Object** with:
    - `sessionId`
    - `phase`
    - `lastUserMessage`
    - `messages`
    - `targetAgent`
- This prepares the environment for dynamic multi-agent routing.

### Code Summary:

```javascript
const { ChatOpenAI } = require('@langchain/openai');
const { SqliteMemory } = require('../memory/sqliteMemory');

const createStartNode = () => {
  const llm = new ChatOpenAI({
    modelName: 'gpt-4o-mini',
    temperature: 0.5,
    streaming: true,
  });

  const memory = new SqliteMemory({
    dbPath: './data/agent_memory.db',
  });

  const initialState = {
    sessionId: null,
    phase: 'intro',
    lastUserMessage: null,
    messages: [],
    targetAgent: null
  };

  return { llm, memory, state: initialState };
};

module.exports = { createStartNode };
```

---

## 🛠 Next Step

- Build **Condition Node (`conditionNode.js`)**:  
  - Analyze user input.
  - Decide on routing: Reception, Restaurant, or Maintenance agent.