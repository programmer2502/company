const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const ImageKit = require('@imagekit/nodejs');
const cache = require('../utils/cache');


const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

// Multer Config - Use Memory Storage for ImageKit
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware to check auth
const protect = (req, res, next) => {
    console.log(`[ProductRoutes] Protect Middleware Hit: ${req.method} ${req.originalUrl}`);
    const authHeader = req.headers.authorization;
    console.log(`[ProductRoutes] Auth Header: ${authHeader ? 'Present' : 'MISSING'}`);

    const token = authHeader?.split(' ')[1];
    if (!token) {
        console.log('[ProductRoutes] No token found in header');
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(`[ProductRoutes] Token verified. User ID: ${decoded.id}, Role: ${decoded.role}`);
        req.user = decoded;
        next();
    } catch (error) {
        console.error(`[ProductRoutes] Token verification failed: ${error.message}`);
        res.status(401).json({ message: 'Token failed', error: error.message });
    }
};

// Middleware for admin
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Admin only' });
    }
};

// Get all products (with pagination and projection and caching)
router.get('/', async (req, res) => {
    const { category, _id, page = 1, limit = 20 } = req.query;
    const cacheKey = `products_${category || 'all'}_${_id || 'none'}_${page}_${limit}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) return res.json(cachedData);

    try {
        const query = {};
        if (category) query.category = category;
        if (_id) query._id = _id;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const products = await Product.find(query)
            .select('-description')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await Product.countDocuments(query);

        const responseData = {
            products,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        };

        cache.set(cacheKey, responseData);
        res.json(responseData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add Product (Admin)
router.post('/', protect, admin, upload.array('images', 5), async (req, res) => {
    try {
        const { name, category, price, stock, description, colors, sizes } = req.body;
        let imageUrl = '';
        let images = [];

        if (req.files && req.files.length > 0) {
            console.log(`[ProductRoutes] Files received: ${req.files.length}`);
            console.log('[ProductRoutes] ImageKit methods:', Object.keys(imagekit));
            if (imagekit.files) console.log('[ProductRoutes] ImageKit.files methods:', Object.keys(imagekit.files));
            try {
                const uploadPromises = req.files.map(file => {
                    const fileBase64 = file.buffer.toString('base64');
                    console.log(`[ProductRoutes] Uploading file: ${file.originalname} (Base64 length: ${fileBase64.length})`);
                    return imagekit.files.upload({ // Reverted back to imagekit.files.upload
                        file: fileBase64,
                        fileName: file.originalname,
                        folder: '/products'
                    });
                });
                const uploadResponses = await Promise.all(uploadPromises);
                images = uploadResponses.map(response => response.url);
                imageUrl = images[0]; // Set main image to the first uploaded image
                console.log(`[ProductRoutes] Upload success. Image URL: ${imageUrl}`);
            } catch (ikError) {
                console.error('[ProductRoutes] ImageKit Upload Failed:', ikError);
                return res.status(500).json({ error: 'Image upload failed', details: ikError.message });
            }
        } else {
            console.log('[ProductRoutes] No files received');
        }

        const product = new Product({
            name,
            category,
            price,
            stock,
            imageUrl,
            images,
            colors: colors ? colors.split(',').map(c => c.trim()) : [],
            sizes: sizes ? sizes.split(',').map(s => s.trim()) : [],
            description
        });

        await product.save();
        cache.flushAll(); // Clear all cache on new product
        res.status(201).json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Update Product (Admin)
router.put('/:id', protect, admin, upload.array('images', 5), async (req, res) => {
    try {
        const { name, category, price, stock, description, colors, sizes, existingImages } = req.body;

        // Parse existingImages: it might be a string (single url), array of strings, or undefined
        let currentImages = [];
        if (existingImages) {
            if (Array.isArray(existingImages)) {
                currentImages = existingImages;
            } else {
                currentImages = [existingImages];
            }
        }

        let newImages = [];
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(file =>
                imagekit.files.upload({
                    file: file.buffer,
                    fileName: file.originalname,
                    folder: '/products'
                })
            );
            const uploadResponses = await Promise.all(uploadPromises);
            newImages = uploadResponses.map(response => response.url);
        }

        // Combine existing and new images
        // If the user deleted all existing images and didn't upload new ones, this will be empty.
        // If the user didn't touch images (frontend didn't send existingImages but also didn't send new ones?), 
        // we need to be careful.
        // However, standard HTML forms don't send "unchecked" checkboxes or missing fields.
        // If we want to support "deleting all images", we need the frontend to explicitely send an empty array or we handle it here.
        // BUT: If the frontend sends `existingImages` as a field, it means "these are the images/URLs I want to keep".
        // So we strictly follow what is sent.

        const finalImages = [...currentImages, ...newImages];
        let finalImageUrl = finalImages.length > 0 ? finalImages[0] : '';

        // If no images at all, maybe keep the old one? 
        // NO, if the admin explicitly deletes them, they should be gone.
        // But for safety, usually we fetch the product to see if we should fallback if nothing was sent.
        // If `existingImages` key is NOT in body, maybe we assume "don't touch images"?
        // Let's check if `existingImages` is present in req.body.
        // `req.body` handling with `multer` can be tricky if fields come after files, but usually ok.

        const updateData = {
            name,
            category,
            price,
            stock,
            description,
            colors: colors ? (Array.isArray(colors) ? colors : colors.split(',').map(c => c.trim())) : [],
            sizes: sizes ? (Array.isArray(sizes) ? sizes : sizes.split(',').map(s => s.trim())) : [],
            images: finalImages,
            imageUrl: finalImageUrl
        };

        // Note: We are overwriting images with whatever we constructed.
        const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
        cache.flushAll(); // Clear cache
        res.json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Delete Product (Admin)
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        cache.flushAll(); // Clear cache
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
