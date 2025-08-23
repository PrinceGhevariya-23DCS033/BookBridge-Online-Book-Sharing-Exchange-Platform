import { 
  AlertCircle, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Heart, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  X,
  MapPin,
  Mail,
  User,
  Filter,
  Calendar,
  Eye,
  Phone,
  DollarSign,
  Package
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { requestAPI, marketplaceAPI, donationAPI, cartAPI } from '../services/api';
import requestAPIService from '../services/requestAPI';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    donatedBooks: 0,
    sponsoredBooks: 0,
    marketplacePurchases: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalImpact: 0,
    activeDonors: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch dashboard stats and recent activity
      const dashboardData = await requestAPI.getDashboardRequests();
      if (dashboardData.stats) setStats(dashboardData.stats);
      if (dashboardData.recentActivity) setRecentActivity(dashboardData.recentActivity);

      // Fetch user's requests
      try {
        const myRequestsData = await requestAPIService.getSponsorRequests();
        setMyRequests(myRequestsData || []);
      } catch (err) {
        console.log('Error fetching my requests:', err);
        setMyRequests([]);
      }

      // Fetch purchase history from cart
      try {
        const cartData = await cartAPI.getCart();
        setPurchaseHistory(cartData.data?.items || []);
      } catch (err) {
        console.log('Error fetching purchase history:', err);
        setPurchaseHistory([]);
      }

    } catch (err) {
      console.error('Dashboard error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'fulfilled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const RequestDetailModal = ({ request, onClose }) => {
    if (!request) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Request Details</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Book Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">Book Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Title</p>
                    <p className="font-medium">{request.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Author</p>
                    <p className="font-medium">{request.author}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ISBN</p>
                    <p className="font-medium">{request.isbn}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Genre</p>
                    <p className="font-medium">{request.genre}</p>
                  </div>
                </div>
              </div>

              {/* Request Details */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">Request Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Reason</p>
                    <p className="font-medium">{request.reason}</p>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Urgency</p>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(request.urgency)}`}>
                        {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Requested Date</p>
                    <p className="font-medium">{new Date(request.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information (for approved requests) */}
              {request.status === 'approved' && request.requester && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{request.requester.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-green-600" />
                      <span>{request.requester.email}</span>
                    </div>
                    {request.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-green-600 mt-1" />
                        <span>
                          {request.address.street}, {request.address.city}, 
                          {request.address.state} {request.address.postalCode}, 
                          {request.address.country}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">Welcome back! Here's an overview of your BookBridge activities.</p>
            {error && (
              <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                <AlertCircle className="h-5 w-5 inline mr-2" />
                {error}
              </div>
            )}
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-teal-500 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Donated Books</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.donatedBooks}</p>
                </div>
                <div className="p-3 rounded-full bg-teal-100">
                  <BookOpen className="h-8 w-8 text-teal-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sponsored Books</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.sponsoredBooks}</p>
                </div>
                <div className="p-3 rounded-full bg-purple-100">
                  <Heart className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Marketplace Purchases</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.marketplacePurchases}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <ShoppingCart className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.pendingRequests}</p>
                </div>
                <div className="p-3 rounded-full bg-green-100">
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-xl shadow-lg mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Overview', icon: TrendingUp },
                  { id: 'requests', label: 'My Requests', icon: BookOpen },
                  { id: 'purchases', label: 'Purchase History', icon: ShoppingCart },
                  { id: 'activity', label: 'Recent Activity', icon: Clock }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-teal-500 text-teal-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                      <h3 className="font-semibold text-yellow-800 mb-2">Pending Requests</h3>
                      <p className="text-2xl font-bold text-yellow-900">{stats.pendingRequests}</p>
                      <p className="text-sm text-yellow-700">Awaiting approval</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                      <h3 className="font-semibold text-green-800 mb-2">Approved Requests</h3>
                      <p className="text-2xl font-bold text-green-900">{stats.approvedRequests || 0}</p>
                      <p className="text-sm text-green-700">Ready for contact</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                      <h3 className="font-semibold text-red-800 mb-2">Rejected Requests</h3>
                      <p className="text-2xl font-bold text-red-900">{stats.rejectedRequests || 0}</p>
                      <p className="text-sm text-red-700">Need revision</p>
                    </div>
                  </div>
                </div>
              )}

              {/* My Requests Tab */}
              {activeTab === 'requests' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">My Book Requests</h2>
                    <button
                      onClick={() => navigate('/request')}
                      className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                    >
                      New Request
                    </button>
                  </div>
                  
                  {myRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
                      <p className="text-gray-600 mb-4">Start by requesting a book you need for your studies.</p>
                      <button
                        onClick={() => navigate('/request')}
                        className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                      >
                        Create Your First Request
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {myRequests.map((request) => (
                        <div key={request._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-semibold text-gray-900 line-clamp-2">{request.title}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                              {request.status}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-2">by {request.author}</p>
                          <p className="text-gray-500 text-xs mb-3">
                            Requested: {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                          
                          <div className="flex justify-between items-center">
                            <span className={`px-2 py-1 text-xs rounded-full ${getUrgencyColor(request.urgency)}`}>
                              {request.urgency} priority
                            </span>
                            <button
                              onClick={() => setSelectedRequest(request)}
                              className="text-teal-600 hover:text-teal-800 text-sm font-medium flex items-center gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Purchase History Tab */}
              {activeTab === 'purchases' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Purchase History</h2>
                  
                  {purchaseHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No purchases yet</h3>
                      <p className="text-gray-600 mb-4">Explore our marketplace to find great books.</p>
                      <button
                        onClick={() => navigate('/marketplace')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Browse Marketplace
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {purchaseHistory.map((item, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Package className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-medium">{item.book?.title || 'Book Title'}</h3>
                              <p className="text-sm text-gray-600">{item.book?.author || 'Unknown Author'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${item.price || 'Free'}</p>
                            <p className="text-sm text-gray-500">{new Date(item.addedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Recent Activity Tab */}
              {activeTab === 'activity' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Recent Activity</h2>
                  
                  {recentActivity.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No recent activity</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentActivity.map((activity, idx) => (
                        <div key={idx} className="flex items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex-shrink-0 mr-4">
                            {activity.type === 'donation' && (
                              <BookOpen className="h-6 w-6 text-teal-600" />
                            )}
                            {activity.type === 'sponsorship' && (
                              <Heart className="h-6 w-6 text-purple-600" />
                            )}
                            {activity.type === 'purchase' && (
                              <ShoppingCart className="h-6 w-6 text-blue-600" />
                            )}
                            {activity.type === 'request' && (
                              <BookOpen className="h-6 w-6 text-green-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-medium text-gray-900">{activity.title}</h3>
                              <span className="text-sm text-gray-500">
                                {new Date(activity.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-600">{activity.impact}</p>
                            <div className="mt-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                activity.status === 'completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {activity.status === 'completed' ? (
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                ) : (
                                  <Clock className="h-3 w-3 mr-1" />
                                )}
                                {activity.status === 'completed' ? 'Completed' : 'In Progress'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Request Detail Modal */}
      {selectedRequest && (
        <RequestDetailModal 
          request={selectedRequest} 
          onClose={() => setSelectedRequest(null)} 
        />
      )}
      
      <Footer />
    </div>
  );
};

export default DashboardPage;