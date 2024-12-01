const express = require('express');
const { listFiles } = require('../services/s3Operations');
const { isAuthenticated } = require('./auth');

const router = express.Router();

router.get('/', isAuthenticated, async (req, res) => {
  try {
    const bucketName = 'slidelibrary';
    const prefix = req.query.prefix || '';

    // listFiles関数を呼び出し、署名付きURLを含む画像リストを取得
    const imageList = await listFiles(bucketName, prefix);

    res.status(200).json({
      message: 'Images retrieved successfully',
      images: imageList,
    });
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Error retrieving image list.' });
  }
});

module.exports = router;
