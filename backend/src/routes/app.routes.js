const router = require('express').Router();
const path = require('path');

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

module.exports = router;