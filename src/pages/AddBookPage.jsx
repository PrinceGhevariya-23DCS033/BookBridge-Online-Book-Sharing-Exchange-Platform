import { BookOpen, Check, Upload } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const AddBookPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    condition: '',
    price: '',
    rentalPrice: '',
    rentalAvailable: false,
    description: '',
    location: '',
    shipping: {
      available: false,
      cost: '',
      methods: []
    },
    image: null
  });
  
  const [preview, setPreview] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'shipping.available') {
      setFormData(prev => ({
        ...prev,
        shipping: {
          ...prev.shipping,
          available: checked
        }
      }));
    } else if (name === 'shipping.methods') {
      const methods = [...formData.shipping.methods];
      if (checked) {
        methods.push(value);
      } else {
        const index = methods.indexOf(value);
        if (index > -1) {
          methods.splice(index, 1);
        }
      }
      setFormData(prev => ({
        ...prev,
        shipping: {
          ...prev.shipping,
          methods
        }
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleShippingCostChange = (e) => {
    setFormData(prev => ({
      ...prev,
      shipping: {
        ...prev.shipping,
        cost: e.target.value
      }
    }));
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setPreview(true);
    // In a real app, you would submit the form data to an API
    console.log(formData);
  };
  
  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      genre: '',
      condition: '',
      price: '',
      rentalPrice: '',
      rentalAvailable: false,
      description: '',
      location: '',
      shipping: {
        available: false,
        cost: '',
        methods: []
      },
      image: null
    });
    setImagePreview(null);
    setPreview(false);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {!preview ? (
            <>
              <div className="text-center mb-10">
                <h1 className="text-3xl font-serif font-bold text-gray-800 mb-4">List a Book for Sale or Rent</h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Share your books with others in the community. Fill out the details below to list your book in the marketplace.
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-8">
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Book Title*
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Enter book title"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                        Author*
                      </label>
                      <input
                        type="text"
                        id="author"
                        name="author"
                        required
                        value={formData.author}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Enter author name"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">
                        Genre*
                      </label>
                      <select
                        id="genre"
                        name="genre"
                        required
                        value={formData.genre}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
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
                    
                    <div>
                      <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                        Condition*
                      </label>
                      <select
                        id="condition"
                        name="condition"
                        required
                        value={formData.condition}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                      >
                        <option value="">Select condition</option>
                        <option value="Like New">Like New</option>
                        <option value="Very Good">Very Good</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                        <option value="Poor">Poor</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                        Sale Price ($)*
                      </label>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        required
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Enter sale price"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                        Location*
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        required
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                        placeholder="City, State"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        id="rentalAvailable"
                        name="rentalAvailable"
                        checked={formData.rentalAvailable}
                        onChange={handleChange}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <label htmlFor="rentalAvailable" className="ml-2 block text-sm text-gray-700">
                        Available for Rent
                      </label>
                    </div>
                    
                    {formData.rentalAvailable && (
                      <div className="ml-6">
                        <label htmlFor="rentalPrice" className="block text-sm font-medium text-gray-700 mb-1">
                          Monthly Rental Price ($)*
                        </label>
                        <input
                          type="number"
                          id="rentalPrice"
                          name="rentalPrice"
                          required={formData.rentalAvailable}
                          min="0"
                          step="0.01"
                          value={formData.rentalPrice}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                          placeholder="Enter monthly rental price"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        id="shippingAvailable"
                        name="shipping.available"
                        checked={formData.shipping.available}
                        onChange={handleChange}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <label htmlFor="shippingAvailable" className="ml-2 block text-sm text-gray-700">
                        Shipping Available
                      </label>
                    </div>
                    
                    {formData.shipping.available && (
                      <div className="ml-6 space-y-4">
                        <div>
                          <label htmlFor="shippingCost" className="block text-sm font-medium text-gray-700 mb-1">
                            Shipping Cost ($)*
                          </label>
                          <input
                            type="number"
                            id="shippingCost"
                            name="shipping.cost"
                            required={formData.shipping.available}
                            min="0"
                            step="0.01"
                            value={formData.shipping.cost}
                            onChange={handleShippingCostChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                            placeholder="Enter shipping cost"
                          />
                        </div>
                        
                        <div>
                          <p className="block text-sm font-medium text-gray-700 mb-2">Shipping Methods*</p>
                          <div className="space-y-2">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                name="shipping.methods"
                                value="Standard"
                                checked={formData.shipping.methods.includes('Standard')}
                                onChange={handleChange}
                                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">Standard Shipping (5-7 business days)</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                name="shipping.methods"
                                value="Express"
                                checked={formData.shipping.methods.includes('Express')}
                                onChange={handleChange}
                                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">Express Shipping (2-3 business days)</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description*
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows="3"
                      required
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Provide a detailed description of the book and its condition"
                    ></textarea>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                      Book Cover Image*
                    </label>
                    <div className="flex items-center">
                      <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        <span>Upload Image</span>
                        <input
                          type="file"
                          id="image"
                          name="image"
                          required
                          accept="image/*"
                          onChange={handleImageChange}
                          className="sr-only"
                        />
                      </label>
                      {imagePreview && (
                        <div className="ml-4">
                          <img
                            src={imagePreview}
                            alt="Book preview"
                            className="h-16 w-16 object-cover rounded-md"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-md shadow-sm transition-colors"
                    >
                      List Book
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
                  <h2 className="ml-3 text-xl font-semibold">Book Listed Successfully!</h2>
                </div>
                <p>Your book has been listed in the marketplace.</p>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Book Details:</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="flex flex-col space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Book Title</p>
                      <p className="font-medium text-gray-800">{formData.title}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Author</p>
                      <p className="font-medium text-gray-800">{formData.author}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Genre</p>
                      <p className="font-medium text-gray-800">{formData.genre}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Condition</p>
                      <p className="font-medium text-gray-800">{formData.condition}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Sale Price</p>
                      <p className="font-medium text-gray-800">${parseFloat(formData.price).toFixed(2)}</p>
                    </div>
                    
                    {formData.rentalAvailable && (
                      <div>
                        <p className="text-sm text-gray-500">Monthly Rental Price</p>
                        <p className="font-medium text-gray-800">${parseFloat(formData.rentalPrice).toFixed(2)}</p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium text-gray-800">{formData.location}</p>
                    </div>
                    
                    {formData.shipping.available && (
                      <div>
                        <p className="text-sm text-gray-500">Shipping</p>
                        <p className="font-medium text-gray-800">
                          ${parseFloat(formData.shipping.cost).toFixed(2)} - {formData.shipping.methods.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Book cover"
                        className="w-full h-64 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-full h-64 bg-gray-100 rounded-md flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="font-medium text-gray-800">{formData.description}</p>
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    List Another Book
                  </button>
                  
                  <button
                    onClick={() => navigate('/marketplace')}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors"
                  >
                    View Marketplace
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AddBookPage;