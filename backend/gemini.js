const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const getGeminiModel = (modelName = "gemini-2.0-flash") => {
    return genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
            responseMimeType: "application/json",
        }
    });
};

/**
 * Generate content from a PDF buffer using Gemini's native PDF support.
 */
async function generateFromPdf(buffer, prompt, modelName = "gemini-2.0-flash") {
    const model = getGeminiModel(modelName);
    const result = await model.generateContent([
        prompt,
        {
            inlineData: {
                data: buffer.toString("base64"),
                mimeType: "application/pdf",
            },
        },
    ]);
    return result.response.text();
}

module.exports = { getGeminiModel, generateFromPdf };
