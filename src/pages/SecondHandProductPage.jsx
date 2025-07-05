import { ChevronLeft, Heart, MapPin, MessageCircle, Share2, ShoppingCart, Star, Tag, User } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cartAPI } from '../services/api';

const SecondHandProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [message, setMessage] = useState('');

  // Mock data - In a real app, this would come from an API
  const book = {
    id: 'sh1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    condition: 'Like New',
    price: 12.99,
    currency: 'USD',
    listingType: 'sale',
    location: 'New York, NY',
    seller: 'John Doe',
    sellerId: 'user1',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500',
    description: 'Hardcover edition in excellent condition. No marks or highlights. This is a first edition copy of the classic novel by F. Scott Fitzgerald. The book has been well-maintained and shows minimal signs of wear.',
    postedDate: '2024-03-15',
    category: 'Fiction',
    status: 'available',
    interestedBuyers: ['user2', 'user3'],
    messages: [
      {
        id: 'msg1',
        senderId: 'user2',
        senderName: 'Alice Smith',
        message: 'Is this book still available?',
        timestamp: '2024-03-16T10:30:00',
      },
    ],
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    // Implement message sending functionality
    console.log('Sending message:', message);
    setMessage('');
    setShowMessageForm(false);
  };

  const handleMarkAsSold = () => {
    // Implement mark as sold functionality
    console.log('Marking book as sold');
  };

  const handleAddToCart = async () => {
    try {
      if (!book?.id) {
        throw new Error('Book ID is required');
      }
      
      // Ensure we're sending a string ID
      const bookId = String(book.id);
      
      const response = await cartAPI.addToCart(bookId, 'secondhand');
      if (response.data) {
        alert('Book added to cart successfully!');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.response?.status === 401) {
        alert('Please login to add items to cart');
        navigate('/login');
      } else {
        alert(error.message || error.response?.data?.message || 'Failed to add book to cart');
      }
    }
  };

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
              <div className="absolute top-4 left-4 bg-teal-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {book.listingType === 'rent' ? 'For Rent' : 'For Sale'}
              </div>
              <div className="absolute bottom-4 left-4 bg-gray-800/75 text-white px-3 py-1 rounded-full text-sm font-medium">
                {book.condition}
              </div>
            </div>

            {/* Book Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
                <p className="text-xl text-gray-600">by {book.author}</p>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{book.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{book.seller}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>{book.messages.length} message{book.messages.length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Book Condition</h3>
                <p className="text-gray-600">{book.description}</p>
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
                {book.status === 'available' && (
                  <>
                    <button
                      onClick={() => setShowMessageForm(true)}
                      className="flex-1 bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition-colors duration-300 flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="h-5 w-5" />
                      Contact Seller
                    </button>
                    <button 
                      onClick={handleAddToCart}
                      className="flex-1 bg-white border border-teal-600 text-teal-600 py-3 rounded-lg hover:bg-teal-50 transition-colors duration-300 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      Add to Cart
                    </button>
                  </>
                )}
                {book.sellerId === 'currentUser' && book.status === 'available' && (
                  <button
                    onClick={handleMarkAsSold}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors duration-300 flex items-center justify-center gap-2"
                  >
                    <Tag className="h-5 w-5" />
                    Mark as Sold
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Message Form Modal */}
          {showMessageForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 max-w-lg w-full">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Contact Seller</h2>
                  <button
                    onClick={() => setShowMessageForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      required
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write your message to the seller..."
                    />
                  </div>
                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setShowMessageForm(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                    >
                      Send Message
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Messages Section */}
          <div className="border-t border-gray-200 p-8">
            <h2 className="text-2xl font-bold mb-6">Messages</h2>
            <div className="space-y-4">
              {book.messages.map((msg) => (
                <div key={msg.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">{msg.senderName}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(msg.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-gray-600">{msg.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecondHandProductPage; 