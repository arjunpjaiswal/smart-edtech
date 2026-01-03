---
description: How to deploy SmartEdTech for free using Vercel, Render, and Firebase
---

# Zero-Cost Deployment Guide

Follow these steps to host your entire SmartEdTech platform for free.

## 1. Prepare Your Repository
Ensure your project is pushed to a GitHub repository.

## 2. Deploy Backend (Render)
1. Go to [Render.com](https://render.com) and sign in with GitHub.
2. Create a **New Web Service**.
3. Select your repository.
4. **Build Command**: `cd backend && npm install`
5. **Start Command**: `cd backend && node index.js`
6. Click **Advanced** -> **Add Environment Variable**:
   - `GEMINI_API_KEY`: [Your Key]
   - `FIREBASE_DATABASE_URL`: [Your Firebase URL]
   - `PORT`: `5000`

## 3. Deploy Frontend (Vercel)
1. Go to [Vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New** -> **Project**.
3. Select your repository.
4. **Framework Preset**: Vite
5. **Root Directory**: `frontend`
6. Click **Deploy**.

## 4. Connect Frontend to Backend
Once Render gives you a backend URL (e.g., `https://smart-edtech-api.onrender.com`):
1. In your frontend code, update `axios` base URLs or use environment variables.
2. In Vercel, add an environment variable `VITE_API_URL` with your Render URL.

## 5. Firebase Configuration
Ensure your `serviceAccountKey.json` is either handled via environment variables (recommended for security) or included in your private repository. 

> [!CAUTION]
> Never commit secrets to a public repository. Use Render's **Secret Files** or **Environment Variables** for `serviceAccountKey.json` content.
