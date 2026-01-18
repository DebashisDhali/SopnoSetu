const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Notification = require('./models/Notification');
const User = require('./models/User');

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('DB Connected');
        
        const count = await Notification.countDocuments();
        console.log('Notification Count:', count);
        
        const firstNotif = await Notification.findOne().lean();
        console.log('First Notification:', JSON.stringify(firstNotif));
        
        process.exit(0);
    } catch (error) {
        console.error('Test Error:', error);
        process.exit(1);
    }
};

test();
