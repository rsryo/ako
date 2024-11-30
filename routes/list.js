const express = require('express');
const { listFiles } = require('../services/s3Operations');
const { isAuthenticated } = require('./auth');

const router = express.Router();

router.get('/', isAuthenticated, async (req, res) => {
  try {
    const bucketName = 'slidelibrary';
    const prefix = req.query.prefix || '';

    const data = await listFiles(bucketName, prefix);
    const fileList = data.Contents ? data.Contents.map(item => item.Key) : [];

    res.status(200).json({ files: fileList });
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Error retrieving file list.' });
  }
});

module.exports = router;
