const mongoose = require('mongoose');

const sessionSchema = mongoose.Schema({
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startTime: { type: Date, required: true },
    duration: { type: Number, required: true }, // in minutes
    status: { type: String, enum: ['pending', 'accepted', 'approved', 'completed', 'cancelled'], default: 'pending' },
    paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
    amount: { type: Number, default: 0 }, // Store fee at time of booking
    meetingLink: { type: String },
    notes: { type: String },
    slotId: { type: String },
    isSubscription: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
