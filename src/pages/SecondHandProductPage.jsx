import { ChevronLeft, Heart, MapPin, MessageCircle, Share2, ShoppingCart, Star, Tag, User } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cartAPI, marketplaceAPI } from '../services/api';

const SecondHandProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [message, setMessage] = useState('');
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const response = await marketplaceAPI.getListing(id);
      
      if (response.data) {
        const bookData = response.data;
        setBook({
          id: bookData._id,
          title: bookData.title,
          author: bookData.author,
          condition: bookData.condition,
          price: bookData.price,
          currency: 'USD',
          listingType: bookData.category === 'free' || bookData.category === 'donated' ? 'free' : 'sale',
          category: bookData.category,
          location: bookData.sellerContact?.address || bookData.owner?.location || 'Location not available',
          seller: bookData.owner?.name || 'Unknown Seller',
          sellerId: bookData.owner?._id,
          rating: 0,
          image: bookData.image?.startsWith('http') ? bookData.image : `http://localhost:5000${bookData.image}`,
          description: bookData.description,
          postedDate: bookData.createdAt,
          genre: bookData.genre,
          status: bookData.status,
          interestedBuyers: [],
          messages: []
        });
      }
    } catch (error) {
      console.error('Error fetching book details:', error);
      setError('Failed to fetch book details');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      const response = await marketplaceAPI.getContactDetails(id);
      const contactInfo = response.data;
      
      // Create email with the message
      const subject = encodeURIComponent(`Message about your book: ${book?.title}`);
      const body = encodeURIComponent(`Hi ${contactInfo.sellerName},\n\n${message}\n\nBest regards`);
      
      // Open email client
      window.open(`mailto:${contactInfo.email}?subject=${subject}&body=${body}`);
      
      // Show success message
      alert(`Your message will be sent to ${contactInfo.email}`);
      
      setMessage('');
      setShowMessageForm(false);
    } catch (error) {
      console.error('Error getting contact details:', error);
      if (error.response?.status === 401) {
        alert('Please login to contact the seller');
        navigate('/login');
      } else {
        alert('Failed to get contact details. Please try again.');
      }
    }
  };

  const handleContactSeller = async () => {
    try {
      const response = await marketplaceAPI.getContactDetails(id);
      const contactInfo = response.data;
      
      // Create a detailed contact information display
      const contactMessage = `
Contact Information for ${book?.title}:

Seller: ${contactInfo.sellerName}
Email: ${contactInfo.email}
Phone: ${contactInfo.phone || 'Not provided'}
Address: ${contactInfo.address || 'Not provided'}

Would you like to open your email client to contact them?
      `;
      
      if (confirm(contactMessage)) {
        // Open default email client
        const subject = encodeURIComponent(`Interested in your book: ${book?.title}`);
        const body = encodeURIComponent(`Hi ${contactInfo.sellerName},

I am interested in your book "${book?.title}". Please let me know if it is still available.

Best regards`);
        window.open(`mailto:${contactInfo.email}?subject=${subject}&body=${body}`);
      }
    } catch (error) {
      console.error('Error fetching contact details:', error);
      if (error.response?.status === 401) {
        alert('Please login to view contact details');
        navigate('/login');
      } else {
        alert('Failed to fetch contact details. Please try again.');
      }
    }
  };

  const handleGetContact = async () => {
    try {
      const response = await marketplaceAPI.getContactDetails(id);
      const contactInfo = response.data;
      
      // Create a better formatted contact information display for free books
      const contactMessage = `📚 Contact Information for FREE Book: "${book?.title}"

👤 Donor: ${contactInfo.sellerName}
📧 Email: ${contactInfo.email}
📞 Phone: ${contactInfo.phone || 'Not provided'}
📍 Address: ${contactInfo.address || 'Not provided'}

🎉 This book is available for free! Contact the donor to arrange pickup.

Would you like to open your email client to contact them?`;
      
      if (confirm(contactMessage)) {
        // Open default email client with better message for free books
        const subject = encodeURIComponent(`Interested in your free book: ${book?.title}`);
        const body = encodeURIComponent(`Hi ${contactInfo.sellerName},

I am interested in your free book "${book?.title}". Could we arrange a convenient time for pickup?

Thank you for your generosity in donating this book!

Best regards`);
        window.open(`mailto:${contactInfo.email}?subject=${subject}&body=${body}`);
      }
    } catch (error) {
      console.error('Error fetching contact details:', error);
      if (error.response?.status === 401) {
        alert('Please login to view contact details');
        navigate('/login');
      } else {
        alert('Failed to fetch contact details. Please try again.');
      }
    }
  };  const handleMarkAsSold = () => {
    // Implement mark as sold functionality
    console.log('Marking book as sold');
  };

  const handleAddToCart = async () => {
    try {
      if (!book?.id) {
        throw new Error('Book ID is required');
      }
      
      // For second-hand books, use the marketplace book ID
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Book not found</h3>
          <p className="text-gray-600 mb-4">{error || 'The book you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/marketplace')}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

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
                src={book.image || 'https://placehold.co/400x600/e2e8f0/1e293b?text=No+Image'}
                alt={book.title}
                className="w-full h-[500px] object-contain rounded-lg shadow-md"
                onError={(e) => {
                  e.target.src = 'https://placehold.co/400x600/e2e8f0/1e293b?text=No+Image';
                }}
              />
              {book.rating > 0 && (
                <div className="absolute top-4 right-4 bg-yellow-400 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                  <Star className="h-4 w-4 mr-1" />
                  {book.rating.toFixed(1)}
                </div>
              )}
              <div className="absolute top-4 left-4 bg-teal-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {book.listingType === 'free' ? 'Free/Donated' : book.listingType === 'rent' ? 'For Rent' : 'For Sale'}
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
                <p className="text-gray-600 font-medium capitalize">{book.condition}</p>
                {book.description && (
                  <div className="mt-3">
                    <h4 className="font-medium mb-1">Description</h4>
                    <div 
                      className="text-gray-600 text-sm prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: book.description }}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-teal-600">
                  {book.listingType === 'free' 
                    ? <span className="text-green-600">FREE</span>
                    : typeof book.price === 'number'
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
                    {book.listingType === 'free' ? (
                      // For donated books, only show "Get Contact Details"
                      <button 
                        onClick={handleGetContact}
                        className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors duration-300 flex items-center justify-center gap-2"
                      >
                        <User className="h-5 w-5" />
                        Get Contact Details
                      </button>
                    ) : (
                      // For regular books, show both contact and cart options
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