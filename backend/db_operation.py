from sqlite3 import connect
from datetime import datetime
from contextlib import contextmanager
from config import config

DB_PATH = config.DB_PATH

@contextmanager
def get_db_connection(db_path=DB_PATH):
    """Context manager for database connections"""
    conn = connect(db_path)
    try:
        yield conn
    finally:
        conn.close()

def init_db(db_path=DB_PATH):
    """Initialize the SQLite database and create the files table."""
    with get_db_connection(db_path) as conn:
        c = conn.cursor()
        c.execute('''CREATE TABLE IF NOT EXISTS files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            original_path TEXT UNIQUE,
            original_size REAL,
            new_path TEXT,
            new_size REAL,
            created_at TEXT,
            processed_at TEXT,
            user_action TEXT,
            queue_status TEXT DEFAULT 'pending'
        )''')
        conn.commit()

def add_file(file_path, size, db_path=DB_PATH):
    """Add or update a file in the database."""
    with get_db_connection(db_path) as conn:
        c = conn.cursor()
        c.execute("""
            INSERT OR IGNORE INTO files (original_path, original_size, created_at)
            VALUES (?, ?, ?)
        """, (file_path, size, datetime.now().isoformat()))
        conn.commit()

def get_pending_files(db_path=DB_PATH):
    """Retrieve all pending files from the database."""
    with get_db_connection(db_path) as conn:
        c = conn.cursor()
        c.execute("SELECT id, original_path, original_size FROM files WHERE queue_status = 'pending'")
        return c.fetchall()

def queue_files(file_ids, db_path=DB_PATH):
    """Mark selected files as confirmed for processing."""
    with get_db_connection(db_path) as conn:
        c = conn.cursor()
        c.executemany("UPDATE files SET queue_status = 'confirmed' WHERE id = ?", [(id,) for id in file_ids])
        conn.commit()

def update_processing(file_id, new_path, new_size, db_path=DB_PATH):
    """Update file details after processing."""
    with get_db_connection(db_path) as conn:
        c = conn.cursor()
        c.execute("""
            UPDATE files SET new_path = ?, new_size = ?, processed_at = ?, queue_status = 'processed'
            WHERE id = ?
        """, (new_path, new_size, datetime.now().isoformat(), file_id))
        conn.commit()

def update_replaced(file_id, new_path, new_size, db_path=DB_PATH):
    """Update file details after replacement."""
    with get_db_connection(db_path) as conn:
        c = conn.cursor()
        c.execute("""
            UPDATE files SET original_path = ?, original_size = ?, new_path = NULL, new_size = NULL,
            user_action = 'replaced', queue_status = 'completed'
            WHERE id = ?
        """, (new_path, new_size, file_id))
        conn.commit()

def update_discarded(file_id, db_path=DB_PATH):
    """Mark file as discarded after processing."""
    with get_db_connection(db_path) as conn:
        c = conn.cursor()
        c.execute("UPDATE files SET user_action = 'discarded', queue_status = 'completed' WHERE id = ?", (file_id,))
        conn.commit()

def update_failed(file_id, db_path=DB_PATH):
    """Mark file as failed if processing fails."""
    with get_db_connection(db_path) as conn:
        c = conn.cursor()
        c.execute("UPDATE files SET queue_status = 'failed' WHERE id = ?", (file_id,))
        conn.commit()

def get_next_queued_file(db_path=DB_PATH):
    """Get the next file in the queue."""
    with get_db_connection(db_path) as conn:
        c = conn.cursor()
        c.execute("SELECT id, original_path FROM files WHERE queue_status = 'confirmed' LIMIT 1")
        return c.fetchone()
