const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegStatic);


function getFileSize(filePath) {
  return fs.existsSync(filePath) ? fs.statSync(filePath).size / (1024 * 1024) : 0;
}

function optimizeVideo(inputFile, outputFile) {
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

module.exports = { getFileSize, optimizeVideo };