const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding');
        await seedAdmin();
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    }
};

const fs = require('fs');

const seedAdmin = async () => {
    try {
        console.log('Clearing existing admin users...');
        await User.deleteMany({
            $or: [
                { username: 'admin' },
                { email: 'admin@gmail.com' }
            ]
        });

        console.log('Creating new admin user...');
        const admin = new User({
            username: 'admin',
            email: 'admin@gmail.com',
            password: 'Kishore@admin123',
            role: 'admin'
        });

        await admin.save();
        console.log('Admin user created successfully');

        fs.writeFileSync('seed_result.txt', 'Success');
        process.exit();
    } catch (error) {
        const errorMsg = 'Error seeding admin detailed: ' + error.message + '\nStack: ' + error.stack;
        console.error(errorMsg);
        fs.writeFileSync('seed_result.txt', errorMsg);
        process.exit(1);
    }
};

connectDB();
