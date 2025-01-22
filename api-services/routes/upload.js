const express = require('express');
const { uploadSingle } = require('../services/uploadService');
const { optimizeImage, optimizeVideo } = require('../services/optimizeService');
const path = require('path');
const fs = require('fs/promises'); // fs/promises modülünü kullanarak async işlemler yapabiliriz
const router = express.Router();

// Dosya Optimizasyonu ve Silinmesi Yardımcı Fonksiyonu
const optimizeAndClean = async (filePath, outputPath, optimizer) => {
  try {
    const optimizedFile = await optimizer(filePath, outputPath);
    await fs.unlink(filePath); // Orijinal dosyayı sil
    return optimizedFile;
  } catch (error) {
    console.error('Optimizasyon veya dosya silme hatası:', error.message);
    throw new Error('Optimizasyon sırasında bir hata oluştu.');
  }
};

// Tek Dosya Yükleme ve Optimize Etme
router.post('/single', (req, res) => {
  uploadSingle(req, res, async (err) => {
    if (err) {
      console.error('Dosya yükleme hatası:', err.message);
      return res.status(400).json({ error: err.message });
    }

    const filePath = path.join(__dirname, '../uploads/', req.file.filename);
    const outputPath = path.join(__dirname, '../uploads/optimized-', req.file.filename);

    try {
      let optimizedFile;

      if (req.file.mimetype.startsWith('image')) {
        optimizedFile = await optimizeAndClean(filePath, outputPath, optimizeImage);
      } else if (req.file.mimetype.startsWith('video')) {
        optimizedFile = await optimizeAndClean(filePath, outputPath, optimizeVideo);
      } else {
        // Desteklenmeyen dosya türü
        await fs.unlink(filePath); // Geçersiz dosyayı sil
        return res.status(400).json({ error: 'Sadece görsel ve video dosyaları desteklenir.' });
      }

      res.status(200).json({
        message: `${req.file.mimetype.startsWith('image') ? 'Görsel' : 'Video'} başarıyla optimize edildi.`,
        file: optimizedFile,
      });
    } catch (error) {
      console.error('Optimizasyon hatası:', error.message);
      res.status(500).json({ error: error.message });
    }
  });
});

module.exports = router;
