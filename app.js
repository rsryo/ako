const express = require('express');
const session = require('express-session');
const uploadRouter = require('./routes/upload');
const slideRouter = require('./routes/slideChange');
const listRouter = require('./routes/list');
const deleteRouter = require('./routes/delete');
const prefixRouter = require('./routes/prefix');
const authRouter = require('./routes/auth');
const cors = require('cors');

const app = express();
const port = 5000;

app.set('trust proxy', true);  // リバースプロキシを信頼

// CORSの設定
app.use(cors({
  origin: 'https://akolibrary.net',  // フロントエンドのURLを指定
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // 許可するHTTPメソッド
  credentials: true, // クッキーなどの認証情報を含むリクエストを許可
}));

// JSONリクエストを処理するミドルウェア
app.use(express.json());

// セッションのミドルウェアを設定
app.use(session({
  secret: process.env.SESSION_SERCRET_KEY, // セッションを保護するための秘密キー
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // HTTPSを使用する場合は true に設定
    httpOnly: true, // JavaScriptからアクセスできないようにする
    maxAge: 1000 * 60 * 60 * 24 * 365 * 3, // 1年間の有効期限
    sameSite: 'None'
  }
}));

// ルートを設定
app.use('/upload', uploadRouter);
app.use('/slideChange', slideRouter);
app.use('/list', listRouter);
app.use('/delete', deleteRouter);
app.use('/prefix', prefixRouter); 
app.use('/', authRouter); // 認証関連のルートを追加

// サーバー起動
app.listen(port, () => {
  console.log(`Server running on http://`);
});
