const express = require('express');
const router = express.Router();
const { auth, db } = require('../firebase');

// Signup Route
router.post('/signup', async (req, res) => {
    try {
        let { email, password, name, role } = req.body;
        email = email.trim().toLowerCase();

        if (!email || !password || !name || !role) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create user in Firebase Auth
        const userRecord = await auth.createUser({
            email,
            password,
            displayName: name,
        });

        // Store additional info in Firestore
        await db.collection('users').doc(userRecord.uid).set({
            name,
            email,
            role,
            createdAt: new Date().toISOString(),
        });

        res.status(201).json({
            id: userRecord.uid,
            name,
            email,
            role
        });
    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Login Route (Note: Admin SDK doesn't verify passwords, 
// normally front-end Firebase Auth handles this, then sends UID/Token.
// For simplicity in this demo, we'll fetch the user by email or UID)
router.post('/login', async (req, res) => {
    try {
        let { email, password } = req.body;
        const cleanEmail = email.trim().toLowerCase();

        // In a real app with Firebase Client SDK, you'd verify password on front-end.
        // For this backend-focused multi-user logic, we'll fetch user info.
        const userRecord = await auth.getUserByEmail(cleanEmail);
        const userDoc = await db.collection('users').doc(userRecord.uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User profile not found' });
        }

        const userData = userDoc.data();

        // WARNING: This is a demo-level simplified login. 
        // Usually, you rely on Firebase Client SDK to verify user credentials.
        res.json({
            id: userRecord.uid,
            name: userData.name,
            email: userData.email,
            role: userData.role
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(401).json({ error: 'Authentication failed. Please check your credentials.' });
    }
});

module.exports = router;
