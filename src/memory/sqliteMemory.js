const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const {
  AIMessage,
  HumanMessage,
  SystemMessage,
} = require('@langchain/core/messages');

// Database connection singleton
let db;

// Memory configuration
const MEMORY_RETENTION_DAYS = 7; // Keep memory for 7 days
const MEMORY_CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Get the SQLite database connection
 * @returns {Promise<object>} - The database connection
 */
async function getDB() {
  if (!db) {
    const dbPath = path.join(__dirname, '../../data/agent_memory.db');
    console.log(`Connected to SQLite database at ${dbPath}`);

    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    // Create the conversations table if it doesn't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS agent_conversation (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create an index on session_id for faster lookups
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_session_id ON agent_conversation(session_id)
    `);

    // Create an index on timestamp for faster cleanup
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_timestamp ON agent_conversation(timestamp)
    `);
  }

  return db;
}

/**
 * Clean up old memory entries
 * @returns {Promise<number>} - Number of deleted entries
 */
async function cleanupOldMemory() {
  try {
    const database = await getDB();

    // Calculate the cutoff date (e.g., 7 days ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - MEMORY_RETENTION_DAYS);
    const cutoffTimestamp = cutoffDate.toISOString();

    // Delete old entries
    const result = await database.run(
      `DELETE FROM agent_conversation WHERE timestamp < ?`,
      cutoffTimestamp,
    );

    if (result.changes > 0) {
      console.log(`Cleaned up ${result.changes} old memory entries`);
    }

    return result.changes;
  } catch (error) {
    console.error('Error cleaning up old memory:', error);
    return 0;
  }
}

// Start the cleanup interval
setInterval(cleanupOldMemory, MEMORY_CLEANUP_INTERVAL);

/**
 * Create a SQLite-based memory system for conversation history
 * @param {Object} options - Options for the memory
 * @param {string} options.tableName - Name of the database table
 * @param {string} options.sessionIdKey - Key to use for session ID in state
 * @param {string} options.memoryKey - Key to use for storing memory in state
 * @returns {Object} - The memory interface
 */
function createSQLiteMemory(options = {}) {
  const {
    tableName = 'agent_conversation',
    sessionIdKey = 'sessionId',
    memoryKey = 'messages',
  } = options;

  /**
   * Save messages to SQLite database
   * @param {string} sessionId - The session identifier
   * @param {Array<object>} messages - The messages to save
   */
  const saveMemory = async (sessionId, messages) => {
    try {
      const database = await getDB();

      // We only want to save the most recent messages (typically the last 2)
      // This avoids duplicating the entire history
      const recentMessages = messages.slice(-2);

      // Prepare batch insert of messages
      const stmt = await database.prepare(`
        INSERT INTO ${tableName} (session_id, role, content)
        VALUES (?, ?, ?)
      `);

      for (const message of recentMessages) {
        let role = 'system';
        if (message instanceof HumanMessage) {
          role = 'human';
        } else if (message instanceof AIMessage) {
          role = 'ai';
        }

        await stmt.run(sessionId, role, message.content);
      }

      await stmt.finalize();
    } catch (error) {
      console.error('Error saving to SQLite memory:', error);
    }
  };

  /**
   * Load messages from SQLite database
   * @param {string} sessionId - The session identifier
   * @returns {Promise<Array<object>>} - The loaded messages
   */
  const loadMemory = async (sessionId) => {
    try {
      const database = await getDB();

      // Fetch all messages for this session
      const rows = await database.all(
        `
        SELECT role, content FROM ${tableName}
        WHERE session_id = ?
        ORDER BY timestamp ASC
      `,
        sessionId,
      );

      // Convert to LangChain message objects
      return rows.map((row) => {
        if (row.role === 'human') {
          return new HumanMessage(row.content);
        } else if (row.role === 'ai') {
          return new AIMessage(row.content);
        } else {
          return new SystemMessage(row.content);
        }
      });
    } catch (error) {
      console.error('Error loading from SQLite memory:', error);
      return [];
    }
  };

  /**
   * Delete all messages for a session
   * @param {string} sessionId - The session identifier
   */
  const clearMemory = async (sessionId) => {
    try {
      const database = await getDB();

      await database.run(
        `
        DELETE FROM ${tableName}
        WHERE session_id = ?
      `,
        sessionId,
      );
    } catch (error) {
      console.error('Error clearing SQLite memory:', error);
    }
  };

  return {
    saveMemory,
    loadMemory,
    clearMemory,
  };
}

module.exports = { createSQLiteMemory };
