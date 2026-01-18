const { getNotifications } = require('./controllers/notificationController');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const req = {
            user: { _id: new mongoose.Types.ObjectId() } // Dummy user
        };
        const res = {
            status: function(s) { this.statusCode = s; return this; },
            json: function(j) { console.log('Response Status:', this.statusCode || 200); console.log('Response Body:', JSON.stringify(j)); }
        };
        
        console.log('Running getNotifications...');
        await getNotifications(req, res);
        
        process.exit(0);
    } catch (error) {
        console.error('Test FAILED:', error);
        process.exit(1);
    }
};

test();
