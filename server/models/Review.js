const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
