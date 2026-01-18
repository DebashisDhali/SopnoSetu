const mongoose = require('mongoose');

const mentorProfileSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    university: { type: String, required: true },
    universityEmail: { type: String }, // New field
    department: { type: String, required: true },
    bio: { type: String },
    expertise: [{ type: String }],
    hourlyRate: { type: Number, default: 0 },
    availability: [{
        day: String, // e.g., "Monday"
        startTime: String, // "10:00 AM"
        endTime: String // "12:00 PM"
    }],
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    earnings: { type: Number, default: 0 }, // Total lifelong earnings
    walletBalance: { type: Number, default: 0 }, // Current amount withdrawable
    meetingLink: { type: String, default: "" },
    paymentMethods: [{ type: String }], // Changed to array
    paymentNumber: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model('MentorProfile', mentorProfileSchema);
