const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'db.sqlite');
let db;
try {
  db = new Database(DB_PATH);
} catch (err) {
  throw new Error(`Cannot open database at ${DB_PATH}: ${err.message}`);
}

db.pragma('journal_mode = WAL');
db.pragma('busy_timeout = 3000');

db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    email     TEXT UNIQUE NOT NULL,
    password  TEXT NOT NULL,
    role      TEXT NOT NULL DEFAULT 'user',
    api_calls INTEGER NOT NULL DEFAULT 0
  )
`).run();

const count = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (count.count === 0) {
  const userHash  = bcrypt.hashSync('123',  10);
  const adminHash = bcrypt.hashSync('111', 10);
  db.prepare('INSERT INTO users (email, password, role) VALUES (?, ?, ?)').run('john@john.com',  userHash,  'user');
  db.prepare('INSERT INTO users (email, password, role) VALUES (?, ?, ?)').run('admin@admin.com', adminHash, 'admin');
}

module.exports = db;
