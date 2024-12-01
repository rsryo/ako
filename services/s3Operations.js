const { PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand, GetObjectCommand  } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
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

async function listFiles(bucketName, prefix) {
  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: prefix,
  });

  try {
    const data = await s3.send(command);

    if (!data.Contents) {
      return [];
    }

    // 署名付きURLを生成
    const imageUrls = await Promise.all(
      data.Contents.map(async (item) => {
        const getObjectCommand = new GetObjectCommand({
          Bucket: bucketName,
          Key: item.Key,
        });
        const url = await getSignedUrl(s3, getObjectCommand, { expiresIn: 3600 }); // URL有効期限: 3600秒
        return {
          key: item.Key,
          url,
        };
      })
    );

    return imageUrls;
  } catch (error) {
    console.error('Error generating signed URLs:', error);
    throw new Error('Error generating signed URLs');
  }
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
