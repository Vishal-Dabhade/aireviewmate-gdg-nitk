# Complete Setup Guide for CodeReview.ai

This guide will walk you through setting up the CodeReview.ai project from scratch, including all API keys and deployment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Getting API Keys](#getting-api-keys)
3. [Local Development Setup](#local-development-setup)
4. [Running the Application](#running-the-application)
5. [Deployment](#deployment)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** v16 or higher - [Download here](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download here](https://git-scm.com/)
- **GitHub Account** - [Sign up here](https://github.com/)
- **Google Account** - For Gemini API

---

## Getting API Keys

### 1. GitHub OAuth App Setup

**Step 1:** Go to GitHub Settings
- Click your profile picture → Settings
- Scroll down to "Developer settings" (bottom left)
- Click "OAuth Apps"

**Step 2:** Create New OAuth App
- Click "New OAuth App"
- Fill in the details:
  - **Application name:** CodeReview.ai
  - **Homepage URL:** `http://localhost:3000`
  - **Application description:** AI-powered code review platform
  - **Authorization callback URL:** `http://localhost:8000/api/github/callback`

**Step 3:** Save Credentials
- Click "Register application"
- Copy the **Client ID**
- Click "Generate a new client secret"
- Copy the **Client Secret** (you won't see it again!)

**For Production:**
- Go back to your OAuth App settings
- Update the callback URL to: `https://aireviewmate-gdg-nitk.onrender.com/api/github/callback`

### 2. GitHub Personal Access Token

**Step 1:** Generate Token
- Go to GitHub Settings → Developer settings
- Click "Personal access tokens" → "Tokens (classic)"
- Click "Generate new token (classic)"

**Step 2:** Configure Token
- Give it a name: "CodeReview.ai"
- Select scopes:
  - ✅ `repo` (Full control of private repositories)
  - ✅ `user` (Read user profile data)
- Click "Generate token"

**Step 3:** Save Token
- Copy the token immediately (you won't see it again!)

### 3. Google Gemini API Key

**Step 1:** Go to Google AI Studio
- Visit [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- Sign in with your Google account

**Step 2:** Create API Key
- Click "Get API Key" or "Create API Key"
- Select "Create API key in new project"
- Copy the API key

**Step 3:** Test the API Key (Optional)
- You can test it using the playground on the same page

### 4. MongoDB Atlas Setup

**Step 1:** Create Account
- Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Click "Try Free" and sign up

**Step 2:** Create Cluster
- Choose "Free Shared" tier
- Select a cloud provider and region (closest to you)
- Click "Create Cluster" (takes 3-5 minutes)

**Step 3:** Create Database User
- Click "Database Access" in left sidebar
- Click "Add New Database User"
- Choose "Password" authentication
- Username: `your_username`
- Password: Click "Autogenerate Secure Password" and save it
- Database User Privileges: Select "Read and write to any database"
- Click "Add User"

**Step 4:** Whitelist IP Address
- Click "Network Access" in left sidebar
- Click "Add IP Address"
- Click "Allow Access from Anywhere" (for development)
- Click "Confirm"

**Step 5:** Get Connection String
- Click "Database" in left sidebar
- Click "Connect" on your cluster
- Click "Connect your application"
- Copy the connection string
- It looks like: `mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
- Replace `<password>` with your actual password

---

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Vishal-Dabhade/aireviewmate-gdg-nitk.git
cd aireviewmate-gdg-nitk
```

### 2. Backend Setup

**Step 1:** Navigate to backend folder

```bash
cd backend
```

**Step 2:** Install dependencies

```bash
npm install
```

**Step 3:** Create `.env` file

Create a new file called `.env` in the backend folder and add:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GITHUB_CALLBACK_URL=http://localhost:8000/api/github/callback
GITHUB_TOKEN=your_github_personal_access_token_here

# JWT Secret (generate a random string)
JWT_SECRET=your_random_secret_key_at_least_32_characters_long

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Frontend URL
CLIENT_URL=http://localhost:3000
```

**Step 4:** Generate JWT Secret

You can generate a secure JWT secret using Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it as your `JWT_SECRET`

### 3. Frontend Setup

**Step 1:** Navigate to frontend folder

```bash
cd ../frontend
```

**Step 2:** Install dependencies

```bash
npm install
```

**Step 3:** Create `.env.local` file

Create a new file called `.env.local` in the frontend folder and add:

```env
REACT_APP_API_BASE_URL=http://localhost:8000/api
REACT_APP_GITHUB_CLIENT_ID=your_github_client_id_here
```

(Use the same GitHub Client ID from backend)

---

## Running the Application

### Start Backend Server

```bash
cd backend
npm start
```

You should see:
```
Server is running on port 8000
MongoDB connected successfully
```

### Start Frontend Server

Open a new terminal window:

```bash
cd frontend
npm start
```

Your browser should automatically open `http://localhost:3000`

**Production URLs:**
- Frontend: [https://aireviewmate-gdg-nitk.vercel.app/](https://aireviewmate-gdg-nitk.vercel.app/)
- Backend: [https://aireviewmate-gdg-nitk.onrender.com](https://aireviewmate-gdg-nitk.onrender.com)

---

## Deployment

### Deploy Frontend to Vercel

**Step 1:** Install Vercel CLI

```bash
npm install -g vercel
```

**Step 2:** Login to Vercel

```bash
vercel login
```

**Step 3:** Deploy

```bash
cd frontend
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? Select your account
- Link to existing project? **No**
- What's your project's name? `aireviewmate-gdg-nitk`
- In which directory is your code located? `./`

**Step 4:** Set Environment Variables

Go to your Vercel dashboard:
- Click on your project
- Go to Settings → Environment Variables
- Add:
  - `REACT_APP_API_BASE_URL` = `https://aireviewmate-gdg-nitk.onrender.com/api`
  - `REACT_APP_GITHUB_CLIENT_ID` = `your_github_client_id`

**Step 5:** Redeploy

```bash
vercel --prod
```

### Deploy Backend to Render

**Step 1:** Push to GitHub

Make sure your backend code is pushed to GitHub:

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

**Step 2:** Create Render Account

- Go to [Render.com](https://render.com/)
- Sign up with GitHub

**Step 3:** Create New Web Service

- Click "New +" → "Web Service"
- Connect your GitHub repository
- Select the repository `aireviewmate-gdg-nitk`

**Step 4:** Configure Service

- **Name:** `aireviewmate-gdg-nitk`
- **Region:** Select closest to you
- **Branch:** `main`
- **Root Directory:** `backend`
- **Runtime:** Node
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Plan:** Free

**Step 5:** Add Environment Variables

Click "Advanced" and add all environment variables:

```
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=https://aireviewmate-gdg-nitk.onrender.com/api/github/callback
GITHUB_TOKEN=your_github_token
JWT_SECRET=your_jwt_secret
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=https://aireviewmate-gdg-nitk.vercel.app
```

**Step 6:** Deploy

- Click "Create Web Service"
- Wait 5-10 minutes for deployment

**Step 7:** Update GitHub OAuth

Go back to your GitHub OAuth App settings and update:
- Homepage URL: `https://aireviewmate-gdg-nitk.vercel.app`
- Callback URL: `https://aireviewmate-gdg-nitk.onrender.com/api/github/callback`

---

## Troubleshooting

### Backend won't start

**Issue:** `Error: GEMINI_API_KEY is not set`

**Solution:** Make sure you created the `.env` file in the backend folder with all required variables

---

**Issue:** `MongoDB connection failed`

**Solution:** 
- Check your MongoDB connection string
- Make sure you replaced `<password>` with actual password
- Verify IP whitelist in MongoDB Atlas

---

### Frontend won't connect to backend

**Issue:** `Network Error` or `CORS Error`

**Solution:**
- Make sure backend is running on port 8000
- Check `REACT_APP_API_BASE_URL` in frontend `.env.local`
- Verify `CLIENT_URL` in backend `.env`

---

### GitHub OAuth not working

**Issue:** `Callback URL mismatch`

**Solution:**
- Go to GitHub OAuth App settings
- Make sure callback URL matches exactly: `http://localhost:8000/api/github/callback`
- Clear browser cookies and try again

---

### Render deployment fails

**Issue:** `Build failed`

**Solution:**
- Check Render logs for specific error
- Make sure all environment variables are set correctly
- Verify your MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

---

**Issue:** Backend is slow to respond

**Solution:**
- Render free tier sleeps after 15 minutes of inactivity
- First request takes 30-60 seconds to wake up
- This is normal behavior for free tier

---

## Additional Resources

- [React Documentation](https://react.dev/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/)
- [Google Gemini AI Documentation](https://ai.google.dev/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)

---

## Need Help?

If you encounter any issues not covered in this guide:
1. Check the [GitHub Issues](https://github.com/Vishal-Dabhade/aireviewmate-gdg-nitk/issues)
2. Create a new issue with detailed error messages
3. Contact the maintainer

---

**Happy Coding! 🚀**