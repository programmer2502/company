const axios = require('axios');
const fs = require('fs');

async function verify() {
    try {
        const id = '699618994970df10cba43cbd';
        const url = `https://company-3qjr.onrender.com/api/products?_id=${id}`;
        const res = await axios.get(url);
        const product = Array.isArray(res.data) ? res.data[0] : res.data;

        fs.writeFileSync('server_response.json', JSON.stringify(product, null, 2));
        console.log('Response saved to server_response.json');

    } catch (err) {
        console.error('Error:', err.message);
    }
}

verify();
