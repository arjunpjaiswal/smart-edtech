const express = require('express');
const router = express.Router();
const { db } = require('../firebase');

// Send a message
router.post('/send', async (req, res) => {
    try {
        const { senderId, senderName, receiverId, receiverName, content } = req.body;

        if (!senderId || !receiverId || !content) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const message = {
            senderId,
            senderName,
            receiverId,
            receiverName,
            content,
            timestamp: new Date().toISOString()
        };

        // Add message to 'messages' collection
        const docRef = await db.collection('messages').add(message);

        // Update 'conversations' for both users to show latest message in list
        const convId = [senderId, receiverId].sort().join('_');
        await db.collection('conversations').doc(convId).set({
            participants: [senderId, receiverId],
            participantNames: {
                [senderId]: senderName,
                [receiverId]: receiverName
            },
            lastMessage: content,
            lastMessageAt: message.timestamp,
            lastSenderId: senderId
        }, { merge: true });

        res.status(201).json({ id: docRef.id, ...message });
    } catch (error) {
        console.error('Send Message Error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Get conversations for a user
router.get('/conversations/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const snapshot = await db.collection('conversations')
            .where('participants', 'array-contains', userId)
            .orderBy('lastMessageAt', 'desc')
            .get();

        const conversations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(conversations);
    } catch (error) {
        console.error('Fetch Conversations Error:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

// Get message thread between two users
router.get('/thread/:userId/:otherId', async (req, res) => {
    try {
        const { userId, otherId } = req.params;

        // Find messages where sender=userId AND receiver=otherId OR sender=otherId AND receiver=userId
        const snapshot1 = await db.collection('messages')
            .where('senderId', '==', userId)
            .where('receiverId', '==', otherId)
            .get();

        const snapshot2 = await db.collection('messages')
            .where('senderId', '==', otherId)
            .where('receiverId', '==', userId)
            .get();

        const messages = [
            ...snapshot1.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            ...snapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        res.json(messages);
    } catch (error) {
        console.error('Fetch Thread Error:', error);
        res.status(500).json({ error: 'Failed to fetch message thread' });
    }
});

// Get all users for starting new chat (excluding the requester)
router.get('/users/:excludeUserId', async (req, res) => {
    try {
        const { excludeUserId } = req.params;
        console.log(`Fetching all users, excluding: ${excludeUserId}`);
        const snapshot = await db.collection('users').get();
        console.log(`Found ${snapshot.size} total users in Firestore.`);

        const users = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(u => u.id !== excludeUserId);

        console.log(`Returning ${users.length} users to frontend.`);
        res.json(users);
    } catch (error) {
        console.error('Fetch Users Error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

module.exports = router;
