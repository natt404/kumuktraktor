const express = require('express');
const { isAuthenticated, isAdmin } = require('../../middlewares/auth');
const Media = require('../../models/Media');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const router = express.Router();


const Product = require('../../models/Products');
const Category = require('../../models/Categories');

// 📌 Görsel Silme Endpoint'i (Bağımlılık Kontrolü ile)
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz görsel ID.' });
    }

    // Görselin herhangi bir ürün veya kategoride kullanılıp kullanılmadığını kontrol et
    const isImageUsedInProduct = await Product.findOne({ images: id });
    const isImageUsedInCategory = await Category.findOne({ images: id, mainImage: id });

    if (isImageUsedInProduct || isImageUsedInCategory) {
      return res.status(400).json({ error: 'Bu görsel hala bir üründe veya kategoride kullanılıyor.' });
    }

    // Görseli veritabanından sil
    const media = await Media.findByIdAndDelete(id);
    if (!media) return res.status(404).json({ error: 'Görsel bulunamadı.' });

    // Fiziksel dosyayı sil
    const filePath = path.join(__dirname, '../../uploads', media.fileName);
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Dosya silme hatası:', err);
      }
    });

    res.status(200).json({ message: 'Görsel başarıyla silindi.' });
  } catch (err) {
    console.error('Görsel silinirken hata oluştu:', err);
    res.status(500).json({ error: 'Görsel silinirken hata oluştu.' });
  }
});

module.exports = router;
