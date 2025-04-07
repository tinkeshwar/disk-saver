const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { DB_NAME, NODE_ENV } = require('../configs/constant');

const dbPath = NODE_ENV === 'development' ? path.resolve(__dirname, `../../${DB_NAME}`) : `/config/${DB_NAME}`;
const db = new sqlite3.Database(dbPath);

function initDb() {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT,
        original_path TEXT UNIQUE,
        original_size REAL,
        new_path TEXT,
        new_size REAL,
        created_at TEXT,
        processed_at TEXT,
        user_action TEXT,
        queue_status TEXT DEFAULT 'pending'
      )
    `, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function addFile(filePath, name, size) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT OR IGNORE INTO files (filename, original_path, original_size, created_at) VALUES (?, ?, ?, ?)`,
      [name, filePath, size, new Date().toISOString()],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

function getPendingFiles() {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT id, filename, original_path, original_size, created_at FROM files WHERE queue_status = 'pending'`,
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
}

function queueFiles(fileIds) {
  return new Promise((resolve, reject) => {
    const placeholders = fileIds.map(() => '(?)').join(',');
    db.run(
      `UPDATE files SET queue_status = 'confirmed' WHERE id IN (${placeholders})`,
      fileIds,
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

function getQueuedFiles() {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT id, filename, original_path, original_size, created_at FROM files WHERE queue_status = 'confirmed'`,
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
}


function getNextQueuedFile() {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT id, original_path FROM files WHERE queue_status = 'confirmed' LIMIT 1`,
      (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      }
    );
  });
}

function updateProcessing(fileId, newPath, newSize) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE files SET new_path = ?, new_size = ?, processed_at = ?, queue_status = 'processed' WHERE id = ?`,
      [newPath, newSize, new Date().toISOString(), fileId],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

function getProcessingFiles() {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT id, filename, original_path, original_size, new_size, created_at, processed_at FROM files WHERE queue_status = 'processed'`,
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
}

function updateReplaced(fileId, newPath, newSize) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE files SET original_path = ?, original_size = ?, new_path = NULL, new_size = NULL, user_action = 'replaced', queue_status = 'completed' WHERE id = ?`,
      [newPath, newSize, fileId],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

function updateDiscarded(fileId) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE files SET user_action = 'discarded', queue_status = 'completed' WHERE id = ?`,
      [fileId],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

function updateFailed(fileId) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE files SET queue_status = 'failed' WHERE id = ?`,
      [fileId],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

module.exports = {
  initDb,
  addFile,
  getPendingFiles,
  queueFiles,
  getQueuedFiles,
  getNextQueuedFile,
  updateProcessing,
  getProcessingFiles,
  updateReplaced,
  updateDiscarded,
  updateFailed
};