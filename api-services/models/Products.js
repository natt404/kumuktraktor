const mongoose = require('mongoose');
const slugify = require('slugify');

// Product Schema
const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    urunkod: {
      type: String,
      unique: true,
      required: [true, 'Product kod is required'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [5000, 'Description cannot exceed 2000 characters'],
    },
    price: {
      type: Number,
      required: [false, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
    },
    category: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
        validate: {
          validator: mongoose.Types.ObjectId.isValid,
          message: 'Invalid Category ID',
        },
      },
    ],
    images: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media',
      },
    ],
    tags: {
      type: [String],
      default: [],
    },
    brand: {
      type: String,
      trim: true,
    },
    motorType: {
      type: String,
      default: null,
    },
    dimensions: {
      length: { type: Number, default: null },
      width: { type: Number, default: null },
      height: { type: Number, default: null },
    },
    weight: {
      type: Number,
      default: null,
    },
    diameter: {
      type: Number,
      default: null,
    },
    power: {
      type: String,
      default: null,
    },
    meta: {
      title: {
        type: String,
        maxlength: [60, 'Meta title cannot exceed 60 characters'],
      },
      description: {
        type: String,
        maxlength: [160, 'Meta description cannot exceed 160 characters'],
      },
      keywords: {
        type: [String],
        default: [],
      },
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // createdAt ve updatedAt otomatik olarak eklenir
  }
);

// Full-Text Search Index
ProductSchema.index(
  {
    name: 'text',
    description: 'text',
    'meta.keywords': 'text',
    brand: 'text',
  },
  {
    weights: {
      name: 5,
      description: 3,
      'meta.keywords': 2,
      brand: 2,
    },
    name: 'TextSearchIndex',
  }
);

// Slug Middleware
ProductSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
    });
  }
  next();
});

// Model Export
module.exports = mongoose.model('Product', ProductSchema);
