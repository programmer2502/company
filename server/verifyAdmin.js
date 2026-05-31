const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const admin = await User.findOne({ username: 'admin' });
        if (admin) {
            const isMatch = await admin.matchPassword('manner');
            console.log(`Admin found: ${!!admin}`);
            console.log(`Password match 'manner': ${isMatch}`);
        } else {
            console.log('Admin NOT found');
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

run();
