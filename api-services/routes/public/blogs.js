const express = require('express');
const Blog = require('../../models/Blog'); // Model bağlantısı
const router = express.Router();

// Tüm blogları listele
router.get('/', async (req, res) => {
  try {
    // Veritabanından blogları al
    const blogs = await Blog.find()
      .select('title slug summary category createdAt') // Yalnızca gerekli alanları seç
      .populate('category', 'name'); // Kategori adını dahil et

    res.status(200).json(blogs);
  } catch (err) {
    console.error('Blogları getirirken hata oluştu:', err.message);
    res.status(500).json({ error: 'Bloglar getirilemedi.' });
  }
});

// Belirli bir blog yazısının detaylarını getir
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    // Veritabanından blog detaylarını al
    const blog = await Blog.findOne({ slug })
      .select('title slug content category metaTitle metaDescription metaKeywords createdAt')
      .populate('category', 'name'); // Kategori adını dahil et

    if (!blog) {
      return res.status(404).json({ error: 'Blog bulunamadı.' });
    }

    res.status(200).json(blog);
  } catch (err) {
    console.error('Blog detayları getirilemedi:', err.message);
    res.status(500).json({ error: 'Blog detayları getirilemedi.' });
  }
});

module.exports = router;
