const express = require('express');
const router = express.Router();
const { db } = require('../firebase');

// Post a new announcement
router.post('/create', async (req, res) => {
    try {
        const { title, content, author, priority } = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        const announcement = {
            title,
            content,
            author: author || 'Faculty',
            priority: priority || 'normal', // normal, important, urgent
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection('announcements').add(announcement);
        res.status(201).json({ id: docRef.id, ...announcement });
    } catch (error) {
        console.error('Create Announcement Error:', error);
        res.status(500).json({ error: 'Failed to post announcement' });
    }
});

// Get all announcements
router.get('/list', async (req, res) => {
    try {
        const snapshot = await db.collection('announcements').orderBy('createdAt', 'desc').get();
        const announcements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(announcements);
    } catch (error) {
        console.error('List Announcements Error:', error);
        res.status(500).json({ error: 'Failed to fetch announcements' });
    }
});

module.exports = router;
