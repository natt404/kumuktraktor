const express = require('express');
const { sendEmail } = require('../services/emailService');
const router = express.Router();

router.get('/send-test-email', async (req, res) => {
  try {
    const testEmail = process.env.EMAIL_USER;

    await sendEmail(
      testEmail,
      'Test E-postası',
      `<p>Bu bir test e-postasıdır. Eğer bu mesajı aldıysanız, sistem doğru çalışıyor demektir.</p>`
    );

    res.status(200).json({ message: 'Test e-postası başarıyla gönderildi.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
