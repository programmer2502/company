const axios = require('axios');

async function fetchProduct() {
    try {
        const response = await axios.get('https://company-v2oe.onrender.com/api/products?_id=699618994970df10cba43cbd');
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error fetching product:', error.message);
    }
}

fetchProduct();
