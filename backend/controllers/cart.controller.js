const Cart = require('../models/cart.model');
const Book = require('../models/book.model');

// Helper function to convert USD to INR
const convertToINR = (usdAmount) => {
  const exchangeRate = 83; // 1 USD = 83 INR (approximate)
  return Math.round(usdAmount * exchangeRate);
};

// Helper function to get default price based on book type
const getDefaultPrice = (type) => {
  switch (type) {
    case 'sold':
      return 19.99; // Default price for sold books
    case 'new':
      return 24.99; // Default price for new books
    default:
      return 0; // Free for donated books
  }
};

// Helper function to get a reliable image URL
const getImageUrl = (image) => {
  if (!image) {
    return 'https://placehold.co/128x192/e2e8f0/1e293b?text=No+Image';
  }
  // If the image URL is from Google Books, ensure it's using HTTPS
  if (image.includes('books.google.com')) {
    return image.replace('http://', 'https://');
  }
  return image;
};

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate({
        path: 'items.book',
        select: 'title author price image type condition description currency'
      })
      .exec();

    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
      await cart.save();
    }

    // Transform the items to include book details directly
    const transformedItems = cart.items.map(item => {
      const price = item.book.price || getDefaultPrice(item.book.type);
      const priceInINR = convertToINR(price);
      
      return {
        _id: item._id,
        id: item._id,
        quantity: item.quantity,
        title: item.book.title,
        author: item.book.author,
        price: price,
        priceInINR: priceInINR,
        image: getImageUrl(item.book.image),
        type: item.book.type,
        condition: item.book.condition,
        description: item.book.description,
        currency: 'INR'
      };
    });

    res.json(transformedItems);
  } catch (error) {
    console.error('Error getting cart:', error);
    res.status(500).json({ 
      message: 'Error getting cart',
      error: error.message 
    });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { book } = req.body;
    
    if (!book) {
      return res.status(400).json({ message: 'Book ID is required' });
    }

    // Check if book exists and get its price
    const bookExists = await Book.findById(book);
    if (!bookExists) {
      return res.status(404).json({ message: 'Book not found' });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    // Check if book is already in cart
    const existingItem = cart.items.find(item => item.book.toString() === book);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.items.push({ book, quantity: 1 });
    }

    await cart.save();
    
    // Populate book details and transform response
    await cart.populate({
      path: 'items.book',
      select: 'title author price image type condition description currency'
    });

    const transformedItems = cart.items.map(item => {
      const price = item.book.price || getDefaultPrice(item.book.type);
      const priceInINR = convertToINR(price);
      
      return {
        _id: item._id,
        id: item._id,
        quantity: item.quantity,
        title: item.book.title,
        author: item.book.author,
        price: price,
        priceInINR: priceInINR,
        image: getImageUrl(item.book.image),
        type: item.book.type,
        condition: item.book.condition,
        description: item.book.description,
        currency: 'INR'
      };
    });
    
    res.json(transformedItems);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ 
      message: 'Error adding to cart',
      error: error.message 
    });
  }
};

// Update item quantity
exports.updateQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.id(id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    item.quantity = quantity;
    await cart.save();

    await cart.populate({
      path: 'items.book',
      select: 'title author price image type condition description currency'
    });

    const transformedItems = cart.items.map(item => ({
      _id: item._id,
      id: item._id,
      quantity: item.quantity,
      title: item.book.title,
      author: item.book.author,
      price: item.book.price,
      priceInINR: convertToINR(item.book.price),
      image: getImageUrl(item.book.image),
      type: item.book.type,
      condition: item.book.condition,
      description: item.book.description,
      currency: 'INR'
    }));

    res.json(transformedItems);
  } catch (error) {
    console.error('Error updating quantity:', error);
    res.status(500).json({ 
      message: 'Error updating quantity',
      error: error.message 
    });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== id);
    await cart.save();

    await cart.populate({
      path: 'items.book',
      select: 'title author price image type condition description currency'
    });

    const transformedItems = cart.items.map(item => ({
      _id: item._id,
      id: item._id,
      quantity: item.quantity,
      title: item.book.title,
      author: item.book.author,
      price: item.book.price,
      priceInINR: convertToINR(item.book.price),
      image: getImageUrl(item.book.image),
      type: item.book.type,
      condition: item.book.condition,
      description: item.book.description,
      currency: 'INR'
    }));

    res.json(transformedItems);
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ 
      message: 'Error removing from cart',
      error: error.message 
    });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ 
      message: 'Error clearing cart',
      error: error.message 
    });
  }
};

// Checkout
exports.checkout = async (req, res) => {
  try {
    const { paymentDetails } = req.body;

    if (!paymentDetails) {
      return res.status(400).json({ message: 'Payment details are required' });
    }

    const cart = await Cart.findOne({ user: req.user.id })
      .populate({
        path: 'items.book',
        select: 'title author price image type condition description currency'
      })
      .exec();

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Here you would typically:
    // 1. Process payment
    // 2. Create order
    // 3. Update inventory
    // 4. Send confirmation email
    // For now, we'll just clear the cart

    cart.items = [];
    await cart.save();

    res.json({ message: 'Checkout successful' });
  } catch (error) {
    console.error('Error during checkout:', error);
    res.status(500).json({ 
      message: 'Error during checkout',
      error: error.message 
    });
  }
}; 