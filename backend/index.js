const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

app.get('/', (req, res) => {
  res.send('SmartEdTech Backend is running');
});

// Routes
app.use('/api/pdf', require('./routes/pdf'));
app.use('/api/evaluation', require('./routes/evaluation'));
app.use('/api/class', require('./routes/class'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/messages', require('./routes/messages'));

app.listen(PORT, () => {
  console.log(`Server v2.1 running on port ${PORT}`);
});
