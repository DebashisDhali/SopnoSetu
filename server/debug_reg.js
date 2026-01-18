const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const test = async () => {
    try {
        console.log('Connecting to DB...', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!');

        const email = `debug${Date.now()}@test.com`;
        console.log('Creating user with email:', email);
        
        // This is exactly what line 42 does in authController
        const user = await User.create({
            name: 'Debug User',
            email: email,
            password: 'password123',
            role: 'candidate',
            studentIdUrl: null,
        });

        console.log('SUCCESS! User created:', user._id);
        process.exit(0);
    } catch (error) {
        console.error('FAILED!');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        process.exit(1);
    }
};

test();
