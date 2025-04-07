const sqlite3 = require('sqlite3').verbose();
const { DB_NAME } = require('../configs/constant');

const db = new sqlite3.Database(`/config/${DB_NAME}`);

function initDb() {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
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

function addFile(filePath, size) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT OR IGNORE INTO files (original_path, original_size, created_at) VALUES (?, ?, ?)`,
      [filePath, size, new Date().toISOString()],
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
      `SELECT id, original_path, original_size FROM files WHERE queue_status = 'pending'`,
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
  getNextQueuedFile,
  updateProcessing,
  updateReplaced,
  updateDiscarded,
  updateFailed
};