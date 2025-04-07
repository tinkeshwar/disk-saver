const router = require('express').Router();
const path = require('path');
const { login } = require('../controllers/auth.controller');
const { scannedFiles } = require('../controllers/file.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

router.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const token = login(username, password);
  if (token) {
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

router.get('/api/files', verifyToken, async (req, res) => {
  const files = await scannedFiles();
  if (files.length > 0) {
    res.json(files);
  } else {
    res.status(404).json({ error: 'No files found' });
  }
});

module.exports = router;