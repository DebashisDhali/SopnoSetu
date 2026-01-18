const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
const Payment = require('./models/Payment');
const MentorProfile = require('./models/MentorProfile');

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const payments = await Payment.find({ status: 'completed' });
    const incoming = payments.filter(p => p.type === 'session_booking' || p.type === 'subscription');
    const totalRev = incoming.reduce((a,c) => a + c.amount, 0);
    const totalComm = incoming.reduce((a,c) => a + (c.adminCommission || 0), 0);
    
    const mentors = await MentorProfile.find({});
    const totalPending = mentors.reduce((a,c) => a + (c.walletBalance || 0), 0);

    console.log('--- ADMIN FINANCIAL HEALTH ---');
    console.log('Total Revenue:', totalRev);
    console.log('Total Profit:', totalComm);
    console.log('Total Pending Payouts:', totalPending);
    
    mentors.forEach(m => {
        if(m.walletBalance > 0) {
            console.log(`Mentor Pending: ${m.user} | Balance: ${m.walletBalance}`);
        }
    });
    
    process.exit();
}
check();
