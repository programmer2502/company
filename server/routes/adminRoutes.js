const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');

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
    try {
        const orders = await Order.find();
        const lowStock = await Product.find({ stock: { $lt: 5 } });
        // Simplified monthly calculation
        const currentMonth = new Date().getMonth();
        const monthlyOrders = orders.filter(o => new Date(o.createdAt).getMonth() === currentMonth);
        const totalSales = monthlyOrders.reduce((acc, curr) => acc + curr.totalAmount, 0);

        // Sales Trend (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentOrders = orders.filter(o => new Date(o.createdAt) >= sevenDaysAgo);

        const salesTrend = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' });
            const daySales = recentOrders
                .filter(o => new Date(o.createdAt).toLocaleDateString() === new Date(d).toLocaleDateString())
                .reduce((acc, curr) => acc + curr.totalAmount, 0);
            salesTrend.push({ name: dateStr, sales: daySales });
        }

        res.json({
            totalSales,
            orderCount: monthlyOrders.length,
            lowStockCount: lowStock.length,
            lowStockItems: lowStock,
            salesTrend
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Users and their Orders
router.get('/users-orders', protect, admin, async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'username email isBlocked')
            .populate('items.product', 'name price imageUrl')
            .sort({ createdAt: -1 });
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
