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

// Create Order
router.post('/', protect, async (req, res) => {
    const { items, totalAmount } = req.body;
    try {
        const order = new Order({
            user: req.user.id,
            items,
            totalAmount
        });

        // Decrease stock (simplified, ideally usage of transaction)
        for (const item of items) {
            await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity, salesCount: item.quantity } });
        }

        await order.save();
        res.status(201).json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
