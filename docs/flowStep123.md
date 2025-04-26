# 📄 FlowStep123.md — LangGraph Node Definitions

## 🧠 Step 1 — Start Node (Initialization)

The Start Node initializes the conversation by setting up:

- **ChatOpenAI** model instance (gpt-4o-mini).
- **SQLite memory** for persistent storage.
- **Initial state** object.

### Code Example: `startNode.js`

```javascript
const { ChatOpenAI } = require('@langchain/openai');
const { SqliteMemory } = require('../memory/sqliteMemory'); // Custom memory module

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
    messages: [],
    userInfo: null,
    sessionId: null,
  };

  return { llm, memory, state: initialState };
};

module.exports = { createStartNode };
```

---

## 🧠 Step 2 — Agent Node (Sequential Agent)

The Agent Node processes user input by:

- Loading previous conversation memory.
- Injecting a **system prompt**.
- Using **ChatOpenAI** to generate a response.
- Saving both user and AI messages.

### Code Example: `agentNode.js`

```javascript
const { HumanMessage, SystemMessage } = require('@langchain/core/messages');

const createAgentNode = ({ llm, memory }) => {
  const systemPrompt = "You are a friendly assistant who will introduce yourself at Chemy, and you politely ask the user for their name.";

  const agentNode = async (state) => {
    const sessionId = state.sessionId;
    const previousMessages = await memory.loadMemory(sessionId) || [];

    const messages = [
      new SystemMessage(systemPrompt),
      ...previousMessages,
      new HumanMessage(state.latestUserMessage)
    ];

    const response = await llm.invoke(messages);

    await memory.saveMemory(sessionId, [...previousMessages, new HumanMessage(state.latestUserMessage), response]);

    const updatedState = {
      ...state,
      messages: [...state.messages, { from: "user", content: state.latestUserMessage }, { from: "agent", content: response.content }],
      lastAgentResponse: response.content
    };

    return updatedState;
  };

  return agentNode;
};

module.exports = { createAgentNode };
```

---

## 🧠 Step 3 — End Node (Flow Completion)

The End Node finalizes the conversation:

- Optionally logs or processes final session data.
- Returns the final state unchanged.

### Code Example: `endNode.js`

```javascript
const createEndNode = () => {
  const endNode = async (state) => {
    console.log(`✅ Ending session: ${state.sessionId}`);
    console.log(`Final Messages:`, state.messages);
    return state;
  };

  return endNode;
};

module.exports = { createEndNode };
```

---

# ✅ Summary

- **StartNode:** Setup LLM, memory, and initial state.
- **AgentNode:** Process user message using system prompt + memory.
- **EndNode:** Finalize and return state.

Next step: Assemble into a working LangGraph!