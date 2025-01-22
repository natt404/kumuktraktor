const mongoose = require('mongoose');

// Media Schema (Resim ve Video)
const MediaSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      unique: true, // Aynı isimde dosya yüklenmesini engeller
      trim: true,
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      validate: {
        validator: function (v) {
          return /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|mp4|webp))$/i.test(v);
        },
        message: 'Please provide a valid URL',
      },
    },
    size: {
      type: Number, // Dosya boyutu (byte cinsinden)
      min: [0, 'Size must be a positive number'],
    },
    type: {
      type: String, // MIME türü
      enum: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'],
      required: [true, 'Type is required'],
    },
    mediaType: {
      type: String,
      enum: ['image', 'video'], // Resim veya video olarak işaretle
      required: [true, 'Media type is required'],
    },
    duration: {
      type: Number, // Video için süre (saniye cinsinden)
      default: null, // Resimler için boş bırakılır
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Dosyayı yükleyen kullanıcı
      
    },
    associatedModel: {
      type: String, // Bu medya dosyasının bağlı olduğu model adı
      enum: ['Product', 'Blog', 'Category'], // İzin verilen modeller
      default: null,
    },
    associatedId: {
      type: mongoose.Schema.Types.ObjectId, // Bağlı modelin ID'si
      validate: {
        validator: function (v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: 'Invalid associatedId',
      },
    },
  },
  { timestamps: true }
);

// Middleware: File Name Format Control
MediaSchema.pre('save', function (next) {
  if (!this.isModified('fileName')) return next();

  // Dosya ismini küçük harfe çevir ve boşlukları tire ile değiştir
  this.fileName = this.fileName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-\.]+/g, '');
  next();
});

// Modeli tanımla ve export et
module.exports = mongoose.model('Media', MediaSchema);
