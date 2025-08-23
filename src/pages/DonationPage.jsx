import { AlertCircle, Search, Upload } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { booksAPI, donationAPI, userAPI } from '../services/api';

function DonationPage() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isbnLoading, setIsbnLoading] = useState(false);
  const [searchType, setSearchType] = useState('title');
  const [formData, setFormData] = useState({
    bookId: '',
    title: '',
    author: '',
    isbn: '',
    genre: '',
    quantity: 1,
    condition: 'good',
    description: '',
    images: [],
    donationType: 'physical',
    contactEmail: '',
    contactPhone: '',
    contactAddress: ''
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await booksAPI.getBooks();
        if (response && response.data) {
          setBooks(response.data);
        } else {
          setError('No books data received. Please try again.');
        }
      } catch (err) {
        console.error('Error fetching books:', err);
        setError(err.response?.data?.message || 'Failed to fetch books. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await userAPI.getProfile();
        if (response.data) {
          const user = response.data;
          setFormData(prev => ({
            ...prev,
            contactEmail: user.email || '',
            contactPhone: user.phone || '',
            contactAddress: user.location || ''
          }));
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        // Don't show error for profile fetch failure, just continue without pre-population
      }
    };
    fetchUserProfile();
  }, []);

  const fetchBookDetailsByISBN = async (isbn) => {
    setIsbnLoading(true);
    setError('');
    
    try {
      const cleanISBN = isbn.replace(/[-\s]/g, '');
      const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanISBN}&format=json&jscmd=data`);
      const data = await response.json();
      
      if (Object.keys(data).length > 0) {
        const bookData = data[`ISBN:${cleanISBN}`];
        
        const newBook = {
          title: bookData.title || '',
          author: bookData.authors?.[0]?.name || '',
          genre: bookData.subjects?.[0] || 'Other',
          isbn: cleanISBN,
          description: bookData.description?.value || bookData.description || '',
          condition: 'good',
          type: 'donated',
          status: 'available',
          isAvailable: true,
          marketplaceStatus: 'active'
        };

        setFormData(prev => ({
          ...prev,
          ...newBook,
          bookId: 'new'
        }));

        if (bookData.cover?.large) {
          const imageResponse = await fetch(bookData.cover.large);
          const imageBlob = await imageResponse.blob();
          const imageFile = new File([imageBlob], `book-cover-${cleanISBN}.jpg`, { type: 'image/jpeg' });
          
          setFormData(prev => ({
            ...prev,
            images: [imageFile]
          }));
        }
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

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchType === 'isbn' && searchQuery) {
      await fetchBookDetailsByISBN(searchQuery);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setError('You can only upload up to 5 images');
      return;
    }
    setFormData(prev => ({
      ...prev,
      images: files
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.bookId === 'new' && formData.images.length === 0) {
      setError('Please upload at least one image of the book');
      setLoading(false);
      return;
    }

    try {
      // Create FormData object
      const submitData = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'images') {
          // Add each image file
          formData.images.forEach(image => {
            submitData.append('images', image);
          });
        } else {
          submitData.append(key, formData[key]);
        }
      });

      const response = await donationAPI.createDonation(submitData);
      console.log('Donation created:', response.data);
      setSuccess(true);
      setTimeout(() => {
        navigate('/', { state: { message: 'Donation submitted successfully!' } });
      }, 2000);
    } catch (err) {
      console.error('Donation error:', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Error creating donation');
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10">
                <h1 className="text-3xl font-serif font-bold text-gray-800 mb-4">Donate a Book</h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
              Your donated books will help students who cannot afford them. Choose between donating a physical book or sponsoring a book purchase.
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Donation Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`flex items-center p-4 border rounded-md cursor-pointer transition-colors ${
                      formData.donationType === 'physical' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="donationType"
                        value="physical"
                        checked={formData.donationType === 'physical'}
                        onChange={handleChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="ml-3">
                        <span className="block text-sm font-medium text-gray-900">Physical Book</span>
                        <span className="block text-xs text-gray-500">Donate a book you own</span>
                      </div>
                    </label>

                    <label className={`flex items-center p-4 border rounded-md cursor-pointer transition-colors ${
                      formData.donationType === 'sponsorship' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="donationType"
                        value="sponsorship"
                        checked={formData.donationType === 'sponsorship'}
                        onChange={handleChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="ml-3">
                        <span className="block text-sm font-medium text-gray-900">Book Sponsorship</span>
                        <span className="block text-xs text-gray-500">Sponsor a book purchase</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setSearchType('title')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      searchType === 'title'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Search by Title
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchType('isbn')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      searchType === 'isbn'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Search by ISBN
                  </button>
                </div>

                <div className="relative">
                  <div className="flex items-center">
                    <Search className="h-5 w-5 text-gray-400 absolute left-3" />
                    <input
                      type="text"
                      placeholder={searchType === 'isbn' ? "Enter ISBN number..." : "Search for a book..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {searchType === 'isbn' && (
                      <button
                        type="button"
                        onClick={handleSearch}
                        className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        {isbnLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          'Search'
                        )}
                      </button>
                    )}
                  </div>

                  {searchType === 'title' && searchQuery && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                      {loading ? (
                        <div className="px-4 py-2 text-gray-500">Loading books...</div>
                      ) : filteredBooks.length > 0 ? (
                        filteredBooks.map(book => (
                          <button
                            key={book._id}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                bookId: book._id,
                                title: book.title,
                                author: book.author,
                                isbn: book.isbn,
                                genre: book.genre
                              }));
                              setSearchQuery('');
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                          >
                            <div className="font-medium">{book.title}</div>
                            <div className="text-sm text-gray-500">by {book.author}</div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-2">
                          <p className="text-gray-500 mb-2">No books found</p>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                bookId: 'new',
                                title: searchQuery,
                                author: '',
                                isbn: '',
                                genre: ''
                              }));
                              setSearchQuery('');
                            }}
                            className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                          >
                            + Add new book: "{searchQuery}"
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {formData.bookId === 'new' ? (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium text-gray-900 mb-4">Add New Book Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Title*
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                        Author*
                      </label>
                      <input
                        type="text"
                        id="author"
                        name="author"
                        required
                        value={formData.author}
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="isbn" className="block text-sm font-medium text-gray-700">
                        ISBN
                      </label>
                      <input
                        type="text"
                        id="isbn"
                        name="isbn"
                        value={formData.isbn}
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                  </div>
                    <div>
                      <label htmlFor="genre" className="block text-sm font-medium text-gray-700">
                        Genre*
                      </label>
                      <select
                        id="genre"
                        name="genre"
                        required
                        value={formData.genre}
                        onChange={handleChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option value="">Select a genre</option>
                        <option value="Fiction">Fiction</option>
                        <option value="Non-fiction">Non-fiction</option>
                        <option value="Educational">Educational</option>
                        <option value="Textbook">Textbook</option>
                        <option value="Children's">Children's</option>
                        <option value="Young Adult">Young Adult</option>
                        <option value="Science Fiction">Science Fiction</option>
                        <option value="Fantasy">Fantasy</option>
                        <option value="Mystery">Mystery</option>
                        <option value="Romance">Romance</option>
                        <option value="Biography">Biography</option>
                        <option value="History">History</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : formData.bookId ? (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium text-gray-900 mb-2">Selected Book</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Title</p>
                      <p className="font-medium">{formData.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Author</p>
                      <p className="font-medium">{formData.author}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-yellow-400 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800">No book selected</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Please search by title or ISBN to select a book.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
                    Book Condition
                      </label>
                      <select
                        id="condition"
                        name="condition"
                        required
                        value={formData.condition}
                        onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="new">New</option>
                    <option value="like-new">Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                      </select>
                    </div>
                  </div>
                  
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                      </label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  required
                  value={formData.description}
                          onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Describe the condition of the book in detail..."
                />
                  </div>
                  
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Book Images (up to 5)
                    </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="images"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                      >
                        <span>Upload images</span>
                        <input
                          id="images"
                          name="images"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
                {formData.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-5 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="h-20 w-20 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== index)
                            }));
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
                
              {/* Contact Details Section */}
              <div className="bg-gray-50 p-6 rounded-md">
                <h3 className="font-medium text-gray-900 mb-4">Contact Details</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Provide your contact information so recipients can reach you if needed.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                      Email Address*
                    </label>
                    <input
                      type="email"
                      id="contactEmail"
                      name="contactEmail"
                      required
                      value={formData.contactEmail}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="contactPhone"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label htmlFor="contactAddress" className="block text-sm font-medium text-gray-700">
                    Address (for book pickup/delivery)
                  </label>
                  <textarea
                    id="contactAddress"
                    name="contactAddress"
                    rows="3"
                    value={formData.contactAddress}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Street address, city, state, zip code"
                  />
                </div>
              </div>

              <div>
                  <button
                  type="submit"
                  disabled={loading || !formData.bookId}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    loading || !formData.bookId
                      ? 'bg-indigo-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                  {loading ? 'Submitting...' : 'Submit Donation'}
                  </button>
              </div>
            </form>
            </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default DonationPage;