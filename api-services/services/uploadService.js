const multer = require('multer');
const path = require('path');

// Yükleme için Depolama Yapılandırması
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Dosyaların kaydedileceği klasör
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// Dosya Türü Doğrulama
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Geçersiz dosya türü. Sadece JPEG, PNG, GIF ve MP4 desteklenir.'));
  }
};

// Maksimum Dosya Boyutu (10 MB)
const maxSize = 10 * 1024 * 1024;

// Multer Yapılandırması
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSize },
});

module.exports = {
  uploadSingle: upload.single('file'), // Tek dosya yükleme
  uploadMultiple: upload.array('files', 5), // Maksimum 5 dosya yükleme
};
