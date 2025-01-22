const express = require('express');
const Category = require('../../models/Categories'); // Category modeli
const Product = require('../../models/Products'); // Product modeli
const router = express.Router();
const baseUrl = process.env.BASE_URL || 'http://localhost:5000'; // Backend'in temel URL'si

// Helper: Görsel URL formatlama
const formatImageURL = (doc) => {
  if (doc && doc.fileName) {
    return `${baseUrl}/uploads/${doc.fileName}`;
  } else if (doc && doc.url) {
    return doc.url;
  }
  return null;
};

// Helper: Ürünleri sorgu olarak döndür
const getProductWithImagesQuery = (query) => {
  return Product.find(query)
    .select('name slug description price images')
    .populate('category', 'name') // Kategori bilgisini al
    .populate({
      path: 'images', // Görselleri getir
      select: 'fileName url', // Görsel bilgileri
      transform: formatImageURL, // URL formatlama
    });
};

// Tüm kategorileri listele
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().select('name slug description');
    res.status(200).json(categories);
  } catch (err) {
    console.error('Kategoriler alınırken hata oluştu:', err.message);
    res.status(500).json({ error: 'Kategoriler getirilemedi.' });
  }
});

// Belirli bir kategorideki ürünleri ve alt kategorileri getir (Pagination destekli)
router.get('/:slug/products', async (req, res) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Sayfa ve limit değerlerini kontrol et
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
      return res.status(400).json({ error: 'Geçersiz sayfa veya limit parametresi.' });
    }

    // Kategori bilgisi al
    const category = await Category.findOne({ slug });
    if (!category) {
      return res.status(404).json({ error: 'Kategori bulunamadı.' });
    }

    // Bu kategoriye ait ürünleri al
    const totalProducts = await Product.countDocuments({ category: category._id });
    const products = await getProductWithImagesQuery({ category: category._id })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    // Bu kategoriye bağlı alt kategorileri al
    const subcategories = await Category.find({ parent: category._id }).select(
      'name slug description'
    );

    res.status(200).json({
      category: {
        name: category.name,
        slug: category.slug,
        description: category.description,
      },
      products,
      subcategories,
      pagination: {
        total: totalProducts,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalProducts / limitNumber),
      },
    });
  } catch (err) {
    console.error('Kategoriye göre ürünler alınırken hata oluştu:', err.message);
    res.status(500).json({ error: 'Ürünler ve alt kategoriler getirilemedi.' });
  }
});

module.exports = router;
