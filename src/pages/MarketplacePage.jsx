import { Bookmark, BookOpen, ChevronDown, Filter, Heart, MapPin, MessageCircle, Plus, Search, ShoppingCart, Tag, User, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI, marketplaceAPI } from '../services/api';

const API_KEY = 'AIzaSyAQXJAvdiEO-nuAxqhvj7aLVNmHU_SaNuY';
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

const MarketplacePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'secondhand'
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [showWishlist, setShowWishlist] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [selectedListingType, setSelectedListingType] = useState('all');
  const [showListBookForm, setShowListBookForm] = useState(false);
  const [newBookListing, setNewBookListing] = useState({
    title: '',
    author: '',
    genre: 'fiction',
    condition: 'good',
    price: '',
    listingType: 'sale',
    description: '',
    image: null,
    contactEmail: '',
    contactPhone: '',
    contactAddress: '',
  });
  const [googleSearch, setGoogleSearch] = useState('');
  const [googleResults, setGoogleResults] = useState([]);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const [secondHandBooks, setSecondHandBooks] = useState([]);

  const conditions = [
    { id: 'all', label: 'All Conditions' },
    { id: 'new', label: 'Like New' },
    { id: 'good', label: 'Good' },
    { id: 'fair', label: 'Fair' },
    { id: 'poor', label: 'Poor' },
  ];

  const listingTypes = [
    { id: 'all', label: 'All Listings' },
    { id: 'sale', label: 'For Sale' },
    { id: 'rent', label: 'For Rent' },
    { id: 'free', label: 'Free/Donated' },
  ];

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'fiction', label: 'Fiction' },
    { id: 'nonfiction', label: 'Non-Fiction' },
    { id: 'science', label: 'Science' },
    { id: 'technology', label: 'Technology' },
    { id: 'business', label: 'Business' },
  ];

  const languages = [
    { id: 'all', label: 'All Languages' },
    { id: 'en', label: 'English' },
    { id: 'es', label: 'Spanish' },
    { id: 'fr', label: 'French' },
    { id: 'de', label: 'German' },
  ];

  const fetchBooks = async (query = 'programming', page = 1) => {
    setLoading(true);
    setError('');
    
    try {
      if (activeTab === 'secondhand') {
        console.log('=== FETCHING SECOND-HAND BOOKS ===');
        // Fetch second-hand books from marketplace API
        const params = {};
        if (searchQuery) params.search = searchQuery;
        if (selectedCategory !== 'all') params.genre = selectedCategory;
        if (selectedCondition !== 'all') params.condition = selectedCondition;
        if (selectedListingType !== 'all') params.listingType = selectedListingType;
        if (priceRange.min) params.minPrice = priceRange.min;
        if (priceRange.max) params.maxPrice = priceRange.max;

        console.log('API params:', params);
        const response = await marketplaceAPI.getAllListings(params);
        console.log('Raw API response:', response.data);
        
        const marketplaceBooks = response.data.map((book, index) => {
          console.log(`Processing book ${index + 1}:`, {
            title: book.title,
            type: book.type,
            category: book.category,
            status: book.status,
            marketplaceStatus: book.marketplaceStatus,
            owner: book.owner?.name
          });
          
          return {
            id: book._id,
            title: book.title,
            author: book.author,
            condition: book.condition,
            price: book.type === 'donated' ? 0 : book.price, // Free for donated books
            currency: 'USD',
            listingType: book.type === 'donated' ? 'free' : 'sale', // Map from book.type
            category: book.category || (book.type === 'donated' ? 'free' : 'sale'), // Use category field
            isFree: book.type === 'donated' || book.category === 'free', // Flag for free books
            isDonated: book.type === 'donated', // Flag for donated books
            location: book.owner?.location || book.sellerContact?.address || 'Location not specified',
            seller: book.owner?.name || 'Unknown Seller',
            sellerId: book.owner?._id,
            rating: 0, // You might want to implement a rating system
            image: book.image?.startsWith('http') 
              ? book.image 
              : book.image 
                ? `http://localhost:5000${book.image}` 
                : 'https://placehold.co/300x400/e2e8f0/1e293b?text=No+Image',
            description: book.description,
            postedDate: book.createdAt,
            genreCategory: book.genre, // Keep genre separate from listing category
            status: book.status,
            categories: [book.genre, book.category].filter(Boolean) // Include both genre and category
          };
        });
        
        console.log('Processed marketplace books:', marketplaceBooks);
        console.log('Total books to display:', marketplaceBooks.length);
        
        setSecondHandBooks(marketplaceBooks);
        setBooks(marketplaceBooks);
        setTotalResults(marketplaceBooks.length);
        setLoading(false);
        return;
      }

      // For new books, use Google Books API
      const startIndex = (page - 1) * 20;
      const response = await fetch(
        `${BASE_URL}?q=${query}&key=${API_KEY}&maxResults=20&startIndex=${startIndex}`
      );
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      setTotalResults(data.totalItems || 0);
      const formattedBooks = data.items?.map(book => ({
        id: book.id,
        title: book.volumeInfo.title,
        authors: book.volumeInfo.authors || ['Unknown Author'],
        description: book.volumeInfo.description || 'No description available',
        image: book.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/128x192?text=No+Image',
        price: book.saleInfo?.listPrice?.amount || 'Price not available',
        currency: book.saleInfo?.listPrice?.currencyCode || 'USD',
        rating: book.volumeInfo.averageRating || 0,
        categories: book.volumeInfo.categories || ['Uncategorized'],
        publishedDate: book.volumeInfo.publishedDate,
        pageCount: book.volumeInfo.pageCount,
        language: book.volumeInfo.language,
        previewLink: book.volumeInfo.previewLink,
      })) || [];

      setBooks(formattedBooks);
    } catch (err) {
      setError('Failed to fetch books. Please try again later.');
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'secondhand') {
      fetchBooks();
    }
  }, [selectedCategory, selectedCondition, selectedListingType, priceRange]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCurrentPage(1);
      fetchBooks(searchQuery, 1);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    if (category !== 'all') {
      fetchBooks(category, 1);
    } else {
      fetchBooks('programming', 1);
    }
  };
  
  const toggleWishlist = (book) => {
    setWishlist(prev => {
      const exists = prev.find(b => b.id === book.id);
      if (exists) {
        return prev.filter(b => b.id !== book.id);
      }
      return [...prev, book];
    });
  };
  
  const isInWishlist = (bookId) => {
    return wishlist.some(book => book.id === bookId);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchBooks(searchQuery || 'programming', newPage);
  };

  const totalPages = Math.ceil(totalResults / 20);

  const handleBookClick = (bookId, isSecondHand = false) => {
    if (isSecondHand) {
      // For second-hand books, we'll navigate to a different route
      navigate(`/secondhand-book/${bookId}`);
    } else {
      // For new books, use the existing route
      navigate(`/book/${bookId}`);
    }
  };
  
  const handleListBook = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Create a FormData object for the listing
      const listingData = {
        title: newBookListing.title,
        author: newBookListing.author,
        genre: newBookListing.genre,
        condition: newBookListing.condition,
        price: parseFloat(newBookListing.price),
        description: newBookListing.description,
        contactEmail: newBookListing.contactEmail,
        contactPhone: newBookListing.contactPhone,
        contactAddress: newBookListing.contactAddress
      };

      // Handle image
      if (newBookListing.image) {
        // If image is a base64 string from Google Books or file upload
        listingData.image = newBookListing.image;
      }

      const response = await marketplaceAPI.createListing(listingData);
      
      if (response.data) {
        // Add the new book to the local state
        const newBook = {
          id: response.data._id,
          title: response.data.title,
          author: response.data.author,
          condition: response.data.condition,
          price: response.data.price,
          currency: 'USD',
          listingType: 'sale',
          location: response.data.owner?.location || 'Location not specified',
          seller: response.data.owner?.name || 'You',
          sellerId: response.data.owner?._id,
          rating: 0,
          image: response.data.image,
          description: response.data.description,
          postedDate: response.data.createdAt,
          category: response.data.genre,
          status: response.data.status,
          categories: [response.data.genre]
        };

        setSecondHandBooks([newBook, ...secondHandBooks]);
        setBooks([newBook, ...books]);
        
        setShowListBookForm(false);
        setNewBookListing({
          title: '',
          author: '',
          genre: 'fiction',
          condition: 'good',
          price: '',
          listingType: 'sale',
          description: '',
          image: null,
          contactEmail: '',
          contactPhone: '',
          contactAddress: '',
        });
        
        alert('Book listed successfully!');
      }
    } catch (error) {
      console.error('Error listing book:', error);
      setError(error.response?.data?.message || 'Failed to list book. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleContactSeller = async (bookId) => {
    try {
      const response = await marketplaceAPI.getContactDetails(bookId);
      const contactInfo = response.data;
      
      // Create a modal or alert with contact information
      const contactMessage = `
Seller Contact Information:
• Name: ${contactInfo.sellerName}
• Email: ${contactInfo.email}
• Phone: ${contactInfo.phone || 'Not provided'}
• Address: ${contactInfo.address || 'Not provided'}

You can reach out to the seller using the email address: ${contactInfo.email}
      `;
      
      alert(contactMessage);
      
      // Optionally, open default email client
      if (contactInfo.email) {
        const subject = encodeURIComponent('Interested in your book listing');
        const body = encodeURIComponent('Hi, I am interested in your book listing. Please let me know if it is still available.');
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

  const handleMarkAsSold = (bookId) => {
    setSecondHandBooks(books =>
      books.map(book =>
        book.id === bookId
          ? { ...book, status: 'sold' }
          : book
      )
    );
  };

  const handleAddToCart = async (book, e) => {
    e.stopPropagation();
    try {
      if (!book?.id) {
        throw new Error('Book ID is required');
      }
      
      // For free/donated books, handle differently
      if (book.isFree || book.isDonated || book.price === 0) {
        const response = await handleRequestDonatedBook(book);
        if (response) {
          alert('Book request sent successfully! You will be contacted by the donor.');
        }
        return;
      }
      
      // For second-hand books, use the marketplace book ID
      const bookId = String(book.id);
      
      const response = await cartAPI.addToCart(bookId, activeTab === 'secondhand' ? 'secondhand' : 'new');
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

  const handleRequestDonatedBook = async (book) => {
    try {
      // For now, we'll simulate a successful request
      // In a real application, you might want to:
      // 1. Send an email to the donor
      // 2. Create a request record in the database
      // 3. Show a contact form
      console.log('Requesting donated book:', book);
      return true; // Success
    } catch (error) {
      console.error('Error requesting donated book:', error);
      throw error;
    }
  };
  
  // Google Books API search for the List Book form
  const handleGoogleSearch = async (query) => {
    if (!query.trim()) {
      setGoogleResults([]);
      return;
    }
    setGoogleLoading(true);
    setGoogleError('');
    try {
      const response = await fetch(
        `${BASE_URL}?q=${encodeURIComponent(query)}&key=${API_KEY}&maxResults=5`
      );
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      setGoogleResults(
        (data.items || []).map((book) => ({
          id: book.id,
          title: book.volumeInfo.title,
          author: (book.volumeInfo.authors && book.volumeInfo.authors[0]) || '',
          image: book.volumeInfo.imageLinks?.thumbnail || '',
        }))
      );
    } catch (err) {
      setGoogleError('Failed to fetch suggestions.');
    } finally {
      setGoogleLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-400 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Book Marketplace</h1>
            <p className="text-xl mb-8">Discover and explore a world of books</p>
            
            {/* Marketplace Tabs */}
            <div className="flex justify-center space-x-4 mb-8">
              <button
                onClick={() => setActiveTab('new')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors duration-300 ${
                  activeTab === 'new'
                    ? 'bg-white text-teal-600'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                New Books
              </button>
              <button
                onClick={() => setActiveTab('secondhand')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors duration-300 ${
                  activeTab === 'secondhand'
                    ? 'bg-white text-teal-600'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Second-Hand Books
              </button>
            </div>

            <div className="flex justify-center space-x-4">
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">{totalResults}</div>
                <div className="text-sm">Books Available</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">{wishlist.length}</div>
                <div className="text-sm">Wishlist Items</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* List Your Book Button - Only show in second-hand tab */}
        {activeTab === 'secondhand' && (
          <div className="mb-8">
            <button
              onClick={() => setShowListBookForm(true)}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors duration-300 flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              List Your Book
            </button>
          </div>
        )}

        {/* List Book Form Modal */}
        {showListBookForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">List Your Book</h2>
                <button
                  onClick={() => setShowListBookForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleListBook} className="space-y-6">
                {/* Google Books Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Book (Google Books)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Type to search for book title..."
                    value={googleSearch}
                    onChange={e => {
                      setGoogleSearch(e.target.value);
                      handleGoogleSearch(e.target.value);
                    }}
                  />
                  {googleLoading && <div className="text-xs text-gray-500 mt-1">Searching...</div>}
                  {googleError && <div className="text-xs text-red-500 mt-1">{googleError}</div>}
                  {googleResults.length > 0 && (
                    <div className="border border-gray-200 rounded-lg mt-2 bg-white shadow-lg max-h-48 overflow-y-auto z-10 relative">
                      {googleResults.map(result => (
                        <div
                          key={result.id}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-teal-50 cursor-pointer"
                          onClick={() => {
                            setNewBookListing(prev => ({
                              ...prev,
                              title: result.title,
                              author: result.author,
                              image: result.image,
                            }));
                            setGoogleSearch(result.title);
                            setGoogleResults([]);
                          }}
                        >
                          {result.image && (
                            <img src={result.image} alt={result.title} className="w-8 h-12 object-cover rounded" />
                          )}
                          <div>
                            <div className="font-medium text-sm">{result.title}</div>
                            <div className="text-xs text-gray-500">{result.author}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Book Title
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={newBookListing.title}
                    onChange={(e) => setNewBookListing(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author
                  </label>
                <input
                  type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={newBookListing.author}
                    onChange={(e) => setNewBookListing(prev => ({ ...prev, author: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Genre
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={newBookListing.genre}
                    onChange={(e) => setNewBookListing(prev => ({ ...prev, genre: e.target.value }))}
                  >
                    {categories.filter(c => c.id !== 'all').map(category => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condition
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      value={newBookListing.condition}
                      onChange={(e) => setNewBookListing(prev => ({ ...prev, condition: e.target.value }))}
                    >
                      {conditions.filter(c => c.id !== 'all').map(condition => (
                        <option key={condition.id} value={condition.id}>
                          {condition.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Listing Type
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      value={newBookListing.listingType}
                      onChange={(e) => setNewBookListing(prev => ({ ...prev, listingType: e.target.value }))}
                    >
                      {listingTypes.filter(t => t.id !== 'all').map(type => (
                        <option key={type.id} value={type.id}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={newBookListing.price}
                    onChange={(e) => setNewBookListing(prev => ({ ...prev, price: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    required
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={newBookListing.description}
                    onChange={(e) => setNewBookListing(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                {/* Contact Information Section */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      value={newBookListing.contactEmail}
                      onChange={(e) => setNewBookListing(prev => ({ ...prev, contactEmail: e.target.value }))}
                      placeholder="Your email for buyers to contact you"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      value={newBookListing.contactPhone}
                      onChange={(e) => setNewBookListing(prev => ({ ...prev, contactPhone: e.target.value }))}
                      placeholder="Your phone number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address (Optional)
                    </label>
                    <textarea
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      value={newBookListing.contactAddress}
                      onChange={(e) => setNewBookListing(prev => ({ ...prev, contactAddress: e.target.value }))}
                      placeholder="Your address for local pickup (optional)"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Book Cover Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setNewBookListing(prev => ({ ...prev, image: reader.result }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
              </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowListBookForm(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                  >
                    List Book
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for books..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="relative">
                <select
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="relevance">Most Relevant</option>
                  <option value="newest">Newest</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
                <button
                type="button"
                  onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50"
                >
                <Filter className="h-4 w-4" />
                Filters
              </button>
              <button
                type="button"
                onClick={() => setShowWishlist(!showWishlist)}
                className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50"
              >
                <Bookmark className="h-4 w-4" />
                Wishlist ({wishlist.length})
              </button>
              <button
                type="submit"
                className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors duration-300"
              >
                Search
                </button>
              </div>
          </form>
            </div>
            
        {/* Advanced Filters */}
            {showFilters && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Advanced Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  />
                </div>
              </div>
              {activeTab === 'secondhand' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condition
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      value={selectedCondition}
                      onChange={(e) => setSelectedCondition(e.target.value)}
                    >
                      {conditions.map(condition => (
                        <option key={condition.id} value={condition.id}>
                          {condition.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Listing Type
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      value={selectedListingType}
                      onChange={(e) => setSelectedListingType(e.target.value)}
                    >
                      {listingTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
                  <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                    </label>
                    <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                >
                  {languages.map(lang => (
                    <option key={lang.id} value={lang.id}>
                      {lang.label}
                    </option>
                  ))}
                    </select>
                  </div>
                </div>
          </div>
        )}
                
        {/* Categories */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
                  <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-teal-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {category.label}
                  </button>
            ))}
                </div>
              </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                </div>
              )}

        {/* Book Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {books.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                onClick={() => handleBookClick(book.id, activeTab === 'secondhand')}
              >
                <div className="relative">
                      <img 
                        src={book.image} 
                        alt={book.title}
                    className="w-full h-64 object-cover"
                      />
                  {book.rating > 0 && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-white px-2 py-1 rounded-full text-sm font-medium">
                      ★ {book.rating.toFixed(1)}
                    </div>
                  )}
                  {activeTab === 'secondhand' && (
                    <>
                      <div className="absolute top-2 left-2 bg-teal-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                        {book.listingType === 'rent' ? 'For Rent' : 'For Sale'}
                          </div>
                      <div className="absolute bottom-2 left-2 bg-gray-800/75 text-white px-2 py-1 rounded-full text-sm font-medium">
                        {book.condition}
                        </div>
                      {book.status === 'sold' && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <span className="bg-red-500 text-white px-4 py-2 rounded-full text-lg font-medium">
                            Sold
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 line-clamp-2">{book.title}</h3>
                  <p className="text-gray-600 mb-2">{book.authors?.join(', ') || book.author}</p>
                  <p className="text-gray-700 mb-4 line-clamp-3">{book.description}</p>
                        
                  {activeTab === 'secondhand' && (
                    <>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <MapPin className="h-4 w-4" />
                        <span>{book.location}</span>
                        <span className="mx-2">•</span>
                        <User className="h-4 w-4" />
                        <span>{book.seller}</span>
                      </div>
                      {book.messages?.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                          <MessageCircle className="h-4 w-4" />
                          <span>{book.messages.length} message{book.messages.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {book.isDonated && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        DONATED
                      </span>
                    )}
                    {book.categories?.slice(0, 2).map((category, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs"
                      >
                        {category}
                      </span>
                    ))}
                      </div>
                      
                  <div className="flex justify-between items-center">
                    <div className="text-teal-600 font-semibold">
                      {book.isFree || book.isDonated || book.price === 0 
                        ? <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">FREE</span>
                        : (typeof book.price === 'number'
                          ? `${book.currency} ${book.price.toFixed(2)}`
                          : book.price)
                      }
                    </div>
                    <div className="flex gap-2">
                      {activeTab === 'secondhand' && book.status === 'available' && (
                        <>
                          <button
                            onClick={() => handleContactSeller(book.id)}
                            className="p-2 text-gray-600 hover:text-teal-600 transition-colors duration-300"
                          >
                            <MessageCircle className="h-5 w-5" />
                          </button>
                          {book.sellerId === 'currentUser' && (
                            <button
                              onClick={() => handleMarkAsSold(book.id)}
                              className="p-2 text-gray-600 hover:text-teal-600 transition-colors duration-300"
                            >
                              <Tag className="h-5 w-5" />
                            </button>
                          )}
                        </>
                      )}
                        <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(book);
                        }}
                        className={`p-2 transition-colors duration-300 ${
                          isInWishlist(book.id)
                            ? 'text-red-500 hover:text-red-600'
                            : 'text-gray-600 hover:text-teal-600'
                        }`}
                      >
                        <Heart className="h-5 w-5" fill={isInWishlist(book.id) ? 'currentColor' : 'none'} />
                        </button>
                      {book.status === 'available' && (
                        <button 
                          onClick={(e) => handleAddToCart(book, e)}
                          className={`p-2 transition-colors duration-300 ${
                            book.isFree || book.isDonated || book.price === 0
                              ? 'text-green-600 hover:text-green-700'
                              : 'text-gray-600 hover:text-teal-600'
                          }`}
                          title={book.isFree || book.isDonated || book.price === 0 ? 'Request this book' : 'Add to cart'}
                        >
                          {book.isFree || book.isDonated || book.price === 0 ? (
                            <MessageCircle className="h-5 w-5" />
                          ) : (
                            <ShoppingCart className="h-5 w-5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && books.length === 0 && (
                <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Wishlist Sidebar */}
        {showWishlist && (
          <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Your Wishlist</h3>
                <button
                  onClick={() => setShowWishlist(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {wishlist.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Your wishlist is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {wishlist.map((book) => (
                    <div key={book.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                      <img 
                        src={book.image} 
                        alt={book.title}
                        className="w-20 h-28 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium line-clamp-2">{book.title}</h4>
                        <p className="text-sm text-gray-600">{book.authors?.join(', ') || book.author}</p>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-teal-600 font-medium">
                            {book.isFree || book.isDonated || book.price === 0 
                              ? <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">FREE</span>
                              : (typeof book.price === 'number'
                                ? `${book.currency} ${book.price.toFixed(2)}`
                                : book.price)
                            }
                          </span>
                  <button
                            onClick={() => toggleWishlist(book)}
                            className="text-red-500 hover:text-red-600"
                  >
                            <Heart className="h-5 w-5" fill="currentColor" />
                  </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        </div>
    </div>
  );
};

export default MarketplacePage;