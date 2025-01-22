const express = require('express');
const router = express.Router();
const FormData = require('../models/FormData');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');

// Form Gönderimi (Kullanıcı)
router.post('/', async (req, res) => {
  try {
    const { formType, contactInfo, message } = req.body;

    // Form verilerinin validasyonu
    if (!formType || !contactInfo || !message) {
      return res.status(400).json({ error: 'Tüm alanlar gereklidir.' });
    }

    const newForm = new FormData({
      formType,
      contactInfo,
      message,
    });

    const savedForm = await newForm.save();
    res.status(201).json({ message: 'Form başarıyla gönderildi.', data: savedForm });
  } catch (err) {
    console.error('Form gönderim hatası:', err.message);
    res.status(500).json({ error: 'Form gönderimi sırasında bir hata oluştu.' });
  }
});

// Formları Listeleme (Admin)
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const forms = await FormData.find().sort({ submittedAt: -1 });
    res.status(200).json(forms);
  } catch (err) {
    console.error('Formlar alınamadı:', err.message);
    res.status(500).json({ error: 'Formlar alınırken bir hata oluştu.' });
  }
});

// Belirli bir formu görüntüleme (Admin)
router.get('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const form = await FormData.findById(id);

    if (!form) {
      return res.status(404).json({ error: 'Form bulunamadı.' });
    }

    res.status(200).json(form);
  } catch (err) {
    console.error('Form alınamadı:', err.message);
    res.status(500).json({ error: 'Form alınırken bir hata oluştu.' });
  }
});

// Form Silme (Admin)
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedForm = await FormData.findByIdAndDelete(id);

    if (!deletedForm) {
      return res.status(404).json({ error: 'Form bulunamadı.' });
    }

    res.status(200).json({ message: 'Form başarıyla silindi.' });
  } catch (err) {
    console.error('Form silme hatası:', err.message);
    res.status(500).json({ error: 'Form silinirken bir hata oluştu.' });
  }
});

module.exports = router;
