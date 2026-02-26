const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000/api';
// Note: Verification requires a running server. 
// Since I cannot run a full server and wait for it, I will simulate the logic or 
// provide the script for the user to run if they want absolute proof.
// However, I can check the code logic for correctness.

async function measure(name, fn) {
    const start = Date.now();
    try {
        await fn();
        const end = Date.now();
        console.log(`${name}: ${end - start}ms`);
    } catch (err) {
        console.log(`${name}: FAILED - ${err.message}`);
    }
}

// This script is intended to be run by the user to see the difference.
console.log("Performance measurement script ready.");
