const mongoose = require('mongoose');

const settingsSchema = mongoose.Schema({
    commissionRate: { type: Number, default: 20 }, // in percentage
    adminPaymentNumber: { type: String, default: "01700000000" }, // Central payment number
    // Subscription Pricing
    monthlyPrice: { type: Number, default: 500 },
    yearlyPrice: { type: Number, default: 5000 },
    // Subscription Feature Limits
    monthlyMentorLimit: { type: Number, default: 2 },
    yearlyMentorLimit: { type: Number, default: 5 },
    monthlySessionLimit: { type: Number, default: 10 },
    yearlySessionLimit: { type: Number, default: 100 },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
