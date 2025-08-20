// server/routes/books.js
const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Book = require('../models/Book');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * Book Management Routes
 * Handles CRUD operations for books with authentication
 */

/**
 * @route   GET /api/books
 * @desc    Get all books for authenticated user with filtering and search
 * @access  Private
 */
router.get('/', [
  auth,
  query('search').optional().isLength({ max: 100 }).withMessage('Search term too long'),
  query('genre').optional().isIn([
    'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
    'Fantasy', 'Biography', 'History', 'Self-Help', 'Business',
    'Technology', 'Health', 'Travel', 'Cooking', 'Art', 'Religion',
    'Philosophy', 'Psychology', 'Education', 'Children', 'Young Adult',
    'Poetry', 'Drama', 'Horror', 'Thriller', 'Adventure', 'Other'
  ]).withMessage('Invalid genre'),
  query('isRead').optional().isBoolean().withMessage('isRead must be a boolean'),
  query('isBorrowed').optional().isBoolean().withMessage('isBorrowed must be a boolean'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { search, genre, isRead, isBorrowed, page = 1, limit = 10 } = req.query;

    // Build query
    let query = { owner: req.user._id };

    // Add filters
    if (genre) query.genre = genre;
    if (isRead !== undefined) query.isRead = isRead === 'true';
    if (isBorrowed !== undefined) {
      if (isBorrowed === 'true') {
        query.borrowedBy = { $ne: null };
      } else {
        query.borrowedBy = null;
      }
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const books = await Book.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count for pagination
    const total = await Book.countDocuments(query);

    res.json({
      success: true,
      books,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching books'
    });
  }
});

/**
 * @route   GET /api/books/:id
 * @desc    Get single book by ID
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, owner: req.user._id });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.json({
      success: true,
      book
    });
  } catch (error) {
    console.error('Get book error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error fetching book'
    });
  }
});

/**
 * @route   POST /api/books
 * @desc    Add new book
 * @access  Private
 */
router.post('/', [
  auth,
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('author')
    .notEmpty()
    .withMessage('Author is required')
    .isLength({ max: 100 })
    .withMessage('Author cannot exceed 100 characters'),
  body('genre')
    .notEmpty()
    .withMessage('Genre is required')
    .isIn([
      'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
      'Fantasy', 'Biography', 'History', 'Self-Help', 'Business',
      'Technology', 'Health', 'Travel', 'Cooking', 'Art', 'Religion',
      'Philosophy', 'Psychology', 'Education', 'Children', 'Young Adult',
      'Poetry', 'Drama', 'Horror', 'Thriller', 'Adventure', 'Other'
    ])
    .withMessage('Invalid genre'),
  body('publicationYear')
    .isInt({ min: 1000, max: new Date().getFullYear() + 1 })
    .withMessage('Publication year must be a valid year'),
  body('isRead')
    .optional()
    .isBoolean()
    .withMessage('isRead must be a boolean'),
 body('coverImageUrl')
  .optional({ nullable: true })
  .isURL()
  .withMessage('Cover image must be a valid URL'),

body('isbn')
  .optional()
  .custom((value) => {
    if (!value || value === '') return true;
    
    // Simple ISBN validation: 10 or 13 digits with optional hyphens
    const cleaned = value.replace(/[-\s]/g, '');
    return /^(?:\d{10}|\d{13})$/.test(cleaned);
  })
  .withMessage('ISBN must be 10 or 13 digits (hyphens optional)'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Create new book with owner
    const bookData = {
      ...req.body,
      owner: req.user._id
    };

    const book = new Book(bookData);
    await book.save();

    res.status(201).json({
      success: true,
      message: 'Book added successfully',
      book
    });
  } catch (error) {
    console.error('Add book error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding book'
    });
  }
});

/**
 * @route   PUT /api/books/:id
 * @desc    Update book
 * @access  Private
 */
router.put('/:id', [
  auth,
  body('title')
    .optional()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('author')
    .optional()
    .notEmpty()
    .withMessage('Author cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Author cannot exceed 100 characters'),
  body('genre')
    .optional()
    .isIn([
      'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
      'Fantasy', 'Biography', 'History', 'Self-Help', 'Business',
      'Technology', 'Health', 'Travel', 'Cooking', 'Art', 'Religion',
      'Philosophy', 'Psychology', 'Education', 'Children', 'Young Adult',
      'Poetry', 'Drama', 'Horror', 'Thriller', 'Adventure', 'Other'
    ])
    .withMessage('Invalid genre'),
  body('publicationYear')
    .optional()
    .isInt({ min: 1000, max: new Date().getFullYear() + 1 })
    .withMessage('Publication year must be a valid year'),
  body('isRead')
    .optional()
    .isBoolean()
    .withMessage('isRead must be a boolean'),
  body('coverImageUrl')
    .optional()
    .isURL()
    .withMessage('Cover image must be a valid URL'),
  body('isbn')
    .optional()
    .matches(/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/)
    .withMessage('Invalid ISBN format'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const book = await Book.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.json({
      success: true,
      message: 'Book updated successfully',
      book
    });
  } catch (error) {
    console.error('Update book error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error updating book'
    });
  }
});

/**
 * @route   DELETE /api/books/:id
 * @desc    Delete book
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const book = await Book.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('Delete book error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error deleting book'
    });
  }
});

/**
 * @route   PATCH /api/books/:id/borrow
 * @desc    Mark book as borrowed
 * @access  Private
 */
router.patch('/:id/borrow', [
  auth,
  body('borrowedBy')
    .notEmpty()
    .withMessage('Borrower name is required')
    .isLength({ max: 100 })
    .withMessage('Borrower name cannot exceed 100 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const book = await Book.findOne({ _id: req.params.id, owner: req.user._id });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    if (book.borrowedBy) {
      return res.status(400).json({
        success: false,
        message: 'Book is already borrowed'
      });
    }

    await book.borrowBook(req.body.borrowedBy);

    res.json({
      success: true,
      message: 'Book marked as borrowed',
      book
    });
  } catch (error) {
    console.error('Borrow book error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error borrowing book'
    });
  }
});

/**
 * @route   PATCH /api/books/:id/return
 * @desc    Mark book as returned
 * @access  Private
 */
router.patch('/:id/return', auth, async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, owner: req.user._id });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    if (!book.borrowedBy) {
      return res.status(400).json({
        success: false,
        message: 'Book is not borrowed'
      });
    }

    await book.returnBook();

    res.json({
      success: true,
      message: 'Book marked as returned',
      book
    });
  } catch (error) {
    console.error('Return book error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error returning book'
    });
  }
});

/**
 * @route   GET /api/books/stats/summary
 * @desc    Get library statistics
 * @access  Private
 */
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const [
      totalBooks,
      readBooks,
      borrowedBooks,
      genreStats
    ] = await Promise.all([
      Book.countDocuments({ owner: req.user._id }),
      Book.countDocuments({ owner: req.user._id, isRead: true }),
      Book.countDocuments({ owner: req.user._id, borrowedBy: { $ne: null } }),
      Book.aggregate([
        { $match: { owner: req.user._id } },
        { $group: { _id: '$genre', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        totalBooks,
        readBooks,
        unreadBooks: totalBooks - readBooks,
        borrowedBooks,
        readPercentage: totalBooks > 0 ? Math.round((readBooks / totalBooks) * 100) : 0,
        genreDistribution: genreStats
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching statistics'
    });
  }
});

module.exports = router;
