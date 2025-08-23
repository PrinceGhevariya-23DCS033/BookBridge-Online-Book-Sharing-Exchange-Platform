import { AlertCircle, BookOpen as BookOpenIcon, Check, CheckCircle2, MapPin } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { requestAPI } from '../services/api';

const GENRE_OPTIONS = [
  { value: '', label: 'Select a genre' },
  { value: 'Fiction', label: 'Fiction' },
  { value: 'Non-fiction', label: 'Non-fiction' },
  { value: 'Educational', label: 'Educational' },
  { value: 'Textbook', label: 'Textbook' },
  { value: 'Children\'s', label: 'Children\'s' },
  { value: 'Young Adult', label: 'Young Adult' },
  { value: 'Science Fiction', label: 'Science Fiction' },
  { value: 'Fantasy', label: 'Fantasy' },
  { value: 'Mystery', label: 'Mystery' },
  { value: 'Romance', label: 'Romance' },
  { value: 'Biography', label: 'Biography' },
  { value: 'History', label: 'History' },
  { value: 'Poetry', label: 'Poetry' },
  { value: 'Drama', label: 'Drama' },
  { value: 'Comics', label: 'Comics' },
  { value: 'Art', label: 'Art' },
  { value: 'Music', label: 'Music' },
  { value: 'Sports', label: 'Sports' },
  { value: 'Technology', label: 'Technology' },
  { value: 'Science', label: 'Science' },
  { value: 'Mathematics', label: 'Mathematics' },
  { value: 'Philosophy', label: 'Philosophy' },
  { value: 'Religion', label: 'Religion' },
  { value: 'Self-help', label: 'Self-help' },
  { value: 'Business', label: 'Business' },
  { value: 'Economics', label: 'Economics' },
  { value: 'Politics', label: 'Politics' },
  { value: 'Law', label: 'Law' },
  { value: 'Medicine', label: 'Medicine' },
  { value: 'Other', label: 'Other' }
];

const RequestPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isbnLoading, setIsbnLoading] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [titleLoading, setTitleLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Initialize all form fields with empty strings or null
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    genre: '',
    description: '',
    reason: '',
    urgency: 'medium',
    documents: [],
    quantity: 1,
    coverImage: null,
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    }
  });
  
  const [submitted, setSubmitted] = useState(false);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.suggestions-container')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchBookDetailsByISBN = async (isbn) => {
    setIsbnLoading(true);
    setError('');
    
    try {
      const cleanISBN = isbn.replace(/[-\s]/g, '');
      
      // Use OpenLibrary API (same as donation page) for consistency
      const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanISBN}&format=json&jscmd=data`);
      const data = await response.json();
      
      if (Object.keys(data).length > 0) {
        const bookData = data[`ISBN:${cleanISBN}`];
        
        // Fetch cover image if available
        let coverImage = null;
        if (bookData.cover?.large) {
          try {
            const imageResponse = await fetch(bookData.cover.large);
            const imageBlob = await imageResponse.blob();
            coverImage = new File([imageBlob], `book-cover-${cleanISBN}.jpg`, { type: 'image/jpeg' });
            setCoverPreview(URL.createObjectURL(coverImage));
          } catch (err) {
            console.error('Error fetching cover image:', err);
          }
        }

        setFormData(prev => ({
          ...prev,
          title: bookData.title || prev.title,
          author: bookData.authors?.[0]?.name || prev.author,
          genre: bookData.subjects?.[0] || prev.genre,
          isbn: cleanISBN,
          description: bookData.description?.value || bookData.description || prev.description,
          coverImage: coverImage || prev.coverImage
        }));
        
        // Hide any existing suggestions when auto-filling
        setTitleSuggestions([]);
        setShowSuggestions(false);
      } else {
        setError('No book found with this ISBN. Please enter the details manually.');
      }
    } catch (err) {
      console.error('Error fetching book details:', err);
      setError('Failed to fetch book details. Please enter the details manually.');
    } finally {
      setIsbnLoading(false);
    }
  };

  const handleISBNChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, isbn: value }));
    
    // Clear any previous errors
    setError('');
    
    // If ISBN is valid (10 or 13 digits), automatically fetch book details
    const cleanISBN = value.replace(/[-\s]/g, '');
    if (cleanISBN.length === 10 || cleanISBN.length === 13) {
      console.log('Valid ISBN detected, fetching book details...');
      fetchBookDetailsByISBN(value);
    }
  };

  const searchBooksByTitle = async (query) => {
    if (query.length < 2) {
      setTitleSuggestions([]);
      return;
    }

    setTitleLoading(true);
    try {
      // Use OpenLibrary API for consistent results with donation page
      const response = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(query)}&limit=8`);
      const data = await response.json();
      
      if (data.docs && data.docs.length > 0) {
        const suggestions = data.docs.map(book => {
          // Get the first available ISBN from any of the possible fields
          const isbn = book.isbn?.[0] || book.isbn_13?.[0] || book.isbn_10?.[0] || '';
          
          return {
            title: book.title,
            author: book.author_name?.[0] || 'Unknown Author',
            isbn: isbn,
            genre: book.subject?.[0] || '',
            description: book.first_sentence?.[0] || '',
            key: book.key,
            coverId: book.cover_i,
            source: 'openlibrary',
            publishYear: book.first_publish_year || '',
            language: book.language?.[0] || 'en'
          };
        });
        
        console.log('Search suggestions:', suggestions);
        setTitleSuggestions(suggestions);
      } else {
        setTitleSuggestions([]);
      }
    } catch (err) {
      console.error('Error fetching book suggestions:', err);
      setTitleSuggestions([]);
    } finally {
      setTitleLoading(false);
    }
  };

  const fetchBookDetails = async (bookKey) => {
    try {
      const response = await fetch(`https://openlibrary.org${bookKey}.json`);
      const data = await response.json();
      
      // After getting the work details, fetch the edition details
      if (data.key) {
        const editionsResponse = await fetch(`https://openlibrary.org${data.key}/editions.json`);
        const editionsData = await editionsResponse.json();
        
        // Get the first edition that has an ISBN
        const editionWithISBN = editionsData.entries?.find(edition => 
          edition.isbn_13?.[0] || edition.isbn_10?.[0]
        );
        
        if (editionWithISBN) {
          return {
            ...data,
            isbn_13: editionWithISBN.isbn_13,
            isbn_10: editionWithISBN.isbn_10
          };
        }
      }
      
      return data;
    } catch (err) {
      console.error('Error fetching book details:', err);
      return null;
    }
  };

  const handleTitleChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, title: value }));
    
    // Clear any previous errors
    setError('');
    
    // Show suggestions as user types (reduced threshold to 2 characters)
    if (value.length >= 2) {
      searchBooksByTitle(value);
      setShowSuggestions(true);
    } else {
      setTitleSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = async (suggestion) => {
    setTitleLoading(true);
    try {
      console.log('Selected suggestion:', suggestion);

      // Update the form with available data immediately
      setFormData(prev => ({
        ...prev,
        title: suggestion.title,
        author: suggestion.author,
        genre: suggestion.genre,
        description: suggestion.description,
        isbn: suggestion.isbn || prev.isbn
      }));

      // Fetch cover image if available
      if (suggestion.coverId) {
        try {
          const imageUrl = `https://covers.openlibrary.org/b/id/${suggestion.coverId}-L.jpg`;
          const imageResponse = await fetch(imageUrl);
          
          if (imageResponse.ok) {
            const imageBlob = await imageResponse.blob();
            const coverImage = new File([imageBlob], `book-cover-${suggestion.title}.jpg`, { type: 'image/jpeg' });
            setFormData(prev => ({ ...prev, coverImage }));
            setCoverPreview(URL.createObjectURL(coverImage));
          }
        } catch (err) {
          console.error('Error fetching cover image:', err);
        }
      }

      // If we have ISBN, fetch additional details to ensure we have complete information
      if (suggestion.isbn) {
        console.log('Fetching additional details for ISBN:', suggestion.isbn);
        await fetchBookDetailsByISBN(suggestion.isbn);
      } else if (suggestion.key) {
        // Try to get more details from the book's work page
        try {
          const bookDetails = await fetchBookDetails(suggestion.key);
          console.log('Book details:', bookDetails);
          
          // Try to get ISBN from editions
          let isbn = null;
          if (bookDetails?.isbn_13?.[0]) {
            isbn = bookDetails.isbn_13[0];
          } else if (bookDetails?.isbn_10?.[0]) {
            isbn = bookDetails.isbn_10[0];
          }

          if (isbn) {
            console.log('Found ISBN from book details:', isbn);
            setFormData(prev => ({ ...prev, isbn }));
            // Get additional details using ISBN
            await fetchBookDetailsByISBN(isbn);
          } else {
            console.log('No ISBN found for this book');
          }
        } catch (err) {
          console.error('Error fetching additional book details:', err);
        }
      }

    } catch (err) {
      console.error('Error in handleSuggestionClick:', err);
      setError('Error fetching book details. Please try again.');
    } finally {
      setTitleLoading(false);
      setTitleSuggestions([]);
      setShowSuggestions(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      if (file) {
        setFormData(prev => ({
          ...prev,
          [name]: file
        }));
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setCoverPreview(previewUrl);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleDocumentChange = (e) => {
    setFormData(prev => ({
      ...prev,
      documents: Array.from(e.target.files)
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    // Validate address fields
    if (!formData.address.street || !formData.address.city || 
        !formData.address.state || !formData.address.postalCode || 
        !formData.address.country) {
      setError('Please fill in all address fields');
      return;
    }

    try {
      setLoading(true);
      await requestAPI.createRequest(formData);
      setSuccess(true);
      setFormData({
        title: '',
        author: '',
        isbn: '',
        genre: '',
        description: '',
        reason: '',
        urgency: 'medium',
        documents: [],
        quantity: 1,
        coverImage: null,
        address: {
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: ''
        }
      });
    } catch (err) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      genre: '',
      description: '',
      reason: '',
      urgency: 'medium',
      documents: [],
      quantity: 1,
      coverImage: null,
      address: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: ''
      }
    });
    setSubmitted(false);
  };
  
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {!submitted ? (
            <>
              <div className="text-center mb-10">
                <h1 className="text-3xl font-serif font-bold text-gray-800 mb-4">Request a Book</h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Can't find the book you're looking for? Request it here and our community will help you find it.
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-8">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      <span className="block sm:inline">{error}</span>
                    </div>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Book Details Section */}
                  <div className="space-y-6">
                    <h2 className="text-lg font-medium text-gray-900">Book Details</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative suggestions-container">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Book Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.title}
                          onChange={handleTitleChange}
                          onFocus={() => setShowSuggestions(true)}
                          placeholder="Start typing to search for books..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                        {titleLoading && (
                          <div className="absolute right-3 top-9">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
                          </div>
                        )}
                        
                        {/* Suggestions Dropdown */}
                        {showSuggestions && titleSuggestions.length > 0 && (
                          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {titleSuggestions.map((suggestion, index) => (
                              <div
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              >
                                <div className="flex items-start space-x-3">
                                  {suggestion.coverId && (
                                    <img
                                      src={`https://covers.openlibrary.org/b/id/${suggestion.coverId}-S.jpg`}
                                      alt="Book cover"
                                      className="w-8 h-10 object-cover rounded flex-shrink-0"
                                      onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {suggestion.title}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      by {suggestion.author}
                                    </p>
                                    {suggestion.publishYear && (
                                      <p className="text-xs text-gray-400">
                                        Published: {suggestion.publishYear}
                                      </p>
                                    )}
                                    {suggestion.isbn && (
                                      <p className="text-xs text-gray-400">
                                        ISBN: {suggestion.isbn}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Author *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.author}
                          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ISBN *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.isbn}
                          onChange={handleISBNChange}
                          placeholder="Enter 10 or 13 digit ISBN"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                        {isbnLoading && (
                          <div className="absolute right-3 top-9">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Auto-fills title, author, and genre when valid ISBN is entered
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Genre *
                        </label>
                        <select
                          required
                          value={formData.genre}
                          onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        >
                          {GENRE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reason for Request *
                      </label>
                      <textarea
                        required
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Urgency Level *
                      </label>
                      <select
                        required
                        value={formData.urgency}
                        onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  {/* Delivery Address Section */}
                  <div className="border-t border-gray-200 pt-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      Delivery Address
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.address.street}
                          onChange={(e) => setFormData({
                            ...formData,
                            address: { ...formData.address, street: e.target.value }
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="123 Main St"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.address.city}
                            onChange={(e) => setFormData({
                              ...formData,
                              address: { ...formData.address, city: e.target.value }
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="New York"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            State/Province *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.address.state}
                            onChange={(e) => setFormData({
                              ...formData,
                              address: { ...formData.address, state: e.target.value }
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="NY"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Postal Code *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.address.postalCode}
                            onChange={(e) => setFormData({
                              ...formData,
                              address: { ...formData.address, postalCode: e.target.value }
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="10001"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Country *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.address.country}
                            onChange={(e) => setFormData({
                              ...formData,
                              address: { ...formData.address, country: e.target.value }
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="United States"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors duration-200 disabled:opacity-50"
                    >
                      {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-teal-600 p-6 text-white">
                <div className="flex items-center mb-4">
                  <div className="bg-white rounded-full p-2">
                    <Check className="h-6 w-6 text-teal-600" />
                  </div>
                  <h2 className="ml-3 text-xl font-semibold">Request Submitted!</h2>
                </div>
                <p>Your book request has been submitted and added to our queue.</p>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Request Details:</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Book Title</p>
                    <p className="font-medium text-gray-800">{formData.title}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Author</p>
                    <p className="font-medium text-gray-800">{formData.author}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">ISBN</p>
                    <p className="font-medium text-gray-800">{formData.isbn}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Genre/Subject</p>
                    <p className="font-medium text-gray-800">{formData.genre}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-sm text-gray-500">Reason for Request</p>
                  <p className="font-medium text-gray-800">"{formData.reason}"</p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                  <div className="flex">
                    <BookOpenIcon className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">What happens next?</h4>
                      <p className="mt-1 text-sm text-blue-700">
                        Your request has been added to our queue and will be visible to potential donors. You'll receive a notification when someone offers to fulfill your request.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Make Another Request
                  </button>
                  
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Request Submitted Successfully!</h3>
            <p className="text-gray-600 mb-6">
              Your book request has been submitted. We'll notify you once it's reviewed.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setShowSuccessPopup(false);
                  navigate('/dashboard');
                }}
                className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors duration-200"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestPage;