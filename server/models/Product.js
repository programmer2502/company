const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: {
        type: String,
        required: true,
        index: true
    },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    stock: { type: Number, required: true, default: 0, index: true },
    imageUrl: { type: String, required: true }, // Main image (backward compatibility / default)
    images: [{ type: String }], // Array of image URLs
    colors: [{ type: String }], // Array of color names/codes
    sizes: [{ type: String }], // Array of sizes
    description: { type: String },
    salesCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model('Product', productSchema);
