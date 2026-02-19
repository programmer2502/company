const axios = require('axios');

async function seedProduct() {
    try {
        const productId = '699618994970df10cba43cbd';
        // Using placeholder images or reusing the existing one if we knew it, 
        // but for safety I'll use some reliable placeholders or just the one I saw in debug output if I could copy it.
        // Since I can't easily copy the long URL from truncated output, I will use some generic placeholder URLs 
        // OR fetching the product first to get its current image and duplicating it.

        const getRes = await axios.get(`https://company-v2oe.onrender.com/api/products?_id=${productId}`);
        const product = Array.isArray(getRes.data) ? getRes.data[0] : getRes.data;

        let validImage = product.imageUrl || (product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/500');

        // Create 3 images (duplicates for testing gallery)
        const images = [validImage, validImage, validImage];
        const sizes = "S, M, L, XL";
        const colors = "Red, Blue, Green";

        // We need to use the PUT logic.
        // The PUT route expects multipart/form-data for files, OR JSON if we just update text/existingImages?
        // Wait, the PUT route uses `upload.array`. If we send JSON, it might not parse `req.body` correctly if Multer is expecting multipart.
        // However, typically text fields work. But `existingImages` logic expects array.

        // Let's try sending a standard PUT request with JSON first. 
        // If the backend parses JSON body when no files are sent, it should work.
        // BUT `upload.array` might consume the stream.
        // Safest is to use FormData logic even in node, or just update directly via MongoDB if I could.
        // I'll try axios.put with JSON. If `productRoutes.js` uses `upload.array`, it might require multipart.

        // Let's construct a FormData request in Node.
        const FormData = require('form-data');
        const form = new FormData();
        form.append('name', product.name);
        form.append('category', product.category);
        form.append('price', product.price);
        form.append('stock', product.stock);
        form.append('description', product.description);
        form.append('colors', colors); // Route splits string
        form.append('sizes', sizes);   // Route splits string

        // existingImages
        images.forEach(img => form.append('existingImages', img));

        const updateRes = await axios.put(`https://company-v2oe.onrender.com/api/products/${productId}`, form, {
            headers: {
                ...form.getHeaders()
            }
        });

        console.log('Update Status:', updateRes.status);
        console.log('Updated Product Images:', updateRes.data.images);

    } catch (error) {
        console.error('Error seeding product:', error.message);
        if (error.response) console.error('Response:', error.response.data);
    }
}

seedProduct();
