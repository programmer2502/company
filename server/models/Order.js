const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true, default: 1 },
            priceAtPurchase: { type: Number, required: true },
            selectedSize: { type: String },
            selectedColor: { type: String }
        }
    ],
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
    },
    timeline: [
        {
            status: { type: String },
            date: { type: Date, default: Date.now },
            note: { type: String }
        }
    ],
    createdAt: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model('Order', orderSchema);
