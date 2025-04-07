const { getPendingFiles, queueFiles, getQueuedFiles, getProcessingFiles } = require('../services/db-operation')
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

const processFileIntoQueue = async (ids) => {
  try {
    await queueFiles([...ids]);
    processQueue();
    return true;
  } catch (err) {
    console.log(err)
    throw err;
  }
}

const queuedFiles = async () => {
  try {
    const files = await getQueuedFiles();
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

const processedFiles = async () => {
  try {
    const files = await getProcessingFiles();
    return files.map(f => ({
      id: f.id,
      name: f.filename,
      path: path.relative(INPUT_DIR, f.original_path),
      size: f.original_size,
      new_size: f.new_size,
      new_path: path.relative(INPUT_DIR, f.new_path)
    }))
  } catch (err) {
    throw err;
  }
}

module.exports = { scannedFiles, processFileIntoQueue, queuedFiles, processedFiles };