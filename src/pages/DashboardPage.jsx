import { AlertCircle, BookOpen, CheckCircle, Clock, Heart, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import { requestAPI } from '../services/api';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    donatedBooks: 0,
    sponsoredBooks: 0,
    marketplacePurchases: 0,
    pendingRequests: 0,
    totalImpact: 0,
    activeDonors: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await requestAPI.getDashboardRequests();
        if (data.stats) setStats(data.stats);
        if (data.recentActivity) setRecentActivity(data.recentActivity);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, User!</h1>
            <p className="mt-2 text-gray-600">Here's an overview of your book bridge activities</p>
            {loading && <p className="text-blue-500">Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Donated Books Card */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-teal-500">
                      <div className="flex items-center">
                <div className="p-3 rounded-full bg-teal-100">
                  <BookOpen className="h-6 w-6 text-teal-600" />
                        </div>
                        <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Donated Books</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.donatedBooks}</p>
                </div>
                        </div>
                      </div>

            {/* Sponsored Books Card */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <Heart className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sponsored Books</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.sponsoredBooks}</p>
                </div>
          </div>
        </div>
        
            {/* Marketplace Purchases Card */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Marketplace Purchases</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.marketplacePurchases}</p>
                </div>
              </div>
          </div>
          
            {/* Total Impact Card */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Impact</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalImpact} books</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
            {recentActivity.length === 0 && !loading && (
              <div className="text-gray-500">No recent activity.</div>
            )}
            <div className="space-y-4">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {activity.type === 'donation' && (
                      <BookOpen className="h-6 w-6 text-teal-600" />
                    )}
                    {activity.type === 'sponsorship' && (
                      <Heart className="h-6 w-6 text-purple-600" />
                    )}
                    {activity.type === 'purchase' && (
                      <ShoppingCart className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">{activity.title}</h3>
                      <span className="text-sm text-gray-500">{activity.date}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{activity.impact}</p>
                    <div className="mt-2 flex items-center">
                      {activity.status === 'completed' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Clock className="h-4 w-4 mr-1" />
                          In Progress
                  </span>
                      )}
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>

          {/* Quick Actions Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pending Requests */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Requests</h2>
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">You have {stats.pendingRequests} pending request</p>
                    <p className="text-sm text-gray-500">Review and take action</p>
      </div>
      </div>
                <button className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors">
                  View
                </button>
      </div>
            </div>
            
            {/* Active Donors */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Donors</h2>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Users className="h-6 w-6 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{stats.activeDonors} active donors</p>
                    <p className="text-sm text-gray-500">In your network</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors">
                  Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;