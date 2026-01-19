const User = require('../models/User');
const MentorProfile = require('../models/MentorProfile');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, university, department, studentIdUrl } = req.body;

        // Validate request
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            const roleName = userExists.role === 'mentor' ? 'a Mentor' : 'a Student';
            return res.status(400).json({ 
                message: `This email is already registered as ${roleName}. You cannot use the same email for a new account.` 
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'candidate',
            title: req.body.title || (role === 'mentor' ? 'Mentor' : 'Admission Candidate'), // Save provided title or default
            studentIdUrl: studentIdUrl || null,
        });

        // If user is a mentor, create a MentorProfile
        if (role === 'mentor') {
            await MentorProfile.create({
                user: user._id,
                university: university || 'Unknown',
                department: department || 'Unknown',
            });
        }

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isMentorVerified: user.isMentorVerified,
            token: generateToken(user._id),
        });

        console.log('=== REGISTRATION SUCCESSFUL ===');
    } catch (error) {
        console.error('Registration Error:', error.message);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('=== LOGIN ATTEMPT ===');
        console.log('Email:', email);

        // Check for user email
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            console.log('Login successful for:', email);
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isMentorVerified: user.isMentorVerified,
                token: generateToken(user._id),
            });
        } else {
            console.log('Login failed - invalid credentials');
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('subscribedMentors', 'name email profilePic');
        res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isMentorVerified: user.isMentorVerified,
            subscriptionPlan: user.subscriptionPlan,
            subscriptionExpires: user.subscriptionExpires,
            subscribedMentors: user.subscribedMentors || [],
        });
    } catch (error) {
        console.error("GetMe Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get user by ID
// @route   GET /api/auth/users/:id
// @access  Private
const getUserById = async (req, res) => {
    try {
const user = await User.findById(req.params.id)
            .select('name email role profilePic phone bio university department isMentorVerified subscriptionPlan subscriptionExpires subscribedMentors')
            .populate('subscribedMentors', 'name email profilePic');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
            user.profilePic = req.body.profilePic !== undefined ? req.body.profilePic : user.profilePic;
            user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
            user.university = req.body.university !== undefined ? req.body.university : user.university;
            user.department = req.body.department !== undefined ? req.body.department : user.department;

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                bio: updatedUser.bio,
                profilePic: updatedUser.profilePic,
                phone: updatedUser.phone,
                university: updatedUser.university,
                department: updatedUser.department,
                isMentorVerified: updatedUser.isMentorVerified,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};


// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false }); // Bypass validation for new fields if any

        // Create reset url
        // In local dev it might be localhost:3000, in prod it's the domain
        // We assume CLIENT_URL env var or fallback
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

        try {
            console.log("Attempting to send reset email from:", process.env.SMTP_EMAIL);
            await sendEmail({
                email: user.email,
                subject: 'SopnoSetu Password Reset Token',
                message,
            });

            res.status(200).json({ success: true, data: 'Email sent' });
        } catch (error) {
            const fs = require('fs');
            fs.writeFileSync('debug_email_error.log', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
            console.error("Email send error FULL:", error);
            console.error("Error Code:", error.code);
            console.error("Error Command:", error.command);
            
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({ validateBeforeSave: false });

            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = async (req, res) => {
    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            data: 'Password Updated Success',
            token: generateToken(user._id), // Optional: log them in immediately
        });
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    getUserById,
    updateProfile,
    forgotPassword,
    resetPassword
};
