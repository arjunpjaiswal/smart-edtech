const express = require('express');
const router = express.Router();
const { db } = require('../firebase');

// Mark attendance for today or a specific date
router.post('/mark', async (req, res) => {
    try {
        const { userId, date, status, userName, role } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const attendanceDate = date || new Date().toISOString().split('T')[0];

        // Define a unique ID for this user + date to prevent duplicates
        const attendanceId = `${userId}_${attendanceDate}`;
        const attendanceRef = db.collection('attendance').doc(attendanceId);

        const record = {
            userId,
            userName: userName || 'Unknown',
            role: role || 'student',
            date: attendanceDate,
            status: status || 'present',
            timestamp: new Date().toISOString()
        };

        await attendanceRef.set(record, { merge: true });
        res.status(200).json({ success: true, record });
    } catch (error) {
        console.error('Mark Attendance Error:', error);
        res.status(500).json({ error: 'Failed to mark attendance' });
    }
});

// Get attendance records for a specific user
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const snapshot = await db.collection('attendance')
            .where('userId', '==', userId)
            .get();

        const records = snapshot.docs.map(doc => doc.data());
        res.json(records);
    } catch (error) {
        console.error('Fetch Attendance Error:', error);
        res.status(500).json({ error: 'Failed to fetch attendance records' });
    }
});

module.exports = router;
