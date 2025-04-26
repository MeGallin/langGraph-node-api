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