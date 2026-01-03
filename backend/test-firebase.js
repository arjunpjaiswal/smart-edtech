const { db } = require('./firebase');

async function testFirebase() {
    console.log("Testing Firebase connection...");
    try {
        const snapshot = await db.collection('assignments').get();
        console.log(`SUCCESS: Fetched ${snapshot.size} assignments.`);
    } catch (error) {
        console.error("FAILURE: Firebase error:");
        console.error(error);
    }
}

testFirebase();
