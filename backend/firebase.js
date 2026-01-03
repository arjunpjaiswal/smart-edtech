const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config();

let credential;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        credential = admin.credential.cert(sa);
    } catch (e) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT env var. Falling back to file.");
        const serviceAccount = require("./serviceAccountKey.json");
        credential = admin.credential.cert(serviceAccount);
    }
} else {
    try {
        const serviceAccount = require("./serviceAccountKey.json");
        credential = admin.credential.cert(serviceAccount);
    } catch (e) {
        console.error("serviceAccountKey.json not found and FIREBASE_SERVICE_ACCOUNT not set.");
    }
}

admin.initializeApp({
    credential: credential
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
