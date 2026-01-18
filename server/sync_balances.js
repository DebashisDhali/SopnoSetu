const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const MentorProfile = require('./models/MentorProfile');
const Payment = require('./models/Payment');

const fix = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const mentors = await MentorProfile.find({}).populate('user');
        console.log(`Checking ${mentors.length} mentors...`);

        for (const m of mentors) {
            const userId = m.user?._id;
            if (!userId) continue;

            // Find all income for this mentor
            const incomePayments = await Payment.find({ mentor: userId, type: 'session_booking', status: 'completed' });
            const payouts = await Payment.find({ mentor: userId, type: 'payout', status: 'completed' });
            
            let totalIncome = 0;
            for(const p of incomePayments) {
                if (!p.mentorAmount) {
                    p.mentorAmount = p.amount * 0.8; // Default 80%
                    await p.save();
                }
                totalIncome += p.mentorAmount;
            }

            let totalPayouts = 0;
            for(const p of payouts) {
                totalPayouts += p.amount;
            }

            const correctBalance = totalIncome - totalPayouts;

            console.log(`[${m.user?.name}] Income: ${totalIncome}, Payouts: ${totalPayouts}, CurrentDB: ${m.walletBalance}`);
            
            if (Math.abs(correctBalance - m.walletBalance) > 0.1) {
                console.log(`updating balance to ${correctBalance}`);
                m.walletBalance = correctBalance;
                m.earnings = totalIncome; 
                await m.save();
            }
        }

        console.log('Done');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fix();
