const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const { uploadFile } = require('../services/s3Operations');
const { isAuthenticated } = require('./auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// 複数ファイルを受け取るように変更
router.post('/', isAuthenticated, upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded.' });
    }

    const bucketName = 'slidelibrary';
    const prefix = req.query.prefix || '';

    // 各ファイルをアップロード
    const uploadPromises = req.files.map(async (file) => {
      const key = `${prefix}${file.originalname}`;

      // Sharpで画像をリサイズ・圧縮
      const optimizedBuffer = await sharp(file.buffer)
      .resize(800, 600, { fit: 'inside' }) // 最大800x600にリサイズ
      .jpeg({ quality: 70 }) // JPEG形式で圧縮率70%
      .toBuffer();
      // 処理後の画像をS3にアップロード
      return uploadFile(bucketName, key, optimizedBuffer, 'image/jpeg');
    });

    await Promise.all(uploadPromises);

    res.status(200).json({ message: 'Files uploaded successfully' });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ error: 'Error uploading files.' });
  }
});

module.exports = router;
