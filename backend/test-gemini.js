const { getGeminiModel } = require('./gemini');
const dotenv = require('dotenv');
dotenv.config();

async function testGemini() {
    console.log("Testing Gemini API connection...");
    try {
        const model = getGeminiModel();
        const prompt = "Say 'Hello, I am working!'";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        console.log("Gemini Response:", response.text());
        console.log("SUCCESS: Gemini API is connected and working.");
    } catch (error) {
        console.error("FAILURE: Gemini API error:");
        console.error(error);
    }
}

testGemini();
