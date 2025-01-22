const express = require('express');
const { isAuthenticated, isAdmin } = require('../../middlewares/auth');
const Page = require('../../models/Page');
const mongoose = require('mongoose');
const router = express.Router();

// Genel hata işleyici
const handleError = (res, message, err, statusCode = 500) => {
  console.error(message, err.message);
  return res.status(statusCode).json({ error: message });
};

// Tüm sayfaları listele (Admin)
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const pages = await Page.find()
      .select('title slug createdAt updatedAt')
      .sort({ createdAt: -1 });

    res.status(200).json(pages);
  } catch (err) {
    handleError(res, 'Sayfalar getirilemedi.', err);
  }
});

// Yeni sayfa oluştur
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { title, slug, content, metaTitle, metaDescription, metaKeywords } = req.body;

    const newPage = new Page({
      title,
      slug,
      content,
      metaTitle,
      metaDescription,
      metaKeywords,
    });

    const savedPage = await newPage.save();
    res.status(201).json(savedPage);
  } catch (err) {
    handleError(res, 'Sayfa oluşturulamadı.', err);
  }
});

// Belirli bir sayfayı getir
router.get('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Geçersiz ID kontrolü
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz sayfa ID formatı.' });
    }

    const page = await Page.findById(id);
    if (!page) {
      return res.status(404).json({ error: 'Sayfa bulunamadı.' });
    }

    res.status(200).json(page);
  } catch (err) {
    handleError(res, 'Sayfa bilgisi alınamadı.', err);
  }
});

// Sayfa düzenle
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz sayfa ID formatı.' });
    }

    const updates = req.body;
    const updatedPage = await Page.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedPage) {
      return res.status(404).json({ error: 'Sayfa bulunamadı.' });
    }

    res.status(200).json(updatedPage);
  } catch (err) {
    handleError(res, 'Sayfa düzenlenemedi.', err);
  }
});

// Sayfa sil
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz sayfa ID formatı.' });
    }

    const deletedPage = await Page.findByIdAndDelete(id);
    if (!deletedPage) {
      return res.status(404).json({ error: 'Sayfa bulunamadı.' });
    }

    res.status(200).json({ message: 'Sayfa silindi.' });
  } catch (err) {
    handleError(res, 'Sayfa silinemedi.', err);
  }
});

module.exports = router;
