const { db } = require('./firebase');

async function checkUsers() {
    console.log("Checking all registered users...");
    const snapshot = await db.collection('users').get();

    if (snapshot.empty) {
        console.log("No users found in Firestore.");
        return;
    }

    snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`- UID: ${doc.id}`);
        console.log(`  Name: ${data.name}`);
        console.log(`  Email: ${data.email}`);
        console.log(`  Role: ${data.role}`);
        console.log('-------------------');
    });
}

checkUsers().catch(console.error);
