import { BookOpen, Heart, LogOut, Menu, ShoppingCart, User, X } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('token');
  const { cartItems } = useCart();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <BookOpen className="h-8 w-8 text-teal-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">BookBridge</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-gray-600 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium">
              Home
            </Link>
            <Link to="/marketplace" className="text-gray-600 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium">
              Marketplace
            </Link>
            <Link to="/donate" className="text-gray-600 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium">
              Donate
            </Link>
            <Link to="/sponsor" className="text-gray-600 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
              <Heart className="h-4 w-4 mr-1" />
              Sponsor
            </Link>
            <Link to="/request" className="text-gray-600 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium">
              Request
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </Link>
                <Link to="/cart" className="text-gray-600 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-teal-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItems.length}
                    </span>
                  )}
                </Link>
              </>
            )}
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                <LogOut className="h-5 w-5 mr-1" />
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="flex items-center text-gray-600 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                <User className="h-5 w-5 mr-1" />
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="text-gray-600 hover:text-teal-600 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/marketplace"
              className="text-gray-600 hover:text-teal-600 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Marketplace
            </Link>
            <Link
              to="/donate"
              className="text-gray-600 hover:text-teal-600 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Donate
            </Link>
            <Link
              to="/sponsor"
              className="text-gray-600 hover:text-teal-600 block px-3 py-2 rounded-md text-base font-medium flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <Heart className="h-4 w-4 mr-1" />
              Sponsor
            </Link>
            <Link
              to="/request"
              className="text-gray-600 hover:text-teal-600 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Request
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-teal-600 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/cart"
                  className="text-gray-600 hover:text-teal-600 block px-3 py-2 rounded-md text-base font-medium flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Cart
                  {cartItems.length > 0 && (
                    <span className="ml-2 bg-teal-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItems.length}
                    </span>
                  )}
                </Link>
              </>
            )}
            {isAuthenticated ? (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="flex items-center text-gray-600 hover:text-teal-600 w-full px-3 py-2 rounded-md text-base font-medium"
              >
                <LogOut className="h-5 w-5 mr-1" />
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="flex items-center text-gray-600 hover:text-teal-600 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="h-5 w-5 mr-1" />
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;