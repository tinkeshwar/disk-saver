const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const { getNextQueuedFile, updateProcessing, updateFailed } = require('./db-operation');

ffmpeg.setFfmpegPath(ffmpegStatic);


async function getFileSize(filePath) {
  return fs.existsSync(filePath) ? fs.statSync(filePath).size / (1024 * 1024) : 0;
}

async function optimizeVideo(inputFile, outputFile) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputFile)
      .output(outputFile)
      .videoCodec('hevc_amf')
      .outputOptions(['-crf 18', '-preset medium'])
      .audioCodec('copy')
      .on('end', () => resolve(true))
      .on('error', (err) => reject(err))
      .run();
  });
}

async function processQueue() {
  while (true) {
    const file = await getNextQueuedFile();
    if (!file) break;

    const { id, original_path } = file;
    const tempOutput = path.join(OUTPUT_DIR, `${path.basename(original_path)}`);

    try {
      if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      await optimizeVideo(original_path, tempOutput);
      const newSize = getFileSize(tempOutput);
      await updateProcessing(id, tempOutput, newSize);
    } catch (err) {
      if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
      await updateFailed(id);
      console.error(`Failed to process ${original_path}: ${err}`);
    }
  }
}

module.exports = { getFileSize, optimizeVideo, processQueue };