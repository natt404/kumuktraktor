const mongoose = require('mongoose');

// Form Data Schema
const FormDataSchema = new mongoose.Schema(
  {
    formType: {
      type: String,
      required: [true, 'Form type is required'],
      enum: ['contact', 'feedback', 'custom', 'newsletter', 'support'],
      default: 'contact',
    },
    fields: {
      type: mongoose.Schema.Types.Mixed, // Key-value yapısı için Mixed veri türü
      default: {},
    },
    contactInfo: {
      name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters'],
      },
      email: {
        type: String,
        required: [true, 'Email is required'],
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
      },
      phone: {
        type: String,
        required: false,
        match: [/^\+?\d{7,15}$/, 'Please provide a valid phone number'],
      },
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
      trim: true,
    },
    isSpam: {
      type: Boolean,
      default: false, // Spam koruması için flag
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // createdAt ve updatedAt otomatik eklenir
  }
);

// Pre-save Middleware: Trim Fields
FormDataSchema.pre('save', function (next) {
  if (this.fields) {
    Object.keys(this.fields).forEach((key) => {
      if (typeof this.fields[key] === 'string') {
        this.fields[key] = this.fields[key].trim();
      }
    });
  }
  next();
});

// Custom Static Method: Filter by Form Type
FormDataSchema.statics.findByFormType = function (formType) {
  return this.find({ formType });
};

module.exports = mongoose.model('FormData', FormDataSchema);
