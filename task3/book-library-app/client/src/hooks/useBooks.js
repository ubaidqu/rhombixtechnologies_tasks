// client/src/hooks/useBooks.js
import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Custom hook for managing books data and operations
 * Provides CRUD operations and state management for books
 */

const useBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false
  });

  // Fetch books with filters and pagination
  const fetchBooks = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      
      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });

      const response = await api.get(`/books?${params}`);
      
      setBooks(response.data.books);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch books');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add new book
  const addBook = async (bookData) => {
    try {
      setError(null);
      const response = await api.post('/books', bookData);
      
      // Add new book to the beginning of the list
      setBooks(prevBooks => [response.data.book, ...prevBooks]);
      
      return { success: true, book: response.data.book };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add book';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Update book
  const updateBook = async (bookId, bookData) => {
    try {
      setError(null);
      const response = await api.put(`/books/${bookId}`, bookData);
      
      // Update book in the list
      setBooks(prevBooks =>
        prevBooks.map(book =>
          book._id === bookId ? response.data.book : book
        )
      );
      
      return { success: true, book: response.data.book };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update book';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Delete book
  const deleteBook = async (bookId) => {
    try {
      setError(null);
      await api.delete(`/books/${bookId}`);
      
      // Remove book from the list
      setBooks(prevBooks => prevBooks.filter(book => book._id !== bookId));
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete book';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Borrow book
  const borrowBook = async (bookId, borrowedBy) => {
    try {
      setError(null);
      const response = await api.patch(`/books/${bookId}/borrow`, { borrowedBy });
      
      // Update book in the list
      setBooks(prevBooks =>
        prevBooks.map(book =>
          book._id === bookId ? response.data.book : book
        )
      );
      
      return { success: true, book: response.data.book };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to borrow book';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Return book
  const returnBook = async (bookId) => {
    try {
      setError(null);
      const response = await api.patch(`/books/${bookId}/return`);
      
      // Update book in the list
      setBooks(prevBooks =>
        prevBooks.map(book =>
          book._id === bookId ? response.data.book : book
        )
      );
      
      return { success: true, book: response.data.book };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to return book';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Get library statistics
  const getStats = async () => {
    try {
      const response = await api.get('/books/stats/summary');
      return { success: true, stats: response.data.stats };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch statistics';
      return { success: false, error: errorMessage };
    }
  };

  // Clear error
  const clearError = () => setError(null);

  return {
    books,
    loading,
    error,
    pagination,
    fetchBooks,
    addBook,
    updateBook,
    deleteBook,
    borrowBook,
    returnBook,
    getStats,
    clearError
  };
};

export default useBooks;
