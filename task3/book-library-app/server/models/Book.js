// server/models/Book.js
const mongoose = require('mongoose');

/**
 * Book Schema for managing personal book library
 * Contains all book information and borrowing history
 */
const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true,
    maxlength: [100, 'Author name cannot exceed 100 characters']
  },
  genre: {
    type: String,
    required: [true, 'Genre is required'],
    trim: true,
    enum: [
      'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
      'Fantasy', 'Biography', 'History', 'Self-Help', 'Business',
      'Technology', 'Health', 'Travel', 'Cooking', 'Art', 'Religion',
      'Philosophy', 'Psychology', 'Education', 'Children', 'Young Adult',
      'Poetry', 'Drama', 'Horror', 'Thriller', 'Adventure', 'Other'
    ],
    default: 'Other'
  },
  publicationYear: {
    type: Number,
    required: [true, 'Publication year is required'],
    min: [1000, 'Publication year must be a valid year'],
    max: [new Date().getFullYear() + 1, 'Publication year cannot be in the future']
  },
  isRead: {
    type: Boolean,
    default: false
  },
  coverImageUrl: {
    type: String,
    trim: true,
    default: null,
    // match: [/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i, 'Please enter a valid image URL']
  },
  // Borrowing functionality
  borrowedBy: {
    type: String,
    trim: true,
    default: null,
    maxlength: [100, 'Borrower name cannot exceed 100 characters']
  },
  borrowedDate: {
    type: Date,
    default: null
  },
  // Reference to the user who owns this book
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Additional metadata
isbn: {
  type: String,
  trim: true,
  default: null,
  validate: {
    validator: function(v) {
      // Allow empty/null values (optional field)
      if (!v || v === '') return true;
      
      // Simple ISBN validation: 10 or 13 digits with optional hyphens
      const cleaned = v.replace(/[-\s]/g, ''); // Remove hyphens and spaces
      return /^(?:\d{10}|\d{13})$/.test(cleaned);
    },
    message: 'ISBN must be 10 or 13 digits (hyphens optional)'
  }
},
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    default: null
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    default: null
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    default: null
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Index for better search performance
bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ owner: 1, genre: 1 });
bookSchema.index({ owner: 1, isRead: 1 });
bookSchema.index({ owner: 1, borrowedBy: 1 });

// Virtual for checking if book is currently borrowed
bookSchema.virtual('isBorrowed').get(function() {
  return this.borrowedBy !== null && this.borrowedBy !== '';
});

// Method to borrow book
bookSchema.methods.borrowBook = function(borrowerName) {
  this.borrowedBy = borrowerName;
  this.borrowedDate = new Date();
  return this.save();
};

// Method to return book
bookSchema.methods.returnBook = function() {
  this.borrowedBy = null;
  this.borrowedDate = null;
  return this.save();
};

module.exports = mongoose.model('Book', bookSchema);
