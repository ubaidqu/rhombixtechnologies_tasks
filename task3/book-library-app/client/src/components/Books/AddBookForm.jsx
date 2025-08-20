// client/src/components/Books/AddBookForm.jsx
import React, { useState } from 'react';
import useBooks from '../../hooks/useBooks';
import LoadingSpinner from '../Common/LoadingSpinner';

/**
 * Add Book Form Component
 * Form for adding new books to the library
 */

const AddBookForm = ({ onSuccess, onCancel }) => {
  const { addBook, loading, error } = useBooks();
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    publicationYear: new Date().getFullYear(),
    isRead: false,
    coverImageUrl: '',
    isbn: '',
    description: '',
    rating: '',
    notes: ''
  });
  
  const [formErrors, setFormErrors] = useState({});

  const genres = [
    'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
    'Fantasy', 'Biography', 'History', 'Self-Help', 'Business',
    'Technology', 'Health', 'Travel', 'Cooking', 'Art', 'Religion',
    'Philosophy', 'Psychology', 'Education', 'Children', 'Young Adult',
    'Poetry', 'Drama', 'Horror', 'Thriller', 'Adventure', 'Other'
  ];

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.author.trim()) {
      errors.author = 'Author is required';
    }

    if (!formData.genre) {
      errors.genre = 'Genre is required';
    }

    if (!formData.publicationYear) {
      errors.publicationYear = 'Publication year is required';
    } else if (formData.publicationYear < 1000 || formData.publicationYear > new Date().getFullYear() + 1) {
      errors.publicationYear = 'Please enter a valid publication year';
    }

    if (formData.coverImageUrl && !isValidUrl(formData.coverImageUrl)) {
      errors.coverImageUrl = 'Please enter a valid URL';
    }

    if (formData.rating && (formData.rating < 1 || formData.rating > 5)) {
      errors.rating = 'Rating must be between 1 and 5';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // URL validation helper
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Clean form data
    const cleanData = {
      ...formData,
      publicationYear: parseInt(formData.publicationYear),
      rating: formData.rating ? parseInt(formData.rating) : null
    };

    // Remove empty strings
    Object.keys(cleanData).forEach(key => {
      if (cleanData[key] === '') {
        cleanData[key] = null;
      }
    });

    const result = await addBook(cleanData);
    
    if (result.success) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title *
          </label>
          <input
            type="text"
            name="title"
            id="title"
            required
            value={formData.title}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border ${
              formErrors.title ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            placeholder="Enter book title"
          />
          {formErrors.title && (
            <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
          )}
        </div>

        {/* Author */}
        <div>
          <label htmlFor="author" className="block text-sm font-medium text-gray-700">
            Author *
          </label>
          <input
            type="text"
            name="author"
            id="author"
            required
            value={formData.author}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border ${
              formErrors.author ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            placeholder="Enter author name"
          />
          {formErrors.author && (
            <p className="mt-1 text-sm text-red-600">{formErrors.author}</p>
          )}
        </div>

        {/* Genre and Publication Year */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="genre" className="block text-sm font-medium text-gray-700">
              Genre *
            </label>
            <select
              name="genre"
              id="genre"
              required
              value={formData.genre}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                formErrors.genre ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            >
              <option value="">Select a genre</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
            {formErrors.genre && (
              <p className="mt-1 text-sm text-red-600">{formErrors.genre}</p>
            )}
          </div>

          <div>
            <label htmlFor="publicationYear" className="block text-sm font-medium text-gray-700">
              Publication Year *
            </label>
            <input
              type="number"
              name="publicationYear"
              id="publicationYear"
              required
              min="1000"
              max={new Date().getFullYear() + 1}
              value={formData.publicationYear}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                formErrors.publicationYear ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            />
            {formErrors.publicationYear && (
              <p className="mt-1 text-sm text-red-600">{formErrors.publicationYear}</p>
            )}
          </div>
        </div>

        {/* Cover Image URL */}
        <div>
          <label htmlFor="coverImageUrl" className="block text-sm font-medium text-gray-700">
            Cover Image URL
          </label>
          <input
            type="url"
            name="coverImageUrl"
            id="coverImageUrl"
            value={formData.coverImageUrl}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border ${
              formErrors.coverImageUrl ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            placeholder="https://example.com/book-cover.jpg"
          />
          {formErrors.coverImageUrl && (
            <p className="mt-1 text-sm text-red-600">{formErrors.coverImageUrl}</p>
          )}
        </div>

        {/* ISBN */}
        <div>
          <label htmlFor="isbn" className="block text-sm font-medium text-gray-700">
            ISBN
          </label>
          <input
            type="text"
            name="isbn"
            id="isbn"
            value={formData.isbn}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="978-0123456789"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Brief description of the book..."
          />
        </div>

        {/* Rating and Read Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
              Rating (1-5)
            </label>
            <select
              name="rating"
              id="rating"
              value={formData.rating}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                formErrors.rating ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            >
              <option value="">No rating</option>
              <option value="1">1 Star</option>
              <option value="2">2 Stars</option>
              <option value="3">3 Stars</option>
              <option value="4">4 Stars</option>
              <option value="5">5 Stars</option>
            </select>
            {formErrors.rating && (
              <p className="mt-1 text-sm text-red-600">{formErrors.rating}</p>
            )}
          </div>

          <div className="flex items-center h-full">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isRead"
                id="isRead"
                checked={formData.isRead}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="isRead" className="ml-2 block text-sm text-gray-900">
                I have read this book
              </label>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Personal Notes
          </label>
          <textarea
            name="notes"
            id="notes"
            rows="2"
            value={formData.notes}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Your personal notes about this book..."
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            loading
              ? 'bg-indigo-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {loading ? (
            <>
              <LoadingSpinner size="small" />
              <span className="ml-2">Adding...</span>
            </>
          ) : (
            'Add Book'
          )}
        </button>
      </div>
    </form>
  );
};

export default AddBookForm;
