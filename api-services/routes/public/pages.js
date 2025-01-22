const express = require('express');
const Page = require('../../models/Page'); // Page modeli
const router = express.Router();

// Tüm sayfaları listele
router.get('/', async (req, res) => {
  try {
    // Veritabanından sayfaları al ve görsellerin sadece URL'lerini getir
    const pages = await Page.find()
      .select('title slug content createdAt updatedAt images') // Gerekli alanlar
      .populate('images', 'url') // Görsel URL'lerini al
      .sort({ createdAt: -1 });

    if (!pages.length) {
      return res.status(404).json({ message: 'Henüz sayfa bulunmamaktadır.' });
    }

    res.status(200).json(pages);
  } catch (err) {
    console.error('Sayfaları getirirken hata oluştu:', err.message);
    res.status(500).json({ error: 'Sayfalar getirilemedi.' });
  }
});

// Belirli bir sayfanın detaylarını getir
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    // Veritabanından slug'a göre sayfayı al ve ilişkili görselleri populate et
    const page = await Page.findOne({ slug })
      .select('title slug content metaTitle metaDescription metaKeywords createdAt updatedAt images')
      .populate('images', 'url'); // Görsellerin URL'lerini getir

    if (!page) {
      return res.status(404).json({ error: 'Sayfa bulunamadı.' });
    }

    res.status(200).json(page);
  } catch (err) {
    console.error('Sayfa detayları getirilemedi:', err.message);
    res.status(500).json({ error: 'Sayfa detayları getirilemedi.' });
  }
});

module.exports = router;
