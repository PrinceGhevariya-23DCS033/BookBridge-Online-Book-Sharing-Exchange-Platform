import React, { useEffect } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes, useNavigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { CartProvider } from './contexts/CartContext';

// Components
import Navbar from './components/Navbar';

// Pages
import AddBookPage from './pages/AddBookPage';
import CartPage from './pages/CartPage';
import DashboardPage from './pages/DashboardPage';
import DonationPage from './pages/DonationPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import MarketplacePage from './pages/MarketplacePage';
import ProductPage from './pages/ProductPage';
import RequestPage from './pages/RequestPage';
import SecondHandProductPage from './pages/SecondHandProductPage';
import SignupPage from './pages/SignupPage';
import SponsorPage from './pages/SponsorPage';

function Logout() {
  const navigate = useNavigate();
  useEffect(() => {
    localStorage.removeItem('token');
    navigate('/login');
  }, [navigate]);
  return null;
}

function App() {
  return (
    <Router>
      <CartProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <div>Profile Page (Protected)</div>
                  </ProtectedRoute>
                }
              />
              <Route path="/donate" element={<DonationPage />} />
              <Route path="/sponsor" element={<SponsorPage />} />
              <Route path="/request" element={<RequestPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/marketplace/add" element={<AddBookPage />} />
              <Route path="/dashboard/*" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/book/:id" element={<ProductPage />} />
              <Route path="/secondhand-book/:id" element={<SecondHandProductPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/logout" element={<Logout />} />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </CartProvider>
    </Router>
  );
}

export default App; 