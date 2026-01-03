const { db } = require('./firebase');

async function checkDatabase() {
    console.log("Checking Firestore database instance...");
    try {
        const collections = await db.listCollections();
        console.log(`SUCCESS: Found ${collections.length} collections.`);
        collections.forEach(col => console.log(` - ${col.id}`));
    } catch (error) {
        console.error("FAILURE: Database check error:");
        console.error(error);
    }
}

checkDatabase();
