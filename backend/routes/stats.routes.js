const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const User = require('../models/user.model');
const Book = require('../models/book.model');
const Request = require('../models/request.model');
const Sponsorship = require('../models/sponsorship.model');

// Get user stats and insights
router.get('/', auth, async (req, res) => {
  try {
    // Get user's basic stats
    const user = await User.findById(req.user._id).select('stats');
    
    // Get active requests
    const activeRequests = await Request.find({
      user: req.user._id,
      status: { $in: ['pending', 'matched'] }
    }).count();

    // Get fulfilled requests
    const fulfilledRequests = await Request.find({
      user: req.user._id,
      status: 'fulfilled'
    }).count();

    // Get active listings
    const activeListings = await Book.find({
      owner: req.user._id,
      type: 'sold',
      status: 'available'
    }).count();

    // Get total sponsored amount
    const totalSponsored = await Sponsorship.aggregate([
      { $match: { sponsor: req.user._id } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get genre distribution of donated books
    const genreDistribution = await Book.aggregate([
      { $match: { owner: req.user._id, type: 'donated' } },
      { $group: { _id: '$genre', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      stats: user.stats,
      requests: {
        active: activeRequests,
        fulfilled: fulfilledRequests
      },
      marketplace: {
        activeListings
      },
      sponsorship: {
        totalAmount: totalSponsored[0]?.total || 0
      },
      insights: {
        genreDistribution
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

// Get platform-wide stats (admin only)
router.get('/platform', auth, async (req, res) => {
  try {
    // Check if user is admin (you can implement your own admin check)
    // For now, we'll just return the stats

    const totalUsers = await User.countDocuments();
    const totalBooks = await Book.countDocuments();
    const totalRequests = await Request.countDocuments();
    const totalSponsorships = await Sponsorship.countDocuments();

    const totalSponsoredAmount = await Sponsorship.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const genreDistribution = await Book.aggregate([
      { $group: { _id: '$genre', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const requestStatusDistribution = await Request.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      users: totalUsers,
      books: totalBooks,
      requests: totalRequests,
      sponsorships: totalSponsorships,
      totalSponsoredAmount: totalSponsoredAmount[0]?.total || 0,
      insights: {
        genreDistribution,
        requestStatusDistribution
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching platform stats' });
  }
});

module.exports = router; 