const { getPendingFiles } = require('../services/db-operation')
const { INPUT_DIR } = require('../configs/constant')
const path = require('path');

const scannedFiles = async () => {
  try {
    const files = await getPendingFiles();
    return files.map(f => ({
      id: f.id,
      name: f.filename,
      path: path.relative(INPUT_DIR, f.original_path),
      size: f.original_size
    }))
  } catch (err) {
    throw err;
  }
}

module.exports = { scannedFiles };