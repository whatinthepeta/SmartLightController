const Database = require('better-sqlite3');
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

module.exports = db;
