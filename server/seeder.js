const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const MentorProfile = require('./models/MentorProfile');
const Session = require('./models/Session');
const Review = require('./models/Review');
const bcrypt = require('bcryptjs');

dotenv.config();

connectDB();

const importData = async () => {
    try {
        await User.deleteMany();
        await MentorProfile.deleteMany();
        await Session.deleteMany();
        await Review.deleteMany();

        console.log('Data Destroyed...');

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('123456', salt); // Default password

        // 1. Create Admin
        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password_hash_placeholder', // Will be hashed by pre-save if I used create properly with save middleware, but here I bypassed it? 
            // Wait, User.create triggers save middleware.
            // So I should pass plain text password if my model handles hashing.
            // My model: userSchema.pre('save', ... hash password).
            // So:
            password: '123456', 
            role: 'admin',
            verified: true,
        });

        // 2. Create Mentors
        const mentor1 = await User.create({
            name: 'Arafat Rahman',
            email: 'arafat@du.ac.bd',
            password: '123456',
            role: 'mentor',
            verified: true,
            isMentorVerified: true,
            profilePic: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200&h=200'
        });

        const mentorProfile1 = await MentorProfile.create({
            user: mentor1._id,
            university: 'Dhaka University',
            department: 'Computer Science',
            bio: 'Senior year CSE student. Expert in Math and Physics admission tests.',
            hourlyRate: 500,
            rating: 4.8,
            reviewsCount: 12,
            availability: [{ day: 'Friday', startTime: '10:00', endTime: '12:00' }],
        });

        const mentor2 = await User.create({
            name: 'Sadia Islam',
            email: 'sadia@dmc.gov.bd',
            password: '123456',
            role: 'mentor',
            verified: true,
            isMentorVerified: true,
            profilePic: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200'
        });

        const mentorProfile2 = await MentorProfile.create({
            user: mentor2._id,
            university: 'Dhaka Medical College',
            department: 'MBBS',
            bio: 'Medical admission specialist. Biology expert.',
            hourlyRate: 600,
            rating: 5.0,
            reviewsCount: 8,
        });

        const mentor3 = await User.create({
            name: 'Rahim Uddin',
            email: 'rahim@buet.ac.bd',
            password: '123456',
            role: 'mentor',
            verified: true,
            isMentorVerified: false, // Not verified yet
        });

        const mentorProfile3 = await MentorProfile.create({
            user: mentor3._id,
            university: 'BUET',
            department: 'EEE',
            bio: 'Engineering passion.',
            hourlyRate: 550,
            rating: 0,
            reviewsCount: 0,
        });

        // 3. Create Candidates
        const candidate1 = await User.create({
            name: 'Karim Ahmed',
            email: 'karim@gmail.com',
            password: '123456',
            role: 'candidate',
            verified: true,
        });

        // 4. Create Reviews for Mentor 1
        await Review.create([
            {
                mentor: mentor1._id,
                candidate: candidate1._id,
                rating: 5,
                comment: "Arafat is an amazing mentor! His math tricks are legendary. Highly recommended for DU admission."
            },
            {
                mentor: mentor1._id,
                candidate: adminUser._id, // Using admin as a proxy candidate for seeding
                rating: 4,
                comment: "Very helpful session. Explained complex physics concepts in a very simple way."
            }
        ]);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
