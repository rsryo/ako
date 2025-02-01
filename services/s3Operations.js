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

// フォルダ一覧を取得する
async function listFolders(bucketName, prefix) {
  try {
    const params = {
      Bucket: bucketName,
      Prefix: prefix,
      Delimiter: '/' // フォルダを区切るために使用
    };

    const command = new ListObjectsV2Command(params);
    const data = await s3.send(command);

    // CommonPrefixes が undefined の場合を考慮
    if (!data.CommonPrefixes) {
      return [];
    }

    const folders = data.CommonPrefixes.map(item => item.Prefix);
    console.log('Folders:', folders);
    return folders;
  } catch (err) {
    console.error('Error listing folders:', err);
    throw new Error('Error listing folders');
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

//設定されているスライドショーを取得
async function selectSlideData(bucketName, key) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key // 取得したいファイル名を指定
  });

  // ストリームを文字列に変換する関数
  async function streamToString(stream) {
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString("utf-8");
  }

  try {
    const response = await s3.send(command);
    const body = await streamToString(response.Body);
    console.log("取得した内容:", body);
    
    return body;
  } catch (error) {
    console.error("エラー:", error);
    return null;
  }
}

module.exports = { uploadFile, listFiles,listFolders, deleteFile, selectSlideData };
