const express = require('express');
const app = express();
const session = require('express-session');

const router = express.Router();

app.set('trust proxy', true);  // リバースプロキシを信頼

// セッションのミドルウェアを設定
router.use(session({
  secret: process.env.SESSION_SERCRET_KEY, // セッションを保護するための秘密キー
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true, // HTTPSを使用する場合は true に設定
    httpOnly: true, // JavaScriptからアクセスできないようにする
    maxAge: 1000 * 60 * 60 * 24 * 365 * 3, // 1年間の有効期限
    sameSite: 'None'
  }
}));

// 認証ミドルウェアを作成
function isAuthenticated(req, res, next) {
  if (req.session.isAuthenticated) {
    return next(); // 認証済みなら次のミドルウェアへ
  } else {
    return res.status(401).json({ message: 'Unauthorized access. Please log in.' });
  }
}

// ログインAPI
router.post('/api/login', (req, res) => {
  const { password } = req.body;

  // 簡単なパスワードチェック
  if (password === process.env.AKO_PASSWORD) { // 任意のパスワードをここに設定
    req.session.isAuthenticated = true;
    res.status(200).json({ message: 'ログイン成功' });
  } else {
    res.status(401).json({ message: '認証失敗' });
  }
});

// ログアウトAPI
router.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'ログアウト中にエラーが発生しました' });
    }
    res.status(200).json({ message: 'ログアウト成功' });
  });
});

// 認証状態を確認するAPI
router.get('/api/auth-status', (req, res) => {
  const protocol = req.get('X-Forwarded-Proto');  // X-Forwarded-Protoヘッダーを取得
  console.log('リクエストのプロトコル:', protocol);  // 'https' または 'http' が表示されるはず
  if (req.session.isAuthenticated) {
    res.status(200).json({ isAuthenticated: true });
  } else {
    res.status(401).json({ isAuthenticated: false });
  }
});

module.exports = router; // OK
module.exports.isAuthenticated = isAuthenticated;