const mongoose = require('mongoose');
const slugify = require('slugify');

// Blog Category Schema
const BlogCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Category name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
      trim: true,
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
    },
  },
  {
    timestamps: true, // createdAt ve updatedAt otomatik olarak eklenir
  }
);

// Slug Oluşturma Middleware
BlogCategorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Static Method: Alfabetik Sıralama
BlogCategorySchema.statics.findAllSorted = function () {
  return this.find().sort({ name: 1 }); // Kategorileri alfabetik sıraya göre döner
};

// Model Export
module.exports = mongoose.model('BlogCategory', BlogCategorySchema);
