# 📄 PRCv1: LangGraph-Node Multi-Agent Server - Initial Setup

## 🏗 Folder Structure

```
langGraph-node/
├── api/
│   ├── src/
│   │   ├── app.js           # Express app configuration
│   │   ├── routes/
│   │   │   └── agentRoutes.js   # API routes
│   │   ├── controllers/
│   │   │   └── agentController.js # Route logic
│   │   ├── services/
│   │   │   └── agentService.js    # LangChain/LangGraph logic
│   │   └── config/
│   │       └── llmConfig.js       # LLM configuration (OpenAI, etc.)
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── README.md
└── server.js
```

---

## 🚀 Server Entry Point

### `server.js`

```javascript
require('dotenv').config();
const app = require('./api/src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

---

## 🧩 Express App Setup

### `api/src/app.js`

```javascript
const express = require('express');
const cors = require('cors');
const agentRoutes = require('./routes/agentRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Healthcheck route
app.get('/', (req, res) => {
  res.send('✅ Multi-Agent Server is up and running!');
});

// API Routes
app.use('/api/agent', agentRoutes);

module.exports = app;
```

---

## 📬 API Routing

### `api/src/routes/agentRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');

router.post('/run', agentController.runAgent);

module.exports = router;
```

---

## 🧠 Controller Logic

### `api/src/controllers/agentController.js`

```javascript
const agentService = require('../services/agentService');

exports.runAgent = async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    const response = await agentService.processMessage(sessionId, message);
    res.json({ success: true, response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};
```

---

## 🛠 LangChain / LangGraph Logic Placeholder

### `api/src/services/agentService.js`

```javascript
exports.processMessage = async (sessionId, message) => {
  // 🧠 LangChain / LangGraph multi-agent logic will go here
  return `You said: ${message}. (Session: ${sessionId})`;
};
```

---

## ⚙️ LLM Configuration Placeholder

### `api/src/config/llmConfig.js`

```javascript
// LLM (like OpenAI) model setup will be defined here
```

---

## 📜 .gitignore

```
node_modules/
.env
*.db
logs/
```

---

## 📦 Package.json Example

```json
{
  "name": "langgraph-node-api",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  }
}
```

---

## ✅ Quick Setup Commands

```bash
npm install
npm run dev
```

Server will be available at:

```
http://localhost:8000/
```

POST messages to:

```
http://localhost:8000/api/agent/run
```

---

## 🌟 Notes

- **Modular separation**: Clear layers (routes, controllers, services) make it scalable.
- **LangChain ready**: `services/agentService.js` will integrate LangChain, LangGraph soon.
- **Environment configs**: Sensitive data loaded from `.env`.
- **Ready for containerization and scaling**.
