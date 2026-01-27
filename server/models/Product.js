const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: {
        type: String,
        required: true,
        enum: ['Clothing', 'Shoes', 'Watches', 'Glasses', 'Perfume', 'Accessories']
    },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    imageUrl: { type: String, required: true }, // URL or placeholder
    description: { type: String },
    salesCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Product', productSchema);
