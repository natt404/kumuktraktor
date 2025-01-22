const express = require('express');
const { isAuthenticated, isAdmin } = require('../../middlewares/auth');
const Product = require('../../models/Products');
const mongoose = require('mongoose');
const router = express.Router();
const upload = require('../../middlewares/multer'); // Multer middleware'i dahil et
const { optimizeImage } = require('../../services/optimizeService');
const Media = require('../../models/Media');
const path = require('path');
const fs = require('fs');

// Base URL
const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

// Helper: Görsel URL formatlama
const formatImageURL = (doc) => {
  if (doc && doc.fileName) {
    return `${baseUrl}/uploads/${doc.fileName}`;
  } else if (doc && doc.url) {
    return doc.url;
  }
  return null;
};

// General error handler
const handleError = (res, message, err, statusCode = 500) => {
  console.error(message, err.message);
  return res.status(statusCode).json({ error: message });
};

// Helper: Allowed fields validation
const allowedFields = [
  'name',
  'urunkod',
  'slug',
  'description',
  'price',
  'stock',
  'category',
  'metaTitle',
  'metaDescription',
  'metaKeywords',
  'brand',
  'motorType',
  'power',
  'dimensions',
  'isFeatured',
  'isActive',
];

const validateFields = (updates) => {
  return Object.keys(updates).every((key) => allowedFields.includes(key));
};

// Tüm ürünleri listele (Admin)
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const products = await Product.find()
      .select('name slug price stock category createdAt updatedAt')
      .populate('category', 'name')
      .populate({
        path: 'images',
        select: 'fileName url',
      });

    // Görselleri formatla
    const formattedProducts = products.map((product) => {
      product.images = product.images.map(formatImageURL);
      return product;
    });

    res.status(200).json(formattedProducts);
  } catch (err) {
    handleError(res, 'Ürünler getirilemedi.', err);
  }
});

// Belirli bir ürünü getir
router.get('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // ID doğrulama
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz ürün ID formatı.' });
    }

    // Ürünü veritabanından getir
    const product = await Product.findById(id)
      .populate('category', 'name') // Kategori bilgilerini doldur
      .populate({
        path: 'images',
        select: 'fileName url', // Görsel bilgilerini doldur
      });

    // Ürün bulunamadıysa hata döndür
    if (!product) {
      return res.status(404).json({ error: 'Ürün bulunamadı.' });
    }

    // Görselleri URL formatına çevir
    product.images = product.images.map((img) => ({
      _id: img._id,
      url: formatImageURL(img),
    }));

    res.status(200).json(product);
  } catch (err) {
    handleError(res, 'Ürün bilgisi alınamadı.', err);
  }
});


// Helper: Görsel ID Dönüşümü
const processImageIds = async (images) => {
  const processedImages = [];
  for (const image of images) {
    if (mongoose.Types.ObjectId.isValid(image)) {
      processedImages.push(image); // Zaten ObjectId ise ekle
    } else {
      const media = await Media.findOne({ fileName: image });
      if (media) {
        processedImages.push(media._id);
      }
    }
  }
  return processedImages;
};

// Yeni ürün ekle
router.post('/new', isAuthenticated, isAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const {
      name,
      urunkod,
      description,
      price,
      stock,
      category,
      metaTitle,
      metaDescription,
      metaKeywords,
      brand,
      motorType,
      power,
      dimensions,
    } = req.body;

    // Zorunlu alanları kontrol et
    const requiredFields = ['name', 'urunkod', 'description', 'stock', 'category'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ error: `${field} is required.` });
      }
    }

    // Benzersiz ürün kodu kontrolü
    const existingProduct = await Product.findOne({ urunkod });
    if (existingProduct) {
      return res.status(400).json({ error: 'Bu ürün kodu zaten mevcut.' });
    }

    // Kategori ID'lerini kontrol et
    const categoryIds = Array.isArray(category) ? category : [category];
    const validCategories = categoryIds.every((cat) => mongoose.Types.ObjectId.isValid(cat));
    if (!validCategories) {
      return res.status(400).json({ error: 'One or more category IDs are invalid.' });
    }

    const images = [];
    for (const file of req.files) {
      const optimizedImagePath = await optimizeImage(file.path);
      const media = new Media({
        fileName: file.filename,
        url: optimizedImagePath,
        size: file.size,
        type: file.mimetype,
        mediaType: 'image',
      });
      const savedMedia = await media.save();
      images.push(savedMedia._id);
    }

    const newProduct = new Product({
      name,
      urunkod,
      description,
      price,
      stock,
      category: categoryIds,
      images,
      meta: {
        title: metaTitle,
        description: metaDescription,
        keywords: metaKeywords?.split(','),
      },
      brand,
      motorType,
      power,
      dimensions: dimensions ? JSON.parse(dimensions) : {},
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    handleError(res, 'Ürün eklenemedi.', err);
  }
});

// Ürün güncelleme
router.put('/:id', isAuthenticated, isAdmin, upload.array('newImages', 5), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Güncelleme alanlarını kontrol et
    if (!validateFields(updates)) {
      return res.status(400).json({ error: 'One or more fields are invalid or not allowed.' });
    }

    // Kategori kontrolü
    if (updates.category) {
      const categoryIds = Array.isArray(updates.category) ? updates.category : [updates.category];
      const validCategories = categoryIds.every((cat) => mongoose.Types.ObjectId.isValid(cat));
      if (!validCategories) {
        return res.status(400).json({ error: 'One or more category IDs are invalid.' });
      }
      updates.category = categoryIds;
    }

    let existingImages = updates.images ? JSON.parse(updates.images) : [];

    const newImages = [];
    for (const file of req.files) {
      const optimizedImagePath = await optimizeImage(file.path);
      const media = new Media({
        fileName: file.filename,
        url: `${baseUrl}/uploads/${file.filename}`,
        size: file.size,
        type: file.mimetype,
        mediaType: 'image',
      });
      const savedMedia = await media.save();
      newImages.push(savedMedia._id);
    }

    updates.images = [...existingImages, ...newImages];

    const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Ürün bulunamadı.' });
    }

    updatedProduct.images = updatedProduct.images.map(formatImageURL);
    res.status(200).json(updatedProduct);
  } catch (err) {
    handleError(res, 'Ürün güncellenemedi.', err);
  }
});

// Ürün sil
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz ürün ID formatı.' });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ error: 'Ürün bulunamadı.' });
    }

    res.status(200).json({ message: 'Ürün silindi.' });
  } catch (err) {
    handleError(res, 'Ürün silinemedi.', err);
  }
});

module.exports = router;
