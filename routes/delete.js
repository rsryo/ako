const express = require('express');
const { deleteFile } = require('../services/s3Operations');
const { isAuthenticated } = require('./auth');

const router = express.Router();

router.delete('/:key', isAuthenticated , async (req, res) => {
  try {
    const bucketName = 'slidelibrary';
    const key = req.params.key;

    await deleteFile(bucketName, key);

    res.status(200).json({ message: 'File deleted successfully', key });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Error deleting file.' });
  }
});

module.exports = router;
