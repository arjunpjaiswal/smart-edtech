const { db } = require('./firebase');

async function testDeletion() {
    console.log("Starting deletion test...");

    try {
        // 1. Create a dummy class
        const newClass = {
            title: 'Test Class To Delete',
            createdAt: new Date().toISOString()
        };
        const docRef = await db.collection('classes').add(newClass);
        console.log(`Created test class with ID: ${docRef.id}`);

        // 2. Verify it exists
        const doc = await db.collection('classes').doc(docRef.id).get();
        if (!doc.exists) {
            console.error("Test class not found immediately after creation!");
            return;
        }
        console.log("Test class verified in database.");

        // 3. Delete it (mimicking the route logic)
        await db.collection('classes').doc(docRef.id).delete();
        console.log("Executed API deletion logic.");

        // 4. Verify it's gone
        const deletedDoc = await db.collection('classes').doc(docRef.id).get();
        if (!deletedDoc.exists) {
            console.log("SUCCESS: Class was successfully deleted.");
        } else {
            console.error("FAILURE: Class still exists in database.");
        }

    } catch (error) {
        console.error("Test failed with error:", error);
    }
}

testDeletion();
