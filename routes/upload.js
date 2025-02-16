const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const { uploadFile } = require('../services/s3Operations');
const { isAuthenticated } = require('./auth');
const Queue = require('bull'); // このように修正

const router = express.Router();

// Multer設定（リクエストサイズ制限）
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100000 * 1024 * 1024, // 最大10GB
    files: 300,  // 最大300枚のファイルを受け取る
  },
});

// 非同期タスクを処理するためのバックグラウンドキュー
const fileUploadQueue = new Queue('file-upload', 'redis://127.0.0.1:6379');

fileUploadQueue.on('error', (err) => {
  console.error('Error connecting to Redis:', err);
});

// 複数ファイルを受け取るように変更
router.post('/', isAuthenticated, upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded.' });
    }

    const bucketName = 'slidelibrary';
    const prefix = req.query.prefix || '';

    // 画像のアップロード処理をバックグラウンドで非同期に実行
    const fileUploadPromises = req.files.map((file) => {
      return fileUploadQueue.add({
        file: file,
        prefix: prefix,
        bucketName: bucketName,
      });
    });

    // 非同期処理が全て完了したらレスポンスを返す
    await Promise.all(fileUploadPromises);

    res.status(200).json({ message: 'Files upload tasks started successfully.' });
  } catch (error) {
    console.error('Error in file upload route:', error);
    res.status(500).json({ error: 'Error uploading files.' });
  }
});

// バックグラウンドでの画像処理とアップロード処理
fileUploadQueue.process(async (job, done) => {
  try {
    const { file, prefix, bucketName } = job.data;

    const key = `${prefix}${file.originalname}`;

    // Sharpで画像をリサイズ・圧縮
    const optimizedBuffer = await sharp(file.buffer)
      .resize(800, 600, { fit: 'inside' }) // 最大800x600にリサイズ
      .jpeg({ quality: 70 }) // JPEG形式で圧縮率70%
      .toBuffer();

    // 処理後の画像をS3にアップロード
    await uploadFile(bucketName, key, optimizedBuffer, 'image/jpeg');

    done(); // タスク完了
  } catch (error) {
    console.error('Error processing file in queue:', error);
    done(new Error('Error uploading file'));
  }
});

module.exports = router;
