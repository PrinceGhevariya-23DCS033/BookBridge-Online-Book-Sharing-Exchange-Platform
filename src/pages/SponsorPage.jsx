import {
    AlertCircle,
    BookOpen,
    CheckCircle2,
    ChevronLeft,
    Clock,
    Filter,
    Mail,
    MapPin,
    Search,
    User,
    X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import requestAPI from '../services/requestAPI';

const DEFAULT_BOOK_COVER = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000&auto=format&fit=crop';

const SponsorPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [actionLoading, setActionLoading] = useState({}); // Track loading state for individual actions
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);
  
  const fetchBookCover = async (isbn) => {
    try {
      if (!isbn) return DEFAULT_BOOK_COVER;
      
      // Use OpenLibrary API (same as request page) for consistency
      const cleanISBN = isbn.replace(/[-\s]/g, '');
      
      // Try OpenLibrary first
      const openLibraryResponse = await fetch(`https://covers.openlibrary.org/b/isbn/${cleanISBN}-L.jpg`);
      if (openLibraryResponse.ok && openLibraryResponse.status !== 404) {
        return `https://covers.openlibrary.org/b/isbn/${cleanISBN}-L.jpg`;
      }
      
      // Fallback to Google Books API
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanISBN}`);
      const data = await response.json();
      
      if (data.items && data.items[0]?.volumeInfo?.imageLinks?.thumbnail) {
        return data.items[0].volumeInfo.imageLinks.thumbnail;
      }
      
      // Return default book cover if no image found
      return DEFAULT_BOOK_COVER;
    } catch (error) {
      console.error('Error fetching book cover:', error);
      return DEFAULT_BOOK_COVER;
    }
  };
  
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching sponsor requests...');
      
      const data = await requestAPI.getSponsorRequests();
      console.log('Received data from API:', data);
      
      if (!Array.isArray(data)) {
        console.error('Received non-array data:', data);
        setError('Invalid data received from server');
        return;
      }
      
      // Fetch cover images for each request
      const requestsWithCovers = await Promise.all(
        data.map(async (request) => {
          const coverImage = await fetchBookCover(request.isbn);
          return {
            ...request,
            coverImage
          };
        })
      );
      
      console.log('Requests with covers:', requestsWithCovers.length);
      setRequests(requestsWithCovers);
    } catch (err) {
      console.error('Error fetching requests:', err);
      
      if (err.response?.status === 401) {
        setError('Authentication required. Please log in to view sponsor requests.');
      } else if (err.response?.status === 403) {
        setError('Access denied. You must be a sponsor to view these requests.');
      } else {
        setError(err.response?.data?.message || 'Failed to load book requests. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.isbn.includes(searchTerm) ||
      request.genre.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || request.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  const handleApprove = async (id) => {
    try {
      setActionLoading(prev => ({ ...prev, [id]: 'approving' }));
      console.log('Approving request:', id);
      
      await requestAPI.updateSponsorRequestStatus(id, 'approved');
      console.log('Request approved successfully');
      
      // Update the request status locally for immediate feedback
      setRequests(prev => prev.map(request => 
        request._id === id ? { ...request, status: 'approved' } : request
      ));
      
      // Also refresh the list to ensure data consistency
      setTimeout(() => fetchRequests(), 500);
    } catch (err) {
      console.error('Error approving request:', err);
      
      // Show more specific error messages
      if (err.response?.status === 401) {
        setError('Authentication required. Please log in again.');
      } else if (err.response?.status === 404) {
        setError('Request not found. It may have been deleted.');
      } else {
        setError(err.response?.data?.message || 'Failed to approve request. Please try again.');
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleReject = async (id) => {
    try {
      setActionLoading(prev => ({ ...prev, [id]: 'rejecting' }));
      console.log('Rejecting request:', id);
      
      await requestAPI.updateSponsorRequestStatus(id, 'rejected');
      console.log('Request rejected successfully');
      
      // Update the request status locally for immediate feedback
      setRequests(prev => prev.map(request => 
        request._id === id ? { ...request, status: 'rejected' } : request
      ));
      
      // Also refresh the list to ensure data consistency
      setTimeout(() => fetchRequests(), 500);
    } catch (err) {
      console.error('Error rejecting request:', err);
      
      // Show more specific error messages
      if (err.response?.status === 401) {
        setError('Authentication required. Please log in again.');
      } else if (err.response?.status === 404) {
        setError('Request not found. It may have been deleted.');
      } else {
        setError(err.response?.data?.message || 'Failed to reject request. Please try again.');
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const maskAddress = (address) => {
    if (!address) return 'Address not provided';
    
    const { street, city, state, postalCode, country } = address;
    // Only show first few characters of street and last few of postal code
    const maskedStreet = street ? `${street.substring(0, 3)}...${street.substring(street.length - 3)}` : '';
    const maskedPostal = postalCode ? `...${postalCode.substring(postalCode.length - 3)}` : '';
    
    return `${maskedStreet}, ${city}, ${state} ${maskedPostal}, ${country}`;
  };

  const showFullAddress = (address) => {
    if (!address) return 'Address not provided';
    const { street, city, state, postalCode, country } = address;
    return `${street}, ${city}, ${state} ${postalCode}, ${country}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-sm">
          {error}
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-teal-600 transition-colors duration-300"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Student Book Requests</h1>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span className="block sm:inline">{error}</span>
              <button
                onClick={() => setError(null)}
                className="absolute top-0 bottom-0 right-0 px-4 py-3"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by title, author, ISBN, or genre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-600">There are no pending book requests from students at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredRequests.map((request) => (
              <div key={request._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                {/* Status and Priority Badges */}
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${getStatusColor(request.status)}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${getUrgencyColor(request.urgency)}`}>
                    {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                  </span>
                </div>

                {/* Book Cover and Info */}
                <div className="relative">
                  <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                    {request.coverImage && request.coverImage !== DEFAULT_BOOK_COVER ? (
                      <img
                        src={request.coverImage}
                        alt={request.title}
                        className="w-full h-full object-contain p-4"
                        onError={(e) => {
                          console.log('Image failed to load:', request.coverImage);
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.parentNode.innerHTML = `
                            <div class="flex flex-col items-center justify-center h-full text-gray-400">
                              <svg class="w-16 h-16 mb-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                              </svg>
                              <span class="text-sm font-medium">${request.title}</span>
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <BookOpen className="w-16 h-16 mb-2" />
                        <span className="text-sm font-medium text-center px-4">{request.title}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Book Details */}
                <div className="p-6">
                  {/* Title and Author */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-2 leading-tight">
                      {request.title || 'Untitled Book'}
                    </h3>
                    <p className="text-gray-600 font-medium">
                      by {request.author || 'Unknown Author'}
                    </p>
                  </div>

                  {/* Book Information Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-teal-500 flex-shrink-0" />
                        <span className="text-gray-600 truncate">ISBN: {request.isbn || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-purple-500 flex-shrink-0" />
                        <span className="text-gray-600 truncate">{request.genre || 'No Genre'}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <span className="text-gray-600 text-xs">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 text-xs">
                          Qty: {request.quantity || 1}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Reason */}
                  {request.reason && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-1">Request Reason:</p>
                          <p className="text-sm text-gray-600 line-clamp-3">{request.reason}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Requester Information */}
                  <div className="border-t pt-4 mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Student Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600">{request.requester?.name || 'Unknown Student'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <span className="text-gray-600 truncate">{request.requester?.email || 'No email'}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <div className="group relative">
                          <span className="text-gray-600 cursor-help text-xs">
                            {maskAddress(request.address)}
                          </span>
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-black text-white p-2 rounded shadow-lg text-xs z-20 min-w-max">
                            <p>Full address:</p>
                            <p className="font-medium">{showFullAddress(request.address)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {request.status === 'pending' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(request._id)}
                        disabled={actionLoading[request._id]}
                        className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 py-3 rounded-lg hover:from-teal-600 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-md"
                      >
                        {actionLoading[request._id] === 'approving' ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Approving...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            Approve
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(request._id)}
                        disabled={actionLoading[request._id]}
                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-lg hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-md"
                      >
                        {actionLoading[request._id] === 'rejecting' ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Rejecting...
                          </>
                        ) : (
                          <>
                            <X className="h-4 w-4" />
                            Reject
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Status Message for Non-Pending Requests */}
                  {request.status !== 'pending' && (
                    <div className={`text-center py-2 rounded-lg font-semibold ${
                      request.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      Request {request.status === 'approved' ? 'Approved' : 'Rejected'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SponsorPage;