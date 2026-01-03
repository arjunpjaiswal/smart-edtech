const express = require('express');
const router = express.Router();
const { getGroqChatCompletion } = require('../groq');
const { db } = require('../firebase');

router.post('/study-buddy', async (req, res) => {
    try {
        const { messages, weakPoints, studentName } = req.body;
        const lastMessage = messages[messages.length - 1].content;

        // Fetch relevant study materials for "Ground Truth"
        console.log(`Searching Vault for context related to: ${lastMessage}`);
        const materialsSnapshot = await db.collection('study_materials').get();
        const allMaterials = materialsSnapshot.docs.map(doc => doc.data());

        // Simple keyword matching for relevance
        const keywords = lastMessage.toLowerCase().split(' ').filter(word => word.length > 3);
        const relevantMaterials = allMaterials.filter(m => {
            const text = (m.title + ' ' + m.content + ' ' + m.subject).toLowerCase();
            return keywords.some(k => text.includes(k));
        }).slice(0, 2); // Top 2 matches

        const vaultContext = relevantMaterials.length > 0
            ? `\nRELEVANT VAULT MATERIALS FOUND:\n${relevantMaterials.map(m => `Title: ${m.title}\nContent: ${m.content}`).join('\n---\n')}`
            : "\nNo specific facts found in the Study Vault for this query.";

        const systemPrompt = `
            You are "SmartEd Study Buddy", a friendly and encouraging AI tutor.
            Your goal is to help ${studentName} understand their weak points from recent assignments.
            
            UNIFIED KNOWLEDGE BASE (THE VAULT):
            ${vaultContext}
            
            Current Weak Points: ${weakPoints.map(wp => `${wp.topic} (struggled ${wp.count} times)`).join(', ')}
            
            Instructions:
            1. If relevant information is found in THE VAULT above, use it to answer factual questions and cite the document title.
            2. If this is the start of the chat, acknowledge their specific weak points and ask which one they want to discuss.
            3. Use simple analogies and encouraging language.
            4. Do not just give answers; guide them to understand the concepts.
            5. Keep responses relatively concise but thorough.
            
            Return output as JSON:
            {
                "reply": "your message here",
                "sourceDocs": ["title of document 1", "title of document 2"]
            }
        `;

        const fullPrompt = `System: ${systemPrompt}\n\nChat History:\n${messages.map(m => `${m.role}: ${m.content}`).join('\n')}\nAssistant:`;

        const responseText = await getGroqChatCompletion(fullPrompt);
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            result = JSON.parse(jsonMatch[0]);
        }

        res.json(result);
    } catch (error) {
        console.error('Study Buddy Error:', error);
        res.status(500).json({ error: 'Failed to chat with Study Buddy' });
    }
});

module.exports = router;
