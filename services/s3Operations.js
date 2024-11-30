const { PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const s3 = require('./s3Client');

// ファイルアップロード
async function uploadFile(bucketName, key, body, contentType) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: body,
    ContentType: contentType,
  });
  return s3.send(command);
}

// ファイル一覧取得
async function listFiles(bucketName, prefix) {
  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: prefix,
  });
  return s3.send(command);
}

// ファイル削除
async function deleteFile(bucketName, key) {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  return s3.send(command);
}

module.exports = { uploadFile, listFiles, deleteFile };
