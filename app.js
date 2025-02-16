const express = require('express');
const cors = require('cors');
const uploadRouter = require('./routes/upload');
const slideRouter = require('./routes/slideChange');
const listRouter = require('./routes/list');
const deleteRouter = require('./routes/delete');
const prefixRouter = require('./routes/prefix');
const authRouter = require('./routes/auth');

const app = express();
const port = 5000;

app.set('trust proxy', 1);  // リバースプロキシ環境でのIP取得を正しく行う

// CORSの設定（JWT はクッキーを使わないので `credentials: false`）
app.use(cors({
  origin: ['https://akolibrary.net', 'http://localhost:3000'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// JSONリクエストを処理するミドルウェア
app.use(express.json());

// ルート設定
app.use('/upload', uploadRouter);
app.use('/slideChange', slideRouter);
app.use('/list', listRouter);
app.use('/delete', deleteRouter);
app.use('/prefix', prefixRouter);
app.use('/', authRouter); // 認証APIを適切なパスに変更

// サーバー起動
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
