const express = require('express');
const Product = require('../models/Products');
const Category = require('../models/Categories');
const router = express.Router();

// Genel Arama Endpoint'i
router.get('/', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Arama sorgusu belirtilmelidir.' });
    }

    // MongoDB Full-Text Search: Ürünler
    const productResults = await Product.find(
      { $text: { $search: query } }, // Full-text search sorgusu
      { score: { $meta: 'textScore' } } // Skorları ekler
    )
      .sort({ score: { $meta: 'textScore' } }) // Skora göre sıralama
      .select('name slug description images') // `images` alanını da dahil ediyoruz
      .populate('images', 'url') // `images` alanını `url` ile ilişkilendiriyoruz
      .exec();

    // MongoDB Regex Search: Kategoriler
    const categoryResults = await Category.find({
      name: { $regex: query, $options: 'i' }, // Case-insensitive arama
    })
      .select('name slug') // Döndürülecek alanları belirleyin
      .exec();

    // Sonuçları birleştirin
    const results = {
      products: productResults,
      categories: categoryResults,
    };

    res.status(200).json(results);
  } catch (err) {
    console.error('Arama hatası:', err.message);
    res.status(500).json({ error: 'Arama işlemi sırasında bir hata oluştu.' });
  }
});

module.exports = router;
