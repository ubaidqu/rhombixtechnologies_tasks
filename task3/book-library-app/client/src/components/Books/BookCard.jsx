import React, { useState } from 'react';

const BookCard = ({ book, showActions, onToggleActions, onEdit, onDelete, onBorrow, onReturn }) => {
  const [imageError, setImageError] = useState(false);
  // const [showActions, setShowActions] = useState(false);

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get genre color
  const getGenreColor = (genre) => {
    const colors = {
      'Fiction': 'bg-blue-100 text-blue-800',
      'Non-Fiction': 'bg-green-100 text-green-800',
      'Mystery': 'bg-purple-100 text-purple-800',
      'Romance': 'bg-pink-100 text-pink-800',
      'Science Fiction': 'bg-indigo-100 text-indigo-800',
      'Fantasy': 'bg-purple-100 text-purple-800',
      'Biography': 'bg-yellow-100 text-yellow-800',
      'History': 'bg-red-100 text-red-800',
      'Self-Help': 'bg-orange-100 text-orange-800',
      'Business': 'bg-gray-100 text-gray-800',
      'Technology': 'bg-blue-100 text-blue-800',
      'Health': 'bg-green-100 text-green-800',
      'Travel': 'bg-teal-100 text-teal-800',
      'Cooking': 'bg-orange-100 text-orange-800',
      'Art': 'bg-pink-100 text-pink-800',
      'Religion': 'bg-purple-100 text-purple-800',
      'Philosophy': 'bg-indigo-100 text-indigo-800',
      'Psychology': 'bg-blue-100 text-blue-800',
      'Education': 'bg-green-100 text-green-800',
      'Children': 'bg-yellow-100 text-yellow-800',
      'Young Adult': 'bg-pink-100 text-pink-800',
      'Poetry': 'bg-purple-100 text-purple-800',
      'Drama': 'bg-red-100 text-red-800',
      'Horror': 'bg-gray-100 text-gray-800',
      'Thriller': 'bg-red-100 text-red-800',
      'Adventure': 'bg-green-100 text-green-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[genre] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* Book Cover */}
      <div className="aspect-w-3 aspect-h-4 bg-gray-200">
        {book.coverImageUrl && !imageError ? (
          <img
            src={book.coverImageUrl}
            alt={`${book.title} cover`}
            className="w-full h-48 object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="mt-2 text-xs text-gray-500">No Cover</p>
            </div>
          </div>
        )}
      </div>

      {/* Book Info */}
      <div className="p-4">
        {/* Title and Author */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-1">
            {book.title}
          </h3>
          <p className="text-sm text-gray-600">by {book.author}</p>
        </div>

        {/* Genre and Year */}
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGenreColor(book.genre)}`}>
            {book.genre}
          </span>
          <span className="text-xs text-gray-500">{book.publicationYear}</span>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          {book.isRead ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Read
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              To Read
            </span>
          )}

          {book.borrowedBy && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" clipRule="evenodd" />
              </svg>
              Borrowed
            </span>
          )}
        </div>

        {/* Borrowed Info */}
        {book.borrowedBy && (
          <div className="bg-yellow-50 rounded-md p-3 mb-3">
            <div className="text-xs text-yellow-800">
              <p className="font-medium">Borrowed by: {book.borrowedBy}</p>
              <p>Since: {formatDate(book.borrowedDate)}</p>
            </div>
          </div>
        )}

        {/* Rating */}
        {book.rating && (
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`h-4 w-4 ${i < book.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-2 text-sm text-gray-600">({book.rating}/5)</span>
            </div>
          </div>
        )}

        {/* Description */}
        {book.description && (
          <p className="text-sm text-gray-600 line-clamp-3 mb-3">
            {book.description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="relative">
       <button
  onClick={onToggleActions}
  className="w-full flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
>
            Actions
            <svg
              className={`ml-2 h-4 w-4 transition-transform ${showActions ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showActions && (
            <>
              {/* Click outside backdrop */}
             <div
  className="fixed inset-0 z-40"
  onClick={onToggleActions}
/>
              
              {/* Dropdown menu */}
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="py-1">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onEdit && onEdit(book);
                      onToggleActions();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Edit
                  </button>
                  
                  {book.borrowedBy ? (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onReturn && onReturn(book._id);
                        onToggleActions();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Mark as Returned
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onBorrow && onBorrow(book);
                        onToggleActions();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Lend Book
                    </button>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (window.confirm('Are you sure you want to delete this book?')) {
                        onDelete && onDelete(book._id);
                      }
                      onToggleActions();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
