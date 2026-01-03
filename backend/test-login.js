const axios = require('axios');

async function testLogin(email, password) {
    try {
        console.log(`Attempting login for: ${email}`);
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            email,
            password
        });
        console.log('Login Success:', response.data);
    } catch (error) {
        console.log('Login Failed:', error.response?.data || error.message);
    }
}

// Test with the faculty email found in DB
testLogin('arjunphj@gmail.com', 'somepassword');
