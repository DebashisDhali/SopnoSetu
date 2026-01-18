require('dotenv').config();
const sendEmail = require('./utils/sendEmail');

const testEmail = async () => {
    console.log("Attempting to send test email...");
    console.log("SMTP_EMAIL:", process.env.SMTP_EMAIL);
    // console.log("SMTP_PASSWORD:", process.env.SMTP_PASSWORD); // Security risk to log, but good for local debug if needed. Keeping hidden for now.

    try {
        await sendEmail({
            email: 'dhalisurjo30@gmail.com', // Test sending to the specific user
            subject: 'Test Email from SopnoSetu Debugger (To Candidate)',
            message: 'If you receive this, sending to external addresses works.',
        });
        console.log("Test email sent successfully!");
    } catch (error) {
        console.error("Test email FAILED:");
        console.error(error);
    }
};

testEmail();
