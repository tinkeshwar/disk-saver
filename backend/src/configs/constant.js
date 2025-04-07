require('dotenv').config();

module.exports = {
  INPUT_DIR: process.env.INPUT_DIR || '/input',
  OUTPUT_DIR: process.env.OUTPUT_DIR || '/output',
  DB_NAME: process.env.DB_NAME || 'db.db',
  VIDEO_EXTENSIONS: ['.mp4', '.mkv', '.avi'],
  USERNAME: process.env.USERNAME || 'admin',
  PASSWORD: process.env.PASSWORD || 'password',
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || 'super-secret-key',
  NODE_ENV: process.env.NODE_ENV || 'production',
};