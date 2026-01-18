const testForgotPassword = async () => {
    try {
        console.log("Testing Forgot Password API...");
        const response = await fetch('http://localhost:5000/api/auth/forgotpassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'dhalisurjo30@gmail.com'
            })
        });
        
        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", data);
    } catch (error) {
        console.error("Fetch Error:", error);
    }
};

testForgotPassword();
