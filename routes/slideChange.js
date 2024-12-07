const express = require('express');
const { uploadFile } = require('../services/s3Operations');
const { isAuthenticated } = require('./auth');

const router = express.Router();

// `PUT`リクエストでファイル内容を更新
router.put('/', isAuthenticated, async (req, res) => {
  try {
    const bucketName = 'slidelibrary';
    const key = 'あこちゃん/selectedAlbum.txt';
    const { content } = req.body; // リクエストボディから新しい内容を取得

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // ファイル内容を更新するために uploadFile を使用
    await uploadFile(bucketName, key, content, 'text/plain');

    res.status(200).json({ message: 'File updated successfully' });
  } catch (error) {
    console.error('Error updating file:', error);
    res.status(500).json({ error: 'Error updating file' });
  }
});

module.exports = router;
