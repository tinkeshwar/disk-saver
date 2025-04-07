import os
from dotenv import load_dotenv

# Load .env file from the backend directory
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

class Config:
    """Centralized configuration class for the application."""
    
    # Directory and database paths
    INPUT_DIR = os.getenv('INPUT_DIR', '/input')
    OUTPUT_DIR = os.getenv('OUTPUT_DIR', '/output')
    DB_NAME = getenv('DB_NAME', "video_optimizer.db")
    DB_PATH = f"/config/{DB_NAME}"
    
    # Video file extensions
    VIDEO_EXTENSIONS = (".mp4", ".mkv", ".avi")
    
    # Authentication credentials
    USERNAME = os.getenv('USERNAME', 'admin')
    PASSWORD = os.getenv('PASSWORD', 'password')
    
    # JWT settings
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'super-secret-key')
    
    # Flask settings
    FLASK_ENV = os.getenv('FLASK_ENV', 'production')

# Instantiate config object for easy import
config = Config()