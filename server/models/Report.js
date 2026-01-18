const mongoose = require('mongoose');

const reportSchema = mongoose.Schema({
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional, could report a system issue
    reason: { type: String, required: true },
    details: { type: String },
    status: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
