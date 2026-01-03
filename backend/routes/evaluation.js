const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const { db } = require('../firebase');
const { getGroqChatCompletion } = require('../groq');

const csvFilePath = path.join(__dirname, '../evaluations.csv');

// Initialize CSV Writer
const csvWriter = createCsvWriter({
    path: csvFilePath,
    append: fs.existsSync(csvFilePath),
    header: [
        { id: 'studentName', title: 'STUDENT_NAME' },
        { id: 'assignmentId', title: 'ASSIGNMENT_ID' },
        { id: 'totalScore', title: 'TOTAL_SCORE' },
        { id: 'weakPoints', title: 'WEAK_POINTS' },
        { id: 'timestamp', title: 'TIMESTAMP' }
    ]
});

// Submit student answer for evaluation
router.post('/submit', async (req, res) => {
    try {
        const { studentAnswers, assignmentId, studentId, studentName } = req.body;

        if (!studentAnswers || !assignmentId) {
            return res.status(400).json({ error: 'Missing required data' });
        }

        // Fetch the original assignment/questions to get ideal answers
        const assignmentRef = db.collection('assignments').doc(assignmentId);
        const doc = await assignmentRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        const assignmentData = doc.data();

        const prompt = `
            Evaluate the following student answers against the ideal answers provided. 
            ${assignmentData.isManual ? "IMPORTANT: This is a Teacher-Set Assessment. Use the provided 'idealAnswer' as the absolute GROUND TRUTH for grading." : "Focus on identifying specific conceptual gaps and weak points in the student's understanding."}
            
            Context: ${assignmentData.subject} (${assignmentData.grade}) ${assignmentData.topic ? ` - Topic: ${assignmentData.topic}` : ""}
            
            Original Questions & Ideal Answers:
            ${JSON.stringify(assignmentData.questions.subjective || assignmentData.questions.mcqs)}
            
            Student Answers:
            ${JSON.stringify(studentAnswers)}
            
            Return output as JSON: 
            { 
              "totalScore": number, 
              "weakPoints": ["topic 1", "topic 2"], 
              "evaluations": [ 
                { "question": string, "score": number, "feedback": string, "suggestedTopic": string } 
              ] 
            }
        `;

        const cleanText = await getGroqChatCompletion(prompt);

        let evaluation;
        try {
            // Using JSON mode ensures clean output
            evaluation = JSON.parse(cleanText);
        } catch (parseError) {
            console.error('Initial JSON Parse Error:', parseError);
            const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    evaluation = JSON.parse(jsonMatch[0]);
                } catch (innerError) {
                    throw new Error('AI analysis failed to produce readable data. Please try again.');
                }
            } else {
                throw new Error('AI analysis failed to produce readable data. Please try again.');
            }
        }

        if (evaluation && evaluation.evaluations) {
            // Aggregation fallback for weakPoints
            if (!evaluation.weakPoints || (Array.isArray(evaluation.weakPoints) && evaluation.weakPoints.length === 0)) {
                const topics = evaluation.evaluations
                    .map(ev => ev.suggestedTopic)
                    .filter(t => t && t.trim().length > 0);
                evaluation.weakPoints = [...new Set(topics)];
            }
        }

        // Save evaluation to Firestore
        const evalRef = await db.collection('evaluations').add({
            assignmentId,
            studentId,
            studentName,
            evaluation,
            submittedAt: new Date().toISOString()
        });

        // Store in CSV
        try {
            await csvWriter.writeRecords([{
                studentName,
                assignmentId,
                totalScore: evaluation.totalScore || 0,
                weakPoints: Array.isArray(evaluation.weakPoints) ? evaluation.weakPoints.join(', ') : '',
                timestamp: new Date().toISOString()
            }]);
            console.log('Evaluation logged to CSV.');
        } catch (csvError) {
            console.error('Error writing to CSV:', csvError);
        }

        res.json({ id: evalRef.id, ...evaluation });
    } catch (error) {
        console.error('Error evaluating assignment:', error);
        res.status(500).json({ error: 'Evaluation failed', details: error.message });
    }
});

// Get stats for a specific assignment
router.get('/stats/:assignmentId', async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const evalsSnapshot = await db.collection('evaluations')
            .where('assignmentId', '==', assignmentId)
            .get();

        if (evalsSnapshot.empty) {
            return res.json({
                totalSubmissions: 0,
                averageScore: 0,
                commonWeakPoints: []
            });
        }

        let totalScore = 0;
        const weakPointCounts = {};
        const questionStats = {}; // Map of question text -> { scoreSum, count, feedbackList, suggestedTopic }

        evalsSnapshot.forEach(doc => {
            const data = doc.data();
            totalScore += data.evaluation.totalScore || 0;

            // Per-student weak points
            if (Array.isArray(data.evaluation.weakPoints)) {
                data.evaluation.weakPoints.forEach(wp => {
                    weakPointCounts[wp] = (weakPointCounts[wp] || 0) + 1;
                });
            }

            // Granular question evaluations
            if (Array.isArray(data.evaluation.evaluations)) {
                data.evaluation.evaluations.forEach(ev => {
                    const qKey = ev.question.trim();
                    if (!questionStats[qKey]) {
                        questionStats[qKey] = {
                            question: ev.question,
                            scoreSum: 0,
                            count: 0,
                            feedback: [],
                            topic: ev.suggestedTopic
                        };
                    }
                    questionStats[qKey].scoreSum += ev.score || 0;
                    questionStats[qKey].count += 1;
                    if (ev.feedback) questionStats[qKey].feedback.push(ev.feedback);
                });
            }
        });

        const commonWeakPoints = Object.entries(weakPointCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([topic, count]) => ({ topic, count }));

        // Format question insights
        const questionInsights = Object.values(questionStats).map(qs => ({
            question: qs.question,
            averageScore: (qs.scoreSum / qs.count).toFixed(1),
            submissionCount: qs.count,
            topic: qs.topic,
            isCriticallyHard: (qs.scoreSum / (qs.count * 10)) < 0.5, // Assuming scores out of 10
            topFeedback: qs.feedback.slice(0, 3) // Sample of common feedback
        })).sort((a, b) => a.averageScore - b.averageScore); // Hardest questions first

        res.json({
            totalSubmissions: evalsSnapshot.size,
            averageScore: (totalScore / evalsSnapshot.size).toFixed(1),
            commonWeakPoints,
            questionInsights
        });
    } catch (error) {
        console.error('Error fetching assignment stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Get global dashboard stats for teacher
router.get('/all-stats', async (req, res) => {
    try {
        const evalsSnapshot = await db.collection('evaluations').get();
        const assignmentsSnapshot = await db.collection('assignments').get();

        const stats = {
            totalSubmissions: evalsSnapshot.size,
            totalStudents: new Set(evalsSnapshot.docs.map(d => d.data().studentId)).size,
            averageScore: 0,
            weakPointHeatmap: {},
            assignmentPerformance: []
        };

        let totalScoreSum = 0;
        const assignmentMap = {};

        assignmentsSnapshot.forEach(doc => {
            assignmentMap[doc.id] = { id: doc.id, subject: doc.data().subject, scoreSum: 0, count: 0 };
        });

        evalsSnapshot.forEach(doc => {
            const data = doc.data();
            const score = data.evaluation.totalScore || 0;
            totalScoreSum += score;

            if (assignmentMap[data.assignmentId]) {
                assignmentMap[data.assignmentId].scoreSum += score;
                assignmentMap[data.assignmentId].count += 1;
            }

            if (Array.isArray(data.evaluation.weakPoints)) {
                data.evaluation.weakPoints.forEach(wp => {
                    stats.weakPointHeatmap[wp] = (stats.weakPointHeatmap[wp] || 0) + 1;
                });
            }
        });

        stats.averageScore = evalsSnapshot.size > 0 ? (totalScoreSum / evalsSnapshot.size).toFixed(1) : 0;
        stats.assignmentPerformance = Object.values(assignmentMap)
            .filter(a => a.count > 0)
            .map(a => ({
                id: a.id,
                subject: a.subject,
                averageScore: (a.scoreSum / a.count).toFixed(1),
                submissions: a.count
            }));

        res.json(stats);
    } catch (error) {
        console.error('Error fetching global stats:', error);
        res.status(500).json({ error: 'Failed to fetch global stats' });
    }
});

// Generate Remediation Explanation
router.post('/remediate', async (req, res) => {
    try {
        const { topic, context } = req.body;

        const prompt = `
            Provide a short, encouraging, and clear conceptual explanation for a student who is struggling with "${topic}".
            Context of the subject: ${context}
            
            Format:
            {
              "topic": "${topic}",
              "explanation": "2-3 sentences explaining the core concept clearly.",
              "proTip": "One quick tip or mental model to remember this better.",
              "example": "A simple real-world example."
            }
            Return ONLY JSON.
        `;

        const cleanText = await getGroqChatCompletion(prompt);
        let remediation;
        try {
            remediation = JSON.parse(cleanText);
        } catch (e) {
            const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
            remediation = JSON.parse(jsonMatch[0]);
        }

        res.json(remediation);
    } catch (error) {
        res.status(500).json({ error: 'Remediation generation failed' });
    }
});

// Get summary for a specific student
router.get('/student-summary/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const evalsSnapshot = await db.collection('evaluations')
            .where('studentId', '==', studentId)
            .get();

        if (evalsSnapshot.empty) {
            return res.json({
                totalAssignments: 0,
                weakPoints: [],
                recentScores: []
            });
        }

        const weakPointCounts = {};
        const recentScores = [];

        evalsSnapshot.forEach(doc => {
            const data = doc.data();
            recentScores.push({
                date: data.submittedAt,
                score: data.evaluation.totalScore
            });
            if (Array.isArray(data.evaluation.weakPoints)) {
                data.evaluation.weakPoints.forEach(wp => {
                    weakPointCounts[wp] = (weakPointCounts[wp] || 0) + 1;
                });
            }
        });

        const weakPoints = Object.entries(weakPointCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([topic, count]) => ({ topic, count }));

        res.json({
            totalAssignments: evalsSnapshot.size,
            weakPoints,
            recentScores: recentScores.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
        });
    } catch (error) {
        console.error('Error fetching student summary:', error);
        res.status(500).json({ error: 'Failed to fetch student summary' });
    }
});

module.exports = router;

