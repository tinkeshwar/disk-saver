import os
import subprocess
from config import config

OUTPUT_DIR = config.OUTPUT_DIR
FFMPEG_CMD = [
    "ffmpeg", "-i", "{input}", "-c:v", "hevc_amf", "-crf", "18", "-preset", "medium",
    "-c:a", "copy", "{output}"
]

def get_file_size(file_path):
    """Return file size in MB."""
    return os.path.getsize(file_path) / (1024 * 1024) if os.path.exists(file_path) else 0

def optimize_video(input_file, output_file):
    """Run FFmpeg to optimize the video file."""
    cmd = [arg.format(input=input_file, output=output_file) for arg in FFMPEG_CMD]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.returncode == 0