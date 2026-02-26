const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');
const cache = require('../utils/cache');

const protect = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Not authorized' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') next();
    else res.status(403).json({ message: 'Admin only' });
};

// Get Monthly Sales Stats
router.get('/stats', protect, admin, async (req, res) => {
    const cacheKey = 'admin_stats';
    const cachedData = cache.get(cacheKey);
    if (cachedData) return res.json(cachedData);

    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        // Run aggregations and queries in parallel
        const [monthlyStats, lowStock, salesTrendData] = await Promise.all([
            Order.aggregate([
                { $match: { createdAt: { $gte: startOfMonth } } },
                { $group: { _id: null, totalSales: { $sum: "$totalAmount" }, orderCount: { $sum: 1 } } }
            ]),
            Product.find({ stock: { $lt: 5 } }).lean(),
            Order.aggregate([
                { $match: { createdAt: { $gte: sevenDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        sales: { $sum: "$totalAmount" }
                    }
                },
                { $sort: { "_id": 1 } }
            ])
        ]);

        const totalSales = monthlyStats.length > 0 ? monthlyStats[0].totalSales : 0;
        const orderCount = monthlyStats.length > 0 ? monthlyStats[0].orderCount : 0;

        // Formulate 7-day trend with all days present
        const salesTrend = [];
        const dayMap = new Map(salesTrendData.map(d => [d._id, d.sales]));

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' });
            salesTrend.push({
                name: dateStr,
                sales: dayMap.get(key) || 0
            });
        }

        const stats = {
            totalSales,
            orderCount,
            lowStockCount: lowStock.length,
            lowStockItems: lowStock,
            salesTrend
        };

        cache.set(cacheKey, stats);
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Users and their Orders
router.get('/users-orders', protect, admin, async (req, res) => {
    const cacheKey = 'admin_users_orders';
    const cachedData = cache.get(cacheKey);
    if (cachedData) return res.json(cachedData);

    try {
        const orders = await Order.find()
            .populate('user', 'username email isBlocked')
            .populate('items.product', 'name price imageUrl')
            .sort({ createdAt: -1 })
            .lean(); // Use .lean() for faster processing

        cache.set(cacheKey, orders);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Order Status
router.put('/orders/:id/status', protect, admin, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (order) {
            order.status = status;
            // Add to timeline
            order.timeline.push({
                status,
                note: `Status updated to ${status} by Admin`,
                date: new Date()
            });

            await order.save();
            cache.del(['admin_stats', 'admin_users_orders']); // Invalidate cache

            // Mock Email Notification
            console.log(`Sending email to customer: Your order #${order._id} is now ${status}`);

            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Block/Unblock User
router.put('/users/:id/block', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.isBlocked = !user.isBlocked;
            await user.save();
            res.json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'}`, isBlocked: user.isBlocked });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
