const Groq = require("groq-sdk");
const dotenv = require("dotenv");

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

/**
 * Get a chat completion from Groq using JSON mode.
 * @param {string} prompt - The prompt to send to Groq.
 * @param {string} modelName - The model to use (default: llama-3.3-70b-versatile).
 * @returns {Promise<string>} - The JSON response text.
 */
async function getGroqChatCompletion(prompt, modelName = "llama-3.3-70b-versatile") {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: modelName,
            response_format: { type: "json_object" },
        });

        return chatCompletion.choices[0].message.content;
    } catch (error) {
        console.error("Groq API Error:", error);
        throw error;
    }
}

module.exports = { getGroqChatCompletion };
