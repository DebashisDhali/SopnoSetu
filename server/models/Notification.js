const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['session_request', 'session_accepted', 'session_cancelled', 'new_message', 'review_received', 'system'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String }, // URL to redirect when clicked
    isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
