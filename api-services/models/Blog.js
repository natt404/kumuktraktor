const mongoose = require('mongoose');
const slugify = require('slugify');

// Blog Schema
const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BlogCategory',
      required: [true, 'Category is required'],
      validate: {
        validator: mongoose.Types.ObjectId.isValid,
        message: 'Invalid category ID',
      },
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // User modeli ile ilişkilendir
      required: [true, 'Author is required'],
    },
    meta: {
      title: {
        type: String,
        maxlength: [60, 'Meta title cannot exceed 60 characters'],
        required: [true, 'Meta title is required'],
      },
      description: {
        type: String,
        maxlength: [160, 'Meta description cannot exceed 160 characters'],
        required: [true, 'Meta description is required'],
      },
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags) {
          return tags.length <= 10; // Maksimum 10 tag sınırı
        },
        message: 'You can add up to 10 tags',
      },
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt ve updatedAt otomatik eklenir
  }
);

// Middleware: Slug Oluşturma
BlogSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }

  // Yayınlanma kontrolü
  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = Date.now();
  }
  next();
});

// Static Method: Yayınlanan Blogları Getir
BlogSchema.statics.findPublished = function () {
  return this.find({ isPublished: true });
};

// Model Export
module.exports = mongoose.model('Blog', BlogSchema);
