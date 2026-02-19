const axios = require('axios');

async function verify() {
    try {
        const id = '699618994970df10cba43cbd';
        const url = `https://company-v2oe.onrender.com/api/products?_id=${id}`;
        console.log(`Fetching ${url}...`);
        const res = await axios.get(url);
        const product = Array.isArray(res.data) ? res.data[0] : res.data;

        console.log('--- Server Response Data ---');
        console.log('Name:', product.name);
        console.log('Images Array:', product.images);
        console.log('Images Length:', product.images ? product.images.length : 0);
        console.log('Sizes:', product.sizes);
        console.log('Colors:', product.colors);
        console.log('--- End ---');

    } catch (err) {
        console.error('Error:', err.message);
    }
}

verify();
