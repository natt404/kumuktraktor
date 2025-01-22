const mongoose = require('mongoose');

// Page Schema
const ComponentSchema = new mongoose.Schema({
  type: { type: String, required: true }, // Örn: text, image, button
  content: { type: mongoose.Schema.Types.Mixed }, // İçerik (dinamik olabilir)
  order: { type: Number, default: 0 }, // Bileşen sırası
});
const PageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true, // Başında ve sonunda boşluk bırakmaz
    },
    slug: {
      type: String,
      required: true,
      unique: true, // URL'de benzersiz olmalı
      lowercase: true, // Küçük harfe dönüştürülür
    },
    content: {
      type: String,
      required: true, // Sayfa içeriği
    },
    metaTitle: {
      type: String,
      maxlength: 60, // SEO için maksimum uzunluk
      default: '', // Varsayılan boş meta başlığı
    },
    metaDescription: {
      type: String,
      maxlength: 160, // SEO için maksimum uzunluk
      default: '', // Varsayılan boş meta açıklaması
    },
    metaKeywords: {
      type: [String], // SEO için anahtar kelimeler
      default: [],
    },
    isPublished: {
      type: Boolean,
      default: false, // Yayın durumu
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Sayfayı oluşturan kullanıcı
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now, // Sayfa oluşturulma tarihi
    },
    updatedAt: {
      type: Date,
      default: Date.now, // Son düzenleme tarihi
    },
    components: [ComponentSchema], // Yeni alan: dinamik bileşenler
  },
  {
    timestamps: true, // Otomatik createdAt ve updatedAt alanları
  }
);

// Slug'ı otomatik oluşturmak için Middleware
PageSchema.pre('save', function (next) {
  if (!this.isModified('title')) return next();
  this.slug = this.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Boşlukları ve özel karakterleri tire ile değiştir
    .replace(/^-+|-+$/g, ''); // Başında veya sonunda tire bırakmaz
  next();
});

module.exports = mongoose.model('Page', PageSchema);
