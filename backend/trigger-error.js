const axios = require('axios');

async function triggerError() {
    try {
        console.log("Triggering /api/class/list-materials...");
        const response = await axios.get('http://localhost:5000/api/class/list-materials');
        console.log("Response:", response.data);
    } catch (error) {
        console.error("Error Response Data:", error.response?.data);
        console.error("Error Message:", error.message);
    }
}

triggerError();
