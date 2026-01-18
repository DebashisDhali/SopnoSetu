const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    transactionId: { type: String, required: true },
    paymentMethod: { type: String, enum: ['bkash', 'nagad', 'system'], required: true },
    type: { type: String, enum: ['subscription', 'session_booking', 'payout'], required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    reference: { type: mongoose.Schema.Types.ObjectId }, // ID of Session or Subscription plan
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Who gets the money
    mentorAmount: { type: Number, default: 0 },
    adminCommission: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
