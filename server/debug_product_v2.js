const axios = require('axios');

async function fetchProduct() {
    try {
        const response = await axios.get('http://localhost:5000/api/products?_id=699618994970df10cba43cbd');
        const product = Array.isArray(response.data) ? response.data[0] : response.data;

        console.log('Product Name:', product.name);
        console.log('Images Array:', product.images);
        console.log('Images Length:', product.images ? product.images.length : 0);
        console.log('Sizes:', product.sizes);
        console.log('Colors:', product.colors);
    } catch (error) {
        console.error('Error fetching product:', error.message);
    }
}

fetchProduct();
