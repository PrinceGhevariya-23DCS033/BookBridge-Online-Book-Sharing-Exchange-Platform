import { ChevronLeft, CreditCard, Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, loading, error, updateQuantity, removeFromCart, checkout } = useCart();
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const handleQuantityChange = async (id, change) => {
    const item = cartItems.find(item => item.id === id);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + change);
      await updateQuantity(id, newQuantity);
    }
  };

  const handleRemoveItem = async (id) => {
    await removeFromCart(id);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.priceInINR * item.quantity), 0);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    try {
      await checkout(paymentDetails);
      setShowCheckoutForm(false);
    } catch (err) {
      console.error('Checkout failed:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getImageUrl = (image) => {
    if (!image) {
      return 'https://placehold.co/128x192/e2e8f0/1e293b?text=No+Image';
    }
    return image;
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-8">Add some books to your cart to get started</p>
            <button
              onClick={() => navigate('/marketplace')}
              className="bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 transition-colors duration-300 shadow-sm hover:shadow-md"
            >
              Browse Books
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center p-6 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex-shrink-0 w-24 h-36 relative group">
                      <img
                        src={item.image || 'https://placehold.co/128x192/e2e8f0/1e293b?text=No+Image'}
                        alt={item.title}
                        className="w-full h-full object-cover rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-200"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/128x192/e2e8f0/1e293b?text=No+Image';
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-200 rounded-lg"></div>
                    </div>
                    <div className="flex-1 ml-6">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 hover:text-teal-600 transition-colors duration-200">{item.title}</h3>
                          <p className="text-gray-600 mt-1">{item.author}</p>
                          <span className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full ${
                            item.type === 'secondhand' 
                              ? 'bg-orange-100 text-orange-800' 
                              : 'bg-teal-100 text-teal-800'
                          }`}>
                            {item.type === 'secondhand' ? 'Second-hand' : 'New'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-2 hover:bg-red-50 rounded-full"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleQuantityChange(item.id, -1)}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-600 hover:text-teal-600"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, 1)}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-600 hover:text-teal-600"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="text-lg font-semibold text-teal-600">
                          ₹{item.priceInINR * item.quantity}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium">₹{calculateSubtotal()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-teal-600">Calculated at checkout</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between text-lg font-semibold text-gray-900">
                      <span>Total</span>
                      <span>₹{calculateSubtotal()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCheckoutForm(true)}
                    className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition-colors duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md mt-6"
                  >
                    <CreditCard className="h-5 w-5" />
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Checkout Form Modal */}
        {showCheckoutForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
                <button
                  onClick={() => setShowCheckoutForm(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleCheckout} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    name="cardNumber"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors duration-200"
                    value={paymentDetails.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      name="expiryDate"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors duration-200"
                      value={paymentDetails.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      name="cvv"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors duration-200"
                      value={paymentDetails.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name on Card
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors duration-200"
                    value={paymentDetails.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors duration-200"
                    value={paymentDetails.address}
                    onChange={handleInputChange}
                    placeholder="123 Main St"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors duration-200"
                      value={paymentDetails.city}
                      onChange={handleInputChange}
                      placeholder="New York"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors duration-200"
                      value={paymentDetails.state}
                      onChange={handleInputChange}
                      placeholder="NY"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors duration-200"
                      value={paymentDetails.zipCode}
                      onChange={handleInputChange}
                      placeholder="10001"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCheckoutForm(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200 shadow-sm hover:shadow-md"
                  >
                    Complete Purchase
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage; 