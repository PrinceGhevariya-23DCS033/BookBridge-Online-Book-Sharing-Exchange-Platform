import { BookOpen, ChevronLeft, Heart, Share2, ShoppingCart, Star } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cartAPI } from '../services/api';

const API_KEY = 'AIzaSyAQXJAvdiEO-nuAxqhvj7aLVNmHU_SaNuY';
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await fetch(`${BASE_URL}/${id}?key=${API_KEY}`);
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error.message);
        }

        setBook({
          id: data.id,
          title: data.volumeInfo.title,
          authors: data.volumeInfo.authors || ['Unknown Author'],
          description: data.volumeInfo.description || 'No description available',
          image: data.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/128x192?text=No+Image',
          price: data.saleInfo?.listPrice?.amount || 'Price not available',
          currency: data.saleInfo?.listPrice?.currencyCode || 'USD',
          rating: data.volumeInfo.averageRating || 0,
          categories: data.volumeInfo.categories || ['Uncategorized'],
          publishedDate: data.volumeInfo.publishedDate,
          pageCount: data.volumeInfo.pageCount,
          language: data.volumeInfo.language,
          previewLink: data.volumeInfo.previewLink,
          publisher: data.volumeInfo.publisher,
          isbn: data.volumeInfo.industryIdentifiers?.[0]?.identifier,
          maturityRating: data.volumeInfo.maturityRating,
        });

        // Fetch related books
        const relatedResponse = await fetch(
          `${BASE_URL}?q=${data.volumeInfo.categories?.[0] || 'books'}&key=${API_KEY}&maxResults=4`
        );
        const relatedData = await relatedResponse.json();
        setRelatedBooks(relatedData.items || []);
      } catch (err) {
        setError('Failed to fetch book details. Please try again later.');
        console.error('Error fetching book:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      if (!book?.id) {
        throw new Error('Book ID is required');
      }
      
      setIsAddingToCart(true);
      
      // Ensure we're sending a string ID
      const bookId = String(book.id);
      
      const response = await cartAPI.addToCart(bookId, 'new');
      if (response.data) {
        alert('Book added to cart successfully!');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.response?.status === 401) {
        alert('Please login to add items to cart');
        navigate('/login');
      } else if (error.response?.status === 400) {
        alert(error.response.data?.message || 'Invalid request. Please try again.');
      } else if (error.response?.status === 404) {
        alert('Book not found. Please try again.');
      } else {
        alert(error.message || error.response?.data?.message || 'Failed to add book to cart');
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/marketplace')}
            className="text-teal-600 hover:text-teal-700"
          >
            Return to Marketplace
          </button>
        </div>
      </div>
    );
  }

  if (!book) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/marketplace')}
            className="flex items-center text-gray-600 hover:text-teal-600 transition-colors duration-300"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Marketplace
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Book Image */}
            <div className="relative">
              <img
                src={book.image}
                alt={book.title}
                className="w-full h-[500px] object-contain rounded-lg shadow-md"
              />
              {book.rating > 0 && (
                <div className="absolute top-4 right-4 bg-yellow-400 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                  <Star className="h-4 w-4 mr-1" />
                  {book.rating.toFixed(1)}
                </div>
              )}
            </div>

            {/* Book Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
                <p className="text-xl text-gray-600">by {book.authors.join(', ')}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {book.categories.map((category, index) => (
                  <span
                    key={index}
                    className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {category}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Publisher</div>
                  <div className="font-medium">{book.publisher || 'Unknown'}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Published Date</div>
                  <div className="font-medium">{book.publishedDate || 'Unknown'}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Pages</div>
                  <div className="font-medium">{book.pageCount || 'Unknown'}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Language</div>
                  <div className="font-medium">{book.language?.toUpperCase() || 'Unknown'}</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-teal-600">
                  {typeof book.price === 'number'
                    ? `${book.currency} ${book.price.toFixed(2)}`
                    : book.price}
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setIsInWishlist(!isInWishlist)}
                    className={`p-3 rounded-full transition-colors duration-300 ${
                      isInWishlist
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Heart className="h-6 w-6" fill={isInWishlist ? 'currentColor' : 'none'} />
                  </button>
                  <button className="p-3 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors duration-300">
                    <Share2 className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className={`flex-1 bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition-colors duration-300 flex items-center justify-center gap-2 ${
                    isAddingToCart ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
                {book.previewLink && (
                  <a
                    href={book.previewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-white border border-teal-600 text-teal-600 py-3 rounded-lg hover:bg-teal-50 transition-colors duration-300 flex items-center justify-center gap-2"
                  >
                    <BookOpen className="h-5 w-5" />
                    Preview Book
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-gray-200">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'description'
                    ? 'border-b-2 border-teal-600 text-teal-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'details'
                    ? 'border-b-2 border-teal-600 text-teal-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Additional Details
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'description' ? (
                <div className="prose max-w-none">
                  <div 
                    className="text-gray-600 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: book.description }}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm text-gray-500">ISBN</div>
                    <div className="font-medium">{book.isbn || 'Not available'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Maturity Rating</div>
                    <div className="font-medium">{book.maturityRating || 'Not available'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Language</div>
                    <div className="font-medium">{book.language?.toUpperCase() || 'Unknown'}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Books */}
        {relatedBooks.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Books</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedBooks.map((relatedBook) => (
                <div
                  key={relatedBook.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                  onClick={() => navigate(`/book/${relatedBook.id}`)}
                >
                  <img
                    src={relatedBook.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/128x192?text=No+Image'}
                    alt={relatedBook.volumeInfo.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-medium line-clamp-2">{relatedBook.volumeInfo.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {relatedBook.volumeInfo.authors?.[0] || 'Unknown Author'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage; 