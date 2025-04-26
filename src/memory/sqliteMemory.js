const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const { HumanMessage, AIMessage } = require('@langchain/core/messages');

class SqliteMemory {
  constructor({ dbPath }) {
    this.dbPath = dbPath;
    this.initialize();
  }

  initialize() {
    // Ensure the directory exists
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Create database and table if they don't exist
    this.db = new sqlite3.Database(this.dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log(`Connected to SQLite database at ${this.dbPath}`);
        this.db.run(`
          CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
      }
    });
  }

  async saveMemory(sessionId, messages) {
    if (!sessionId) {
      console.error('Error: sessionId is required');
      return;
    }

    const promises = messages.map((message) => {
      return new Promise((resolve, reject) => {
        // Skip if not a HumanMessage or AIMessage
        if (!(message instanceof HumanMessage || message instanceof AIMessage)) {
          resolve();
          return;
        }

        const role = message instanceof HumanMessage ? 'human' : 'ai';
        const content = typeof message.content === 'string' 
          ? message.content 
          : JSON.stringify(message.content);

        this.db.run(
          `INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)`,
          [sessionId, role, content],
          function (err) {
            if (err) {
              console.error('Error saving message to SQLite:', err.message);
              reject(err);
            } else {
              resolve(this.lastID);
            }
          }
        );
      });
    });

    return Promise.all(promises);
  }

  async loadMemory(sessionId) {
    if (!sessionId) {
      console.error('Error: sessionId is required');
      return [];
    }

    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT role, content FROM messages WHERE session_id = ? ORDER BY timestamp ASC`,
        [sessionId],
        (err, rows) => {
          if (err) {
            console.error('Error loading messages from SQLite:', err.message);
            reject(err);
            return;
          }

          const messages = rows.map((row) => {
            if (row.role === 'human') {
              return new HumanMessage(row.content);
            } else {
              return new AIMessage(row.content);
            }
          });

          resolve(messages);
        }
      );
    });
  }

  async clearMemory(sessionId) {
    if (!sessionId) {
      console.error('Error: sessionId is required');
      return;
    }

    return new Promise((resolve, reject) => {
      this.db.run(
        `DELETE FROM messages WHERE session_id = ?`,
        [sessionId],
        function (err) {
          if (err) {
            console.error('Error clearing memory from SQLite:', err.message);
            reject(err);
          } else {
            resolve({ deleted: this.changes });
          }
        }
      );
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing SQLite database:', err.message);
          reject(err);
        } else {
          console.log('SQLite database connection closed');
          resolve();
        }
      });
    });
  }
}

module.exports = { SqliteMemory };