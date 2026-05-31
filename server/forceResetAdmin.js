const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Force delete existing admin to ensure clean slate
        await User.deleteOne({ username: 'admin' });
        console.log('Deleted existing admin');

        const newAdmin = new User({
            username: 'admin',
            email: 'admin@luxe.com',
            password: 'manner', // Plain text here, will be hashed by pre-save
            role: 'admin'
        });

        await newAdmin.save();
        console.log('Created fresh admin with password: manner');

        // Verify
        const verify = await User.findOne({ username: 'admin' });
        console.log('Verification match:', await verify.matchPassword('manner'));

    } catch (error) {
        console.error(error);
    } finally {
        process.exit();
    }
};

run();
