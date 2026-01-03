const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { getGroqChatCompletion } = require('../groq');
const { getGeminiModel, generateFromPdf } = require('../gemini');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../debug.log');
function logDebug(msg) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logFile, `[${timestamp}] ${msg}\n`);
}

const upload = multer({ storage: multer.memoryStorage() });

router.post('/generate-questions', upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) {
            logDebug('No PDF file uploaded');
            return res.status(400).json({ error: 'No PDF file uploaded' });
        }

        const { grade, subject, difficulty, questionType } = req.body;
        logDebug(`Processing PDF for: ${grade}, ${subject}, ${difficulty}, ${questionType}`);
        logDebug(`File size: ${req.file.size} bytes`);
        logDebug(`Mimetype: ${req.file.mimetype}`);

        if (req.file.buffer && req.file.buffer.length > 4) {
            const header = req.file.buffer.toString('utf8', 0, 4);
            logDebug(`Buffer header: ${header}`);
            if (header !== '%PDF') {
                logDebug('WARNING: File does not start with %PDF');
            }
        }

        let data;
        let useNativeFallback = false;
        try {
            data = await pdfParse(req.file.buffer);
        } catch (parseError) {
            logDebug(`pdf-parse Error: ${parseError.message}. Will try Gemini native PDF parsing.`);
            useNativeFallback = true;
        }

        const rawText = data?.text || "";
        logDebug(`Extracted text length: ${rawText.length}`);

        if (!useNativeFallback && (!rawText || rawText.trim().length === 0)) {
            logDebug('PDF extraction empty. Will try Gemini native PDF parsing.');
            useNativeFallback = true;
        }

        const promptWithoutText = `
      As an expert educator, follow these strict steps to process the provided study material:

      STEP 1: ANALYZE CONTEXT
      - Target Grade Level: ${grade}
      - Subject Area: ${subject}
      - Cognitive Difficulty: ${difficulty}
      - Requested format: ${questionType}

      STEP 2: EXTRACT CORE KNOWLEDGE
      Identify the primary learning objectives and key concepts relevant to ${subject} at a ${grade} level from the attached material.

      STEP 3: SYNTHESIZE ASSESSMENT
      Generate a professional educational assessment based ONLY on the concepts found in the material.
      - Ensure questions are age-appropriate for ${grade}.
      - Match the ${difficulty} difficulty level precisely.
      
      STRICT FORMATTING RULES:
      - If requested format is 'MCQ', ONLY generate multiple choice questions in the 'mcqs' array. Set 'subjective' to [].
      - If requested format is 'Subjective', ONLY generate descriptive questions in the 'subjective' array. Set 'mcqs' to [].
      - If requested format is 'One-liner', generate very short-answer questions in the 'subjective' array. Set 'mcqs' to [].
      - If requested format is 'Mixed', provide a balanced variety (e.g., 3-4 MCQs and 2-3 Subjective).
      - IMPORTANT: Generate at least 5 questions in total.

      OUTPUT FORMAT:
      Return ONLY a valid JSON object with this structure:
      {
        "metadata": { "conceptsExtracted": [string] },
        "questions": {
          "mcqs": [{"question": string, "options": [string, string, string, string], "correctAnswer": string}],
          "subjective": [{"question": string, "idealAnswer": string}]
        }
      }
    `;

        const combinedPrompt = useNativeFallback ? promptWithoutText : `
      ${promptWithoutText}
      
      STEP 2 ADDITIONAL INFO: 
      Here is the extracted text from the PDF:
      ${rawText.substring(0, 10000)}
    `;

        let responseText;
        let usedModel = 'Groq';

        try {
            if (useNativeFallback) throw new Error("Triggering Native Fallback");
            logDebug('Attempting generation with Groq...');
            responseText = await getGroqChatCompletion(combinedPrompt);
            logDebug('Groq successful.');
        } catch (groqError) {
            logDebug(`Groq approach failed: ${groqError.message}. Using Gemini Native...`);
            usedModel = 'Gemini-Native';
            responseText = await generateFromPdf(req.file.buffer, promptWithoutText);
            logDebug('Gemini Native successful.');
        }

        const tryParse = (text) => {
            try {
                const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
                const parsed = JSON.parse(cleanText);
                return parsed.questions || parsed;
            } catch (e) {
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        const parsed = JSON.parse(jsonMatch[0]);
                        return parsed.questions || parsed;
                    } catch (ie) {
                        return null;
                    }
                }
                return null;
            }
        };

        let questions = tryParse(responseText);

        if (questions) {
            // STRICT ENFORCEMENT: Filter based on questionType
            if (questionType === 'MCQ') {
                questions.subjective = [];
                logDebug('Strict enforcement: Cleared subjective questions for MCQ type');
            } else if (questionType === 'Subjective' || questionType === 'One-liner') {
                questions.mcqs = [];
                logDebug(`Strict enforcement: Cleared MCQs for ${questionType} type`);
            }

            logDebug(`Successfully generated questions using ${usedModel}`);
            res.json({ questions, modelUsed: usedModel });
        } else if (usedModel === 'Groq') {
            logDebug('Groq returned invalid JSON. Retrying with Gemini fallback...');
            usedModel = 'Gemini';
            const model = getGeminiModel();
            const result = await model.generateContent(combinedPrompt);
            const geminiText = result.response.text();
            let geminiQuestions = tryParse(geminiText);

            if (geminiQuestions) {
                // STRICT ENFORCEMENT: Filter based on questionType
                if (questionType === 'MCQ') {
                    geminiQuestions.subjective = [];
                } else if (questionType === 'Subjective' || questionType === 'One-liner') {
                    geminiQuestions.mcqs = [];
                }
                logDebug('Gemini fallback successful after Groq JSON error.');
                res.json({ questions: geminiQuestions, modelUsed: 'Gemini' });
            } else {
                throw new Error('Both AI models failed to provide valid data format.');
            }
        } else {
            throw new Error('AI generation failed to produce a valid response.');
        }
    } catch (error) {
        logDebug(`CRITICAL ERROR: ${error.message}`);
        res.status(500).json({
            error: 'AI Generation Failed',
            details: error.message
        });
    }
});

module.exports = router;
