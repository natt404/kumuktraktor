const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Şifreleme için

// Kullanıcı Şeması
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // E-posta benzersiz olmalı
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // E-posta doğrulama
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'superadmin'], // Kullanıcı rolleri
      default: 'user', // Varsayılan rol
    },
    permissions: {
      type: [String], // Özel yetkiler (ör. 'manage-products', 'view-reports')
      default: [], // Varsayılan yetkiler boş olabilir
    },
    isActive: {
      type: Boolean,
      default: true, // Kullanıcı aktif mi?
    },
    isVerified: {
      type: Boolean,
      default: false, // E-posta doğrulandı mı?
    },
    verificationToken: {
      type: String, // Doğrulama tokeni
      default: null,
    },
    resetPasswordToken: {
      type: String, // Şifre sıfırlama tokeni
      default: null,
    },
    resetPasswordExpires: {
      type: Date, // Şifre sıfırlama tokeninin geçerlilik süresi
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Otomatik createdAt ve updatedAt
  }
);

// Şifreyi kaydetmeden önce hash'leme
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Şifre değişmemişse geç
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt); // Şifreyi hashle
    next();
  } catch (err) {
    next(err); // Hata durumunda geçişi sağla
  }
});


// Şifre doğrulama
UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    throw new Error('Şifre karşılaştırma başarısız!');
  }
};

// Kullanıcı rolleri ve yetkileri kontrolü için metod
UserSchema.methods.hasPermission = function (permission) {
  return this.permissions.includes(permission);
};

module.exports = mongoose.model('User', UserSchema);
