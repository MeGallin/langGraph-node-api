# 📄 FlowStep5.md — SQLite Memory Implementation

## 🧠 Memory Purpose

The `sqliteMemory.js` module provides:

- Persistent storage of user and agent conversation messages.
- Session-based memory handling across multiple users.
- Reliable load and save operations using SQLite.

---

## 📄 SQLite Memory Class: `sqliteMemory.js`

```javascript
// api/src/langgraph/memory/sqliteMemory.js

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

class SqliteMemory {
  constructor({ dbPath = './data/agent_memory.db' }) {
    this.dbPath = dbPath;
    this.initDatabase();
  }

  initDatabase() {
    if (!fs.existsSync(path.dirname(this.dbPath))) {
      fs.mkdirSync(path.dirname(this.dbPath), { recursive: true });
    }

    this.db = new sqlite3.Database(this.dbPath, (err) => {
      if (err) {
        console.error('Failed to open SQLite database:', err);
      } else {
        console.log('✅ SQLite Memory Database connected.');
        this.db.run(`
          CREATE TABLE IF NOT EXISTS conversations (
            sessionId TEXT,
            role TEXT,
            content TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
      }
    });
  }

  async saveMemory(sessionId, messages) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        const stmt = this.db.prepare(`INSERT INTO conversations (sessionId, role, content) VALUES (?, ?, ?)`);

        for (const message of messages) {
          stmt.run(sessionId, message.from || message._getType(), message.content);
        }

        stmt.finalize((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  }

  async loadMemory(sessionId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT role, content FROM conversations WHERE sessionId = ? ORDER BY timestamp ASC`,
        [sessionId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            const formatted = rows.map(row => {
              if (row.role === 'user') {
                return { from: 'user', content: row.content };
              } else {
                return { from: 'agent', content: row.content };
              }
            });
            resolve(formatted);
          }
        }
      );
    });
  }
}

module.exports = { SqliteMemory };
```

---

## 🛠 Key Functions

- **`saveMemory(sessionId, messages[])`**
  - Saves each message (user or agent) linked to a session ID.
  - Messages are timestamped automatically.

- **`loadMemory(sessionId)`**
  - Loads all conversation history for a session.
  - Returns them in chronological order as an array.

---

## ✅ Benefits

- **Persistence:** Conversations are not lost if the server restarts.
- **Session Isolation:** Each session has independent memory.
- **Simple Database:** Lightweight and local via SQLite, production adaptable.

---

## 📋 Next Step

- Final full-system test: Start ➔ Agent ➔ End with real SQLite memory.
- Review and package for production readiness.