const express = require('express');
const { isAuthenticated, isAdmin } = require('../../middlewares/auth');
const Category = require('../../models/Categories');
const Media = require('../../models/Media');
const mongoose = require('mongoose');
const router = express.Router();
const upload = require('../../middlewares/multer');
const { optimizeImage } = require('../../services/optimizeService');
const path = require('path');
const fs = require('fs');

// Base URL
const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

// Görsel URL formatlama
const formatImageURL = (doc) => {
  if (doc && doc.fileName) {
    return `${baseUrl}/uploads/${doc.fileName}`;
  } else if (doc && doc.url) {
    return doc.url;
  }
  return null;
};

// Hata işleyici
const handleError = (res, message, err, statusCode = 500) => {
  console.error(message, err.message);
  return res.status(statusCode).json({ error: message });
};

// 📌 Tüm Kategorileri Listeleme (Dropdown için)
router.get('/all', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const categories = await Category.find().select('name _id');
    res.status(200).json(categories);
  } catch (err) {
    handleError(res, 'Kategoriler getirilemedi.', err);
  }
});

// 📌 Tüm Kategorileri Listeleme (Admin)
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const categories = await Category.find()
      .populate('parentCategory', 'name')
      .populate('mainImage', 'url fileName')
      .sort({ createdAt: -1 });

    res.status(200).json(categories);
  } catch (err) {
    handleError(res, 'Kategoriler getirilemedi.', err);
  }
});

router.post('/new', isAuthenticated, isAdmin, upload.single('mainImage'), async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      parentCategory,
      metaTitle,
      metaDescription,
      metaKeywords,
      isFeatured,
      canonicalUrl,
      breadcrumbs,
    } = req.body;

    // Parent kategori ID doğrulama
    let parentCategoryId = null;
    if (parentCategory && parentCategory !== "none") {
      if (mongoose.Types.ObjectId.isValid(parentCategory)) {
        parentCategoryId = parentCategory;
      } else {
        throw new Error("Invalid parentCategory ID");
      }
    }

    // Görsel opsiyonel olduğu için kontrol
    let mainImageId = null;
    if (req.file) {
      const optimizedImagePath = await optimizeImage(req.file.path);
      const media = new Media({
        fileName: req.file.filename,
        url: optimizedImagePath,
        size: req.file.size,
        type: req.file.mimetype,
        mediaType: 'image',
      });
      const savedMedia = await media.save();
      mainImageId = savedMedia._id;
    }

    // canonicalUrl doğrulama (opsiyonel)
    const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*)$/;
    if (canonicalUrl && !urlRegex.test(canonicalUrl)) {
      throw new Error("Invalid URL format for canonical URL");
    }

    // Yeni kategori oluştur
    const newCategory = new Category({
      name,
      slug,
      description,
      parentCategory: parentCategoryId,
      meta: {
        title: metaTitle,
        description: metaDescription,
        keywords: metaKeywords ? metaKeywords.split(',') : [],
      },
      isFeatured: isFeatured === 'true',
      mainImage: mainImageId || undefined,
      seo: {
        canonicalUrl: canonicalUrl || null,
        breadcrumbs: breadcrumbs ? breadcrumbs.split(',') : [],
      },
    });

    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (err) {
    console.error('Kategori eklenemedi:', err.message);
    res.status(400).json({
      error: 'Kategori eklenemedi.',
      details: err.message,
    });
  }
});


// 📌 Belirli Kategoriyi Getir
router.get('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz kategori ID formatı.' });
    }

    const category = await Category.findById(id)
      .populate('parentCategory', 'name')
      .populate('mainImage', 'url fileName');

    if (!category) {
      return res.status(404).json({ error: 'Kategori bulunamadı.' });
    }

    res.status(200).json(category);
  } catch (err) {
    handleError(res, 'Kategori bilgisi alınamadı.', err);
  }
});

// 📌 Kategori Güncelleme
router.put('/:id', isAuthenticated, isAdmin, upload.single('newMainImage'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, parentCategory, metaTitle, metaDescription, metaKeywords, isFeatured, canonicalUrl, breadcrumbs } = req.body;

    // Parent kategori ID doğrulama
    let parentCategoryId = null;
    if (parentCategory && parentCategory !== "none" && mongoose.Types.ObjectId.isValid(parentCategory)) {
      parentCategoryId = parentCategory;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz kategori ID formatı.' });
    }

    // Ana Görsel Güncelleme
    let mainImageId = null;
    if (req.file) {
      const optimizedImagePath = await optimizeImage(req.file.path);
      const media = new Media({
        fileName: req.file.filename,
        url: optimizedImagePath,
        size: req.file.size,
        type: req.file.mimetype,
        mediaType: 'image',
      });
      const savedMedia = await media.save();
      mainImageId = savedMedia._id;
    }

    const updates = {
      name,
      slug,
      description,
      parentCategory: parentCategory && mongoose.Types.ObjectId.isValid(parentCategory) ? parentCategory : null,
      meta: {
        title: metaTitle,
        description: metaDescription,
        keywords: metaKeywords ? metaKeywords.split(',') : [],
      },
      isFeatured: isFeatured === 'true',
      mainImage: mainImageId || undefined,
      seo: {
        canonicalUrl,
        breadcrumbs: breadcrumbs ? breadcrumbs.split(',') : [],
      },
    };

    const updatedCategory = await Category.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedCategory) {
      return res.status(404).json({ error: 'Kategori bulunamadı.' });
    }

    res.status(200).json(updatedCategory);
  } catch (err) {
    handleError(res, 'Kategori güncellenemedi.', err);
  }
});

// 📌 Kategori Silme
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz kategori ID formatı.' });
    }

    const deletedCategory = await Category.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({ error: 'Kategori bulunamadı.' });
    }

    res.status(200).json({ message: 'Kategori silindi.' });
  } catch (err) {
    handleError(res, 'Kategori silinemedi.', err);
  }
});

module.exports = router;
