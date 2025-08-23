import React from 'react';
import { Heart, ShoppingCart, Clock, Truck } from 'lucide-react';

const BookCard = ({ book, actionType = "buy" }) => {
  const handleAction = (type) => {
    switch(type) {
      case "buy":
        alert(`You clicked to buy ${book.title}`);
        break;
      case "rent":
        alert(`You clicked to rent ${book.title}`);
        break;
      case "contact":
        alert(`You clicked to contact seller about ${book.title}`);
        break;
      default:
        break;
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'Like New':
        return 'bg-green-100 text-green-800';
      case 'Very Good':
        return 'bg-teal-100 text-teal-800';
      case 'Good':
        return 'bg-blue-100 text-blue-800';
      case 'Fair':
        return 'bg-yellow-100 text-yellow-800';
      case 'Poor':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={book.image || 'https://placehold.co/300x400/e2e8f0/1e293b?text=No+Image'} 
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
          onError={(e) => {
            e.target.src = 'https://placehold.co/300x400/e2e8f0/1e293b?text=No+Image';
          }}
        />
        <button 
          className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100 transition-colors"
          onClick={() => alert(`Added ${book.title} to favorites`)}
        >
          <Heart className="h-4 w-4 text-gray-500 hover:text-red-500" />
        </button>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-serif font-semibold text-gray-800 line-clamp-1">{book.title}</h3>
        <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
        
        <div className="flex justify-between items-center mb-3">
          <div className="space-y-1">
            {book.isFree || book.isDonated || book.price === 0 ? (
              <span className="font-medium text-lg text-green-600">FREE</span>
            ) : (
              <span className="font-medium text-lg text-teal-600">${book.price.toFixed(2)}</span>
            )}
            {book.rentalPrice && (
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                <span>${book.rentalPrice}/month</span>
              </div>
            )}
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${getConditionColor(book.condition)}`}>
            {book.condition}
          </span>
        </div>
        
        <div className="text-sm text-gray-500 mb-4">
          <p>Seller: {book.seller}</p>
          <p className="flex items-center">
            <Truck className="h-4 w-4 mr-1" />
            <span>{book.location}</span>
          </p>
        </div>
        
        <div className="flex flex-col space-y-2">
          {actionType === "buy" && (
            <>
              <button 
                onClick={() => handleAction("buy")}
                className="flex-1 flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Buy Now
              </button>
              {book.rentalAvailable && (
                <button 
                  onClick={() => handleAction("rent")}
                  className="flex-1 flex items-center justify-center border border-teal-600 text-teal-600 hover:bg-teal-50 py-2 px-4 rounded-md transition-colors"
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Rent Book
                </button>
              )}
            </>
          )}
          {actionType === "contact" && (
            <button 
              onClick={() => handleAction("contact")}
              className="flex-1 flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-md transition-colors"
            >
              Contact Seller
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;