const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// 認証ミドルウェア
function isAuthenticated(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'トークンがありません' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'トークンが無効です' });
    }
    req.user = user;
    next();
  });
}

// ログインAPI
router.post('/api/login', (req, res) => {
  const { password } = req.body;

  if (password === process.env.AKO_PASSWORD) {
    const token = jwt.sign({ user: 'authenticated' }, JWT_SECRET, { expiresIn: '8760h' });
    res.status(200).json({ message: 'ログイン成功', token });
  } else {
    res.status(401).json({ message: '認証失敗' });
  }
});

// 認証状態を確認するAPI
router.get('/api/auth-status', isAuthenticated, (req, res) => {
  res.status(200).json({ isAuthenticated: true });
});

// ログアウトAPI（トークンを無効にする仕組みは不要。クライアント側で削除）
router.post('/api/logout', (req, res) => {
  res.status(200).json({ message: 'ログアウト成功' });
});

module.exports = router;
module.exports.isAuthenticated = isAuthenticated;