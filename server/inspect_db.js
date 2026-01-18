const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
const envPath = path.join(__dirname, '.env');
console.log('Loading env from:', envPath);
dotenv.config({ path: envPath });

const User = require('./models/User');
const MentorProfile = require('./models/MentorProfile');
const Session = require('./models/Session');
const Payment = require('./models/Payment');

const inspect = async () => {
    try {
        console.log('Connecting to MONGO_URI...');
        if (!process.env.MONGO_URI) {
            console.error('MONGO_URI is not defined in .env');
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const mentors = await MentorProfile.find({}).populate('user');
        console.log(`Found ${mentors.length} mentor profiles`);

        for (const m of mentors) {
            console.log(`--- Mentor: ${m.user?.name} (${m.user?._id}) ---`);
            console.log(`Verified: ${m.user?.isMentorVerified}`);
            console.log(`Wallet Balance: ${m.walletBalance}`);
            
            const sessions = await Session.find({ mentor: m.user?._id });
            console.log(`Total Sessions found: ${sessions.length}`);
            
            const incomePayments = await Payment.find({ mentor: m.user?._id, type: 'session_booking' });
            const payouts = await Payment.find({ mentor: m.user?._id, type: 'payout' });
            
            console.log(`Income Payments: ${incomePayments.length}`);
            console.log(`Payouts: ${payouts.length}`);
            
            let calculatedBalance = 0;
            for(const p of incomePayments) {
                calculatedBalance += (p.mentorAmount || 0);
            }
            for(const p of payouts) {
                calculatedBalance -= (p.amount || 0);
            }

            console.log(`Calculated Balance (Income - Payouts): ${calculatedBalance}`);
            
            if (Math.abs(calculatedBalance - m.walletBalance) > 0.1) {
                console.log(`!!! DISCREPANCY DETECTED !!!`);
                // Uncomment to fix
                // m.walletBalance = calculatedBalance;
                // await m.save();
                // console.log(`Fixed balance for ${m.user?.name}`);
            }
        }

        process.exit();
    } catch (err) {
        console.error('Script Error:', err);
        process.exit(1);
    }
};

inspect();
