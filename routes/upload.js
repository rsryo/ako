const express = require('express');
const multer = require('multer');
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
    const uploadPromises = req.files.map(file => {
      const key = `${prefix}${file.originalname}`;
      return uploadFile(bucketName, key, file.buffer, file.mimetype);
    });

    await Promise.all(uploadPromises);

    res.status(200).json({ message: 'Files uploaded successfully' });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ error: 'Error uploading files.' });
  }
});

module.exports = router;
