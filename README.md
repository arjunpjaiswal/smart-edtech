# SmartEdTech 🎓

**SmartEdTech** is a next-generation educational platform designed to transform the traditional classroom into an interactive, AI-powered learning environment. It seamlessly integrates live video broadcasting, real-time engagement tools, and intelligent assessment systems to empower both educators and students.

![Project Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## 🚀 Key Features

### 🎥 Live Virtual Classroom
- **Interactive Broadcasts**: High-quality live video lectures powered by **Jitsi Meet**.
- **Real-Time Polls**: Instructors can launch instant polls to gauge understanding, with results updating live for all participants.
- **Live Discussion**: Integrated chat for students to ask questions and interact without interrupting the flow.
- **Attendance Tracking**: Automated tracking of student participation in live sessions.

### 🧠 AI-Powered Assessment Engine
- **Smart Question Generation**:
  - Automatically generates quizzes from uploaded **PDF study materials**.
  - Supports multiple formats: **MCQs**, **Subjective**, **One-liners**, and **Mixed**.
  - Powered by **Google Gemini** (native PDF processing) and **Groq** (LLaMA 3) for high-accuracy extraction.
- **Intelligent Evaluation**:
  - AI grading of student submissions against ideal answers.
  - Detailed feedback on **Weak Points** and conceptual gaps.
  - Generates personalized **Remediation Plans** to help students improve.

### 📊 Teachers' Command Center
- **Comprehensive Dashboard**: Real-time analytics on student performance and engagement.
- **Weakness Heatmaps**: Visualizes common struggle areas across the entire class.
- **Resource Vault**: Centralized repository for managing study materials and assignments.
- **Class Scheduling**: Easy tools to schedule future live sessions and notify students.

### 🎒 Student Nexus
- **Study Buddy**: AI assistant for 24/7 academic support.
- **Material Access**: Download and review materials shared by instructors.
- **Performance History**: Track progress and view past evaluation feedback.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (Latest engine)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: React Router DOM v7
- **Visualization**: Recharts

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- **Database**: [Firebase Firestore](https://firebase.google.com/) (NoSQL)
- **AI Services**:
  - **Google Gemini API** (PDF analysis & fallback)
  - **Groq SDK** (High-speed inference)
- **File Handling**: Multer & PDF-Parse

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+ recommended)
- Firebase Project with Firestore & Auth enabled
- API Keys for Google Gemini & Groq

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/smartEdtech.git
cd smartEdtech
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:
```env
PORT=5000
# AI Providers
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key

# Firebase Admin SDK (Option 1: Inline JSON)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}

# Firebase Admin SDK (Option 2: File path)
# Place serviceAccountKey.json in backend/ and it will be auto-detected
```

Start the backend server:
```bash
npm start
```
*Server runs on `http://localhost:5000`*

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:
```bash
cd ../frontend
npm install
```

Create a `.env` file (optional if using default localhost):
```env
VITE_API_URL=http://localhost:5000
```

Start the development server:
```bash
npm run dev
```
*App runs on `http://localhost:5173`*

---

## 🔒 Security Note
This project is a demonstration of advanced educational technology. For production deployment, ensure you:
- Implement client-side Firebase Auth token verification on the backend.
- restrict CORS to your specific frontend domain.
- Set up rate limiting on API endpoints.

---

## 🤝 Contributing
Contributions are welcome! Please fork the repository and submit a pull request for any enhancements.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
