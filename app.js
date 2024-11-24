const express = require('express');
const path = require('path');
const { S3Client, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
require('dotenv').config();

const app = express();
const port = 3000;

// AWS S3の設定
const bucketName = 'slidelibrary'; // あなたのバケット名を指定
const region = 'ap-northeast-1'; // バケットのリージョン
const prefix = 'あこちゃん/2024運動会コアラ組/'; // プレフィックス

// S3クライアントを初期化
const s3 = new S3Client({
  region: region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, // .envファイルに設定
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // .envファイルに設定
  },
});

// 静的ファイルを配信する設定
app.use(express.static(path.join(__dirname, 'public')));

// ルート
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// S3の画像リストと署名付きURLを取得するエンドポイント
app.get('/list-images', async (req, res) => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
    });

    const data = await s3.send(command);

    if (!data.Contents) {
      res.json({
        message: 'No images found in the specified prefix.',
        images: [],
      });
      return;
    }

    // 署名付きURLを生成
    const imageUrls = await Promise.all(
      data.Contents.map(async (item) => {
        const getObjectCommand = new GetObjectCommand({
          Bucket: bucketName,
          Key: item.Key,
        });
        return await getSignedUrl(s3, getObjectCommand, { expiresIn: 3600 }); // URL有効期限: 3600秒
      })
    );

    res.json({
      message: 'Images retrieved successfully',
      imageUrls, // 署名付きURLをクライアントに返す
    });
  } catch (error) {
    console.error('Error listing images:', error);
    res.status(500).send('Error retrieving images from S3.');
  }
});

// サーバーの起動
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
