const { INPUT_DIR, VIDEO_EXTENSIONS } = require('../configs/constant')
const { readdir, stat } = require('fs').promises;
const path = require('path');
const { getFileSize } = require('../services/queue-processor');
const { addFile } = require('../services/db-operation');

module.exports = async function scanFiles() {
  const walkDir = async (dir) => {
    try {
      const items = await readdir(dir);
      const results = await Promise.all(
        items.map(async item => {
          const fullPath = path.join(dir, item);
          const stats = await stat(fullPath);
          
          if (stats.isDirectory()) {
            return walkDir(fullPath);
          }
          
          return VIDEO_EXTENSIONS.some(ext => fullPath.endsWith(ext)) ? [{
            path: fullPath,
            filename: path.basename(fullPath)
          }] : [];
        })
      );
      
      return results.flat();
    } catch (err) {
      console.error(`Error scanning directory ${dir}: ${err}`);
      return [];
    }
  };

  const videoFiles = await walkDir(INPUT_DIR);
  await Promise.all(
    videoFiles.map(async file => {
      const size = getFileSize(file.path);
      await addFile(file.path, file.filename, size);
    })
  );

  console.log(`Scanned ${videoFiles.length} files at ${INPUT_DIR}`);
  setTimeout(scanFiles, 24 * 60 * 60 * 1000);
}
