const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');

router.post('/run', agentController.runAgent);

module.exports = router;