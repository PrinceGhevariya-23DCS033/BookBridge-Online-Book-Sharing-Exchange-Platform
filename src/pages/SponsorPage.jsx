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
import { requestAPI } from '../services/api';

const DEFAULT_BOOK_COVER = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000&auto=format&fit=crop';

const SponsorPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);
  
  const fetchBookCover = async (isbn) => {
    try {
      // Try Google Books API first
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
      const data = await response.json();
      
      if (data.items && data.items[0]?.volumeInfo?.imageLinks?.thumbnail) {
        return data.items[0].volumeInfo.imageLinks.thumbnail;
      }
      
      // If no cover found, try Open Library
      const openLibraryResponse = await fetch(`https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`);
      if (openLibraryResponse.ok) {
        return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
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
        data.map(async (request) => ({
          ...request,
          coverImage: await fetchBookCover(request.isbn)
        }))
      );
      
      setRequests(requestsWithCovers);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to load book requests. Please try again later.');
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
      await requestAPI.updateRequestStatus(id, 'approved');
      fetchRequests(); // Refresh the list
    } catch (err) {
      console.error('Error approving request:', err);
      alert('Failed to approve request. Please try again.');
    }
  };

  const handleReject = async (id) => {
    try {
      await requestAPI.updateRequestStatus(id, 'rejected');
      fetchRequests(); // Refresh the list
    } catch (err) {
      console.error('Error rejecting request:', err);
      alert('Failed to reject request. Please try again.');
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((request) => (
              <div key={request._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                {/* Book Cover Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={request.coverImage}
                    alt={request.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = DEFAULT_BOOK_COVER;
                    }}
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getUrgencyColor(request.urgency)}`}>
                      {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)} Priority
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{request.title}</h3>
                  <p className="text-gray-600 mb-4">by {request.author}</p>
                  
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-gray-400" />
                      <span>ISBN: {request.isbn}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-400" />
                      <span>Genre: {request.genre}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                      <span className="line-clamp-2">Reason: {request.reason}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>Requested by: {request.requester?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="truncate">{request.requester?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>Requested: {new Date(request.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div className="group relative">
                        <span className="cursor-help">{maskAddress(request.address)}</span>
                        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-white p-2 rounded shadow-lg border border-gray-200 z-10">
                          <p className="text-xs text-gray-600">Full address (hover to view):</p>
                          <p className="text-sm font-medium">{showFullAddress(request.address)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={() => handleApprove(request._id)}
                        className="flex-1 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(request._id)}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </button>
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