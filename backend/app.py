import os
import glob
from backend.db_operation import update_failed
from flask import Flask, request, jsonify, send_from_directory
from flask_jwt_extended import JWTManager, jwt_required, create_access_token
from config import config
from db_operation import init_db, add_file, get_pending_files, queue_files, get_next_queued_file, update_processing, update_replaced, update_discarded
from queue_processor import get_file_size, optimize_video
from threading import Thread
from queue import Queue

app = Flask(__name__, static_folder='../frontend/build', static_url_path='/')
app.config['JWT_SECRET_KEY'] = config.JWT_SECRET_KEY
jwt = JWTManager(app)

# Configuration from config.py
INPUT_DIR = config.INPUT_DIR
OUTPUT_DIR = config.OUTPUT_DIR
DB_PATH = config.DB_PATH
VIDEO_EXTENSIONS = config.VIDEO_EXTENSIONS
USERNAME = config.USERNAME
PASSWORD = config.PASSWORD

# Initialize database
init_db(DB_PATH)

# Queue for processed files awaiting confirmation
confirmation_queue = Queue()

def scan_files():
    """Scan input directory and update database."""
    video_files = []
    for ext in VIDEO_EXTENSIONS:
        video_files.extend(glob.glob(os.path.join(INPUT_DIR, "**", f"*{ext}"), recursive=True))
    for file in sorted(video_files):
        size = get_file_size(file)
        add_file(file, size, DB_PATH)
    return video_files

def process_queue():
    """Process files in the queue one at a time."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    while True:
        file = get_next_queued_file(DB_PATH)
        if not file:
            break
        
        file_id, input_file = file
        temp_output = os.path.join(OUTPUT_DIR, f"optimized_{os.path.basename(input_file)}")
        
        if optimize_video(input_file, temp_output):
            new_size = get_file_size(temp_output)
            update_processing(file_id, temp_output, new_size, DB_PATH)
            confirmation_queue.put((file_id, input_file, temp_output, new_size))
        else:
            if os.path.exists(temp_output):
                os.remove(temp_output)
            update_failed(file_id, DB_PATH)

# Serve React app
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

# Authentication endpoint
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    if data.get('username') == USERNAME and data.get('password') == PASSWORD:
        access_token = create_access_token(identity=USERNAME)
        return jsonify({'token': access_token}), 200
    return jsonify({'error': 'Invalid credentials'}), 401

# API to list pending files
@app.route('/api/files', methods=['GET'])
@jwt_required()
def list_files():
    scan_files()  # Refresh file list
    files = get_pending_files(DB_PATH)
    return jsonify([{
        'id': f[0],
        'path': os.path.relpath(f[1], INPUT_DIR),
        'size': f[2]
    } for f in files])

# API to queue files for processing
@app.route('/api/queue', methods=['POST'])
@jwt_required()
def queue():
    data = request.get_json()
    file_ids = data.get('fileIds', [])
    if not file_ids:
        return jsonify({'error': 'No files selected'}), 400
    queue_files(file_ids, DB_PATH)
    Thread(target=process_queue).start()  # Run in background
    return jsonify({'message': 'Files queued for processing'}), 200

# API to get processed files awaiting confirmation
@app.route('/api/processed', methods=['GET'])
@jwt_required()
def get_processed():
    processed_files = []
    while not confirmation_queue.empty():
        file_id, input_file, temp_output, new_size = confirmation_queue.get()
        old_size = get_file_size(input_file)
        processed_files.append({
            'id': file_id,
            'path': os.path.relpath(input_file, INPUT_DIR),
            'oldSize': old_size,
            'newSize': new_size,
            'tempPath': temp_output
        })
    return jsonify(processed_files)

# API to confirm replacement or discard
@app.route('/api/confirm', methods=['POST'])
@jwt_required()
def confirm():
    data = request.get_json()
    file_id = data.get('id')
    action = data.get('action')  # 'replace' or 'discard'
    temp_path = data.get('tempPath')
    new_size = data.get('newSize')
    original_path = data.get('path')

    if action == 'replace':
        full_original_path = os.path.join(INPUT_DIR, original_path)
        shutil.move(temp_path, full_original_path)
        update_replaced(file_id, full_original_path, new_size, DB_PATH)
        return jsonify({'message': f'Replaced {original_path}'}), 200
    elif action == 'discard':
        os.remove(temp_path)
        update_discarded(file_id, DB_PATH)
        return jsonify({'message': f'Discarded optimized version for {original_path}'}), 200
    return jsonify({'error': 'Invalid action'}), 400

if __name__ == '__main__':
    app.run(debug=config.FLASK_ENV == 'development')