const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

const optimizeImage = async (inputPath) => {
  // Optimize edilmiş dosya adını oluştur
  const outputPath = path.join(
    path.dirname(inputPath),
    `optimized-${path.basename(inputPath)}`
  );

  try {
    // Görseli yeniden boyutlandır ve optimize et
    await sharp(inputPath)
      .resize({ width: 800 }) // Görsel genişliğini küçült
      .toFormat('jpeg', { quality: 80 }) // Kaliteyi ayarla
      .toFile(outputPath); // Optimize edilmiş dosyayı kaydet

    // Optimize edilmiş dosyanın URL formatında döndürülmesi
    const fileUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${path.basename(outputPath)}`;
    return fileUrl;
  } catch (error) {
    throw new Error(`Görsel optimize edilirken hata: ${error.message}`);
  }
};

module.exports = {
  optimizeImage,
};
