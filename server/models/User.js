const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['candidate', 'mentor', 'admin'], default: 'candidate' },
    phone: { type: String },
    verified: { type: Boolean, default: false }, // For basic email verification
    isMentorVerified: { type: Boolean, default: false }, // For mentor approval
    studentIdUrl: { type: String }, // For verification
    subscriptionPlan: { type: String, enum: ['free', 'monthly', 'yearly'], default: 'free' },
    subscriptionExpires: { type: Date },
    subscribedMentors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    sessionsUsed: { type: Number, default: 0 },
    profilePic: { type: String, default: "" },
    bio: { type: String, default: "" },
    university: { type: String, default: "" },
    department: { type: String, default: "" },
    title: { type: String, default: "Admission Candidate" }, // E.g. "HSC Student", "Parent"
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, { timestamps: true });

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 Minutes

    return resetToken;
};

module.exports = mongoose.model('User', userSchema);
