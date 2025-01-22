const mongoose = require('mongoose');
const slugify = require('slugify');

// Category Schema
const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true, // Kategori isimleri benzersiz olacak
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
      default: '',
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      validate: {
        validator: function (v) {
          return v === null || mongoose.Types.ObjectId.isValid(v);
        },
        message: 'Invalid parentCategory ID',
      },
    },
    meta: {
      title: {
        type: String,
        maxlength: [60, 'Meta title cannot exceed 60 characters'],
        default: '',
      },
      description: {
        type: String,
        maxlength: [160, 'Meta description cannot exceed 160 characters'],
        default: '',
      },
      keywords: {
        type: [String],
        default: [],
      },
    },
    images: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media',
        validate: {
          validator: mongoose.Types.ObjectId.isValid,
          message: 'Invalid Media ID',
        },
      },
    ],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    mainImage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media',
      default: null,
      validate: {
        validator: function (v) {
          return v === null || mongoose.Types.ObjectId.isValid(v);
        },
        message: 'Invalid Media ID',
      },
    },
    seo: {
      canonicalUrl: {
        type: String,
        default: '',
        validate: {
          validator: function (v) {
            return v === '' || /^https?:\/\/.*/.test(v); // Boş string veya geçerli URL
          },
          message: 'Invalid URL format for canonical URL',
        },
      },
      breadcrumbs: {
        type: [String],
        default: [],
      },
    },
    
    
  },
  {
    timestamps: true, // Otomatik olarak createdAt ve updatedAt eklenir
  }
);

// Slug Oluşturma Middleware
CategorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Alt Kategorileri Bulma
CategorySchema.statics.findSubcategories = function (parentId) {
  return this.find({ parentCategory: parentId }).populate('parentCategory');
};

// Model Export
module.exports = mongoose.model('Category', CategorySchema);
