const express = require('express');
const { listFolders } = require('../services/s3Operations');
const { isAuthenticated } = require('./auth');

const router = express.Router();

router.get('/', isAuthenticated, async (req, res) => {
  try {
    const bucketName = 'slidelibrary';
    const prefix = 'あこちゃん/';

    // listFolders関数を呼び出し、署名付きURLを含む画像リストを取得
    const folders = await listFolders(bucketName, prefix);

    res.status(200).json({
      message: 'Images retrieved successfully',
      folders: folders
    });
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Error retrieving image list.' });
  }
});

module.exports = router;
