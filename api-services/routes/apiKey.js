const express = require('express');
const router = express.Router();

// API Key Endpoint
router.get('/google-maps-key', (req, res) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API Key not found' });
  }

  res.status(200).json({ apiKey });
});

module.exports = router;
