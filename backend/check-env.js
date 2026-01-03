const dotenv = require('dotenv');
dotenv.config();

console.log("PORT:", process.env.PORT);
console.log("FIREBASE_DATABASE_URL:", process.env.FIREBASE_DATABASE_URL);
console.log("GROQ_API_KEY (prefix):", process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.substring(0, 10) : "UNDEFINED");
