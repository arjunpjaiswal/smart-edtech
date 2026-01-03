const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const { db } = require('../firebase');

const upload = multer({ storage: multer.memoryStorage() });

// Schedule a new class
router.post('/schedule', async (req, res) => {
    try {
        const { className, title, time, grade, subject, instructor, roomId } = req.body;
        const newClass = {
            title: title || className,
            className: className || title,
            time,
            grade: grade || 'N/A',
            subject: subject || 'N/A',
            instructor: instructor || 'Unknown',
            roomId: roomId || `Room_${Date.now()}`,
            status: 'Scheduled',
            students: 0,
            createdAt: new Date().toISOString(),
            meetingUrl: `https://meet.jit.si/${(title || className).replace(/\s+/g, '-')}-${Date.now()}`
        };

        const docRef = await db.collection('classes').add(newClass);
        res.json({ id: docRef.id, ...newClass });
    } catch (error) {
        console.error('Schedule Error:', error);
        res.status(500).json({ error: 'Failed to schedule class' });
    }
});

// Get all classes
router.get('/list', async (req, res) => {
    try {
        const snapshot = await db.collection('classes').orderBy('createdAt', 'desc').get();
        const classes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(classes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch classes' });
    }
});

// Save study material/questions to Firestore
router.post('/save-material', async (req, res) => {
    try {
        const { questions, grade, subject, difficulty } = req.body;
        const material = {
            questions,
            grade,
            subject,
            difficulty,
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection('assignments').add(material);
        res.json({ id: docRef.id, ...material });
    } catch (error) {
        console.error('Error saving material:', error);
        res.status(500).json({ error: 'Failed to save material' });
    }
});

// Get all materials/assignments
router.get('/list-materials', async (req, res) => {
    try {
        const snapshot = await db.collection('assignments').orderBy('createdAt', 'desc').get();
        const materials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(materials);
    } catch (error) {
        console.error('Error fetching materials:', error);
        res.status(500).json({ error: 'Failed to fetch materials' });
    }
});

// --- POLLS ---

// Create a poll
router.post('/poll', async (req, res) => {
    try {
        const { roomId, question, options } = req.body;
        const poll = {
            roomId,
            question,
            options: options.map(opt => ({ text: opt, votes: 0 })),
            active: true,
            createdAt: new Date().toISOString()
        };
        const docRef = await db.collection('polls').add(poll);
        res.json({ id: docRef.id, ...poll });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create poll' });
    }
});

// Get active poll for a room
router.get('/poll/:roomId', async (req, res) => {
    try {
        const { roomId } = req.params;
        const snapshot = await db.collection('polls')
            .where('roomId', '==', roomId)
            .where('active', '==', true)
            .get();
        if (snapshot.empty) return res.json(null);

        // Sort in memory to avoid index requirements
        const polls = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        polls.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json(polls[0]);
    } catch (error) {
        console.error('Fetch poll error:', error);
        res.status(500).json({ error: 'Failed to fetch poll' });
    }
});

// Vote in a poll
router.post('/poll/vote', async (req, res) => {
    try {
        const { pollId, optionIndex } = req.body;
        const pollRef = db.collection('polls').doc(pollId);
        const poll = await pollRef.get();
        if (!poll.exists) return res.status(404).json({ error: 'Poll not found' });

        const data = poll.data();
        data.options[optionIndex].votes += 1;
        await pollRef.update({ options: data.options });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to vote' });
    }
});

// --- DISCUSSION ---

// Post a message
router.post('/discussion', async (req, res) => {
    try {
        const { roomId, user, text } = req.body;
        const message = {
            roomId,
            user,
            text,
            createdAt: new Date().toISOString()
        };
        await db.collection('discussions').add(message);
        res.json(message);
    } catch (error) {
        res.status(500).json({ error: 'Failed to post message' });
    }
});

// Get recent messages
router.get('/discussion/:roomId', async (req, res) => {
    try {
        const { roomId } = req.params;
        const snapshot = await db.collection('discussions')
            .where('roomId', '==', roomId)
            .get();

        // Sort in memory to avoid index requirements
        const messages = snapshot.docs.map(doc => doc.data());
        messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        res.json(messages.slice(-50)); // Return last 50
    } catch (error) {
        console.error('Fetch discussion error:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// --- STUDY MATERIALS (Subject-wise) ---

// Upload a study material (PDF)
router.post('/upload-study-material', upload.single('pdf'), async (req, res) => {
    try {
        const { subject, grade, title, description, uploadedBy } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'No PDF file provided' });
        }

        // Parse PDF to get text content for preview/search
        const pdfData = await pdfParse(req.file.buffer);
        const content = pdfData.text;

        // Save PDF to local filesystem
        const fileName = `${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`;
        const filePath = path.join(__dirname, '../uploads', fileName);
        fs.writeFileSync(filePath, req.file.buffer);

        const material = {
            title: title || req.file.originalname,
            description: description || '',
            subject: subject || 'General',
            grade: grade || 'All',
            uploadedBy: uploadedBy || 'Anonymous',
            content: content.substring(0, 5000), // Store first 5000 chars as preview
            fileName: req.file.originalname,
            fileSize: req.file.size,
            localPath: fileName, // Store just the filename for static serving
            createdAt: new Date().toISOString(),
            type: 'study-material'
        };

        const docRef = await db.collection('study_materials').add(material);
        res.status(201).json({ id: docRef.id, ...material });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: 'Failed to upload study material' });
    }
});

// List all study materials
router.get('/study-materials', async (req, res) => {
    try {
        const snapshot = await db.collection('study_materials').orderBy('createdAt', 'desc').get();
        const materials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(materials);
    } catch (error) {
        console.error('List Materials Error:', error);
        res.status(500).json({ error: 'Failed to fetch study materials' });
    }
});

// Download a study material
router.get('/download-material/:id', async (req, res) => {
    try {
        const doc = await db.collection('study_materials').doc(req.params.id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Material not found' });
        }

        const data = doc.data();
        if (!data.localPath) {
            return res.status(404).json({ error: 'File content not found on server' });
        }

        const filePath = path.join(__dirname, '../uploads', data.localPath);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File missing from server storage' });
        }

        res.download(filePath, data.fileName);
    } catch (error) {
        console.error('Download Error:', error);
        res.status(500).json({ error: 'Failed to process download' });
    }
});

module.exports = router;
