const express = require('express');
const db = require('../db');
const { verifyJWT } = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

const router = express.Router();

router.get('/users', verifyJWT, adminOnly, (req, res) => {
  const users = db.prepare('SELECT id, email, role, api_calls FROM users').all();
  res.json(users);
});

module.exports = router;
