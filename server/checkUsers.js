const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const users = await User.find({});
        console.log('--- ALL USERS ---');
        users.forEach(u => {
            console.log(`Username: ${u.username}, Role: ${u.role}, Email: ${u.email}, Hash: ${u.password.substring(0, 10)}...`);
        });
        console.log('-----------------');

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

run();
