const express = require('express');
const { isAuthenticated, isAdmin } = require('../../middlewares/auth');
const Product = require('../../models/Products');
const Category = require('../../models/Categories');
const Page = require('../../models/Page');
const router = express.Router();

// Admin Dashboard verileri
router.get('/dashboard', isAuthenticated, isAdmin, async (req, res) => {
  try {
    // Veritabanından dashboard verilerini al
    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalPages = await Page.countDocuments();

    const dashboardData = {
      totalProducts,
      totalCategories,
      totalPages,
    };

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error('Dashboard verileri alınırken hata:', error.message);
    res.status(500).json({ error: 'Dashboard verileri alınamadı.' });
  }
});

module.exports = router;
