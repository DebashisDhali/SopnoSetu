// Test Registration Endpoint
const axios = require('axios');

const testRegistration = async () => {
    try {
        console.log('Testing student registration...');
        
        const response = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Test Student',
            email: `test${Date.now()}@example.com`,
            password: 'password123',
            role: 'candidate'
        });
        
        console.log('✅ Registration successful!');
        console.log('Response:', response.data);
        return true;
    } catch (error) {
        console.error('❌ Registration failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Error:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
        return false;
    }
};

testRegistration();
