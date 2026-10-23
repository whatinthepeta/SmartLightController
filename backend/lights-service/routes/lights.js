const express = require('express');
const { verifyJWT } = require('../middleware/auth');
const { sendGoveeCommand } = require('../services/govee');
const { parseCommand, suggestScene } = require('../services/ai');
const db = require('../db');

const router = express.Router();

function incrementApiCalls(userId) {
  db.prepare('UPDATE users SET api_calls = api_calls + 1 WHERE id = ?').run(userId);
}

router.put('/power', verifyJWT, async (req, res) => {
  try {
    const { on } = req.body;
    await sendGoveeCommand('turn', on ? 'on' : 'off');
    incrementApiCalls(req.user.id);
    res.json({ success: true, nearLimit: req.nearLimit || false });
  } catch (err) {
    res.status(502).json({ error: `Light command failed: ${err.message}` });
  }
});

router.put('/brightness', verifyJWT, async (req, res) => {
  try {
    const { value } = req.body;
    if (value === undefined || value < 0 || value > 100) {
      return res.status(400).json({ error: 'brightness value must be 0-100' });
    }
    await sendGoveeCommand('brightness', value);
    incrementApiCalls(req.user.id);
    res.json({ success: true, nearLimit: req.nearLimit || false });
  } catch (err) {
    res.status(502).json({ error: `Light command failed: ${err.message}` });
  }
});

router.put('/color', verifyJWT, async (req, res) => {
  try {
    const { r, g, b } = req.body;
    await sendGoveeCommand('color', { r, g, b });
    incrementApiCalls(req.user.id);
    res.json({ success: true, nearLimit: req.nearLimit || false });
  } catch (err) {
    res.status(502).json({ error: `Light command failed: ${err.message}` });
  }
});

router.post('/command', verifyJWT, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'text required' });
    }

    const settings = await parseCommand(text);
    await sendGoveeCommand('color', { r: settings.r, g: settings.g, b: settings.b });
    await sendGoveeCommand('brightness', settings.brightness);
    incrementApiCalls(req.user.id);
    res.json({ success: true, settings, nearLimit: req.nearLimit || false });
  } catch (err) {
    res.status(502).json({ error: `Command failed: ${err.message}` });
  }
});

router.get('/suggest', verifyJWT, async (req, res) => {
  try {
    const scene = await suggestScene();
    res.json({ ...scene, nearLimit: req.nearLimit || false });
  } catch (err) {
    res.status(502).json({ error: `Suggestion failed: ${err.message}` });
  }
});

module.exports = router;
