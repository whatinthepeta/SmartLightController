const jwt = require('jsonwebtoken');
const db = require('../db');

function verifyJWT(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }
  const token = header.split(' ')[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const user = db.prepare('SELECT api_calls FROM users WHERE id = ?').get(decoded.id);
  if (!user) return res.status(401).json({ error: 'User not found' });

  if (user.api_calls >= 20) {
    return res.status(429).json({ error: 'API call limit reached (20/20)' });
  }

  req.user = decoded;
  if (user.api_calls >= 15) {
    req.nearLimit = true;
  }
  next();
}

module.exports = { verifyJWT };
