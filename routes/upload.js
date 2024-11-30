const express = require('express');
const multer = require('multer');
const { uploadFile } = require('../services/s3Operations');
const { isAuthenticated } = require('./auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', isAuthenticated, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const bucketName = 'slidelibrary';
    const prefix = 'AppleTest/テスト/';
    const key = `${prefix}${req.file.originalname}`;

    await uploadFile(bucketName, key, req.file.buffer, req.file.mimetype);

    res.status(200).json({ message: 'File uploaded successfully', key });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Error uploading file.' });
  }
});

module.exports = router;

//複数ファイルのアップロード