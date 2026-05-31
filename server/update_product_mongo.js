const mongoose = require('mongoose');

// Connect to MongoDB
const MONGO_URI = 'mongodb+srv://kishore:Kishorep334@shopping01.yls1ijg.mongodb.net/?appName=shopping01';

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    imageUrl: { type: String, required: false },
    images: { type: [String], default: [] }, // Array of image URLs
    colors: { type: [String], default: [] }, // Array of strings e.g., ["Red", "Blue"]
    sizes: { type: [String], default: [] }   // Array of strings e.g., ["S", "M", "L"]
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

async function updateProduct() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const productId = '699618994970df10cba43cbd';

        // Find existing product to get a valid image
        const product = await Product.findById(productId);
        if (!product) {
            console.error('Product not found');
            return;
        }

        let validImage = product.imageUrl || (product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/500');

        // Update
        const updatedProduct = await Product.findByIdAndUpdate(productId, {
            $set: {
                images: [validImage, validImage, validImage], // Duplicate for testing
                sizes: ['S', 'M', 'L', 'XL'],
                colors: ['Red', 'Blue', 'Green']
            }
        }, { new: true });

        console.log('Updated Product:', updatedProduct);

    } catch (error) {
        console.error('Error updating product:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
        process.exit();
    }
}

updateProduct();
