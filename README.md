# CodeReview.ai

An AI-powered code review platform that analyzes your code, provides improvements, and helps you write better code faster using Google's Gemini AI.

## Live Demo

**Try it now:**
- **Frontend:** [https://aireviewmate-gdg-nitk.vercel.app/](https://aireviewmate-gdg-nitk.vercel.app/)
- **Backend API:** [https://aireviewmate-gdg-nitk.onrender.com](https://aireviewmate-gdg-nitk.onrender.com)

> **Note:** The backend is hosted on Render's free tier and may take 30-60 seconds to wake up on first request.

### Demo Video

Watch the full walkthrough and features demonstration:

[![CodeReview.ai Demo Video](https://img.shields.io/badge/Watch%20Demo-Google%20Drive-4285F4?style=for-the-badge&logo=googledrive&logoColor=white)](https://drive.google.com/file/d/1yedtC07BxQWbRaTX5NPhiX8bmx7sVSGC/view?usp=share_link)

---

## Features

- **Instant AI Code Review** - Paste code and get AI-powered analysis instantly
- **Multi-Language Support** - Supports 15+ programming languages with auto-detection
- **Metrics Dashboard** - See lines of code, complexity score, quality rating, and issues found
- **Code Comparison** - Side-by-side view of original vs improved code
- **GitHub Integration** - Create pull requests with improved code directly to your repository
- **Export Reports** - Download reviews as text files for documentation
- **Review History** - Save and manage all your code reviews
- **GitHub Authentication** - Sign in with GitHub to persist your reviews

---

## Tech Stack

**Frontend:**
- React.js with Tailwind CSS
- Deployed on Vercel

**Backend:**
- Node.js with Express.js
- MongoDB for database
- Google Gemini AI for code analysis
- Deployed on Render

---

## Getting Started

### Prerequisites

- Node.js v16 or higher
- npm or yarn
- GitHub account
- Google Gemini API key

### Local Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/Vishal-Dabhade/aireviewmate-gdg-nitk.git
cd aireviewmate-gdg-nitk
```

#### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env.local`:

```
REACT_APP_API_BASE_URL=http://localhost:8000/api
REACT_APP_GITHUB_CLIENT_ID=your_github_client_id
```

Start frontend:

```bash
npm start
```

Frontend runs on http://localhost:3000

#### 3. Backend Setup

```bash
cd backend
npm install
```

Create `.env`:

```
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:8000/api/github/callback
GITHUB_TOKEN=your_github_token

# JWT
JWT_SECRET=your_secret_key_here

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Frontend URL
CLIENT_URL=http://localhost:3000
```

Start backend:

```bash
npm start
```

Backend runs on http://localhost:8000

---

## Getting API Keys

### GitHub OAuth Setup

1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - **Application name:** CodeReview.ai
   - **Homepage URL:** http://localhost:3000
   - **Authorization callback URL:** http://localhost:8000/api/github/callback
4. Copy **Client ID** and **Client Secret** into your .env

For production, use:
```
Authorization callback URL: https://aireviewmate-gdg-nitk.onrender.com/api/github/callback
```

### Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Click "Get API Key"
3. Create new API key for this project
4. Copy to your .env as GEMINI_API_KEY

### MongoDB Setup

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string
4. Add to .env as MONGODB_URI

---

## Deployment

### Deploy Frontend to Vercel

```bash
cd frontend
npm install -g vercel
vercel
```

Set environment variables in Vercel dashboard:

```
REACT_APP_API_BASE_URL=https://aireviewmate-gdg-nitk.onrender.com/api
REACT_APP_GITHUB_CLIENT_ID=your_github_client_id
```

### Deploy Backend to Render

1. Push backend code to GitHub
2. Go to [Render.com](https://render.com)
3. Create new Web Service
4. Connect GitHub repository
5. Set environment variables (same as .env but without secrets)
6. Deploy

---

## How to Use

### For Code Review

1. Go to **Review** tab
2. Paste or write your code
3. Select programming language (or use **Auto-detect**)
4. Click **"Analyze with AI"**
5. View results:
   - Metrics dashboard showing code quality
   - Key improvements list
   - Side-by-side code comparison
   - AI explanation of changes
   - Pro tips for this code pattern

### For History

1. Sign in with GitHub
2. Go to **History** tab
3. See all your past reviews with:
   - Review date
   - Category badge
   - Original vs Improved code preview
4. Actions available:
   - **Export** - Download review as text file
   - **Create PR** - Automatically create GitHub pull request
   - **Delete** - Remove the review

### For Anonymous Users

- Can review code without signing in
- Reviews only saved during current browser session
- Sign in with GitHub to save reviews permanently

---

## Project Structure

```
aireviewmate-gdg-nitk/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.js
│   │   │   ├── Dashboard.js
│   │   │   ├── CodeEditor.js
│   │   │   ├── FullScreenReviewModal.js
│   │   │   ├── HistoryTab.js
│   │   │   ├── MetricsDashboard.js
│   │   │   ├── CategoryBadge.js
│   │   │   ├── ExportButton.js
│   │   │   ├── ErrorAlert.js
│   │   │   ├── ReviewResults.js
│   │   │   └── PRModal.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── anonymousReviewService.js
│   │   └── App.js
│   └── public/
├── backend/
│   ├── controllers/
│   │   ├── githubController.js
│   │   └── reviewController.js
│   ├── services/
│   │   └── llmService.js
│   ├── models/
│   │   └── Review.js
│   ├── routes/
│   │   ├── github.js
│   │   └── review.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── .env.example
├── docs/
│   └── images/
│       ├── 01-landing-page.png
│       ├── 02-code-editor.png
│       ├── 03-review-metrics.png
│       ├── 04-code-comparison.png
│       ├── 05-improvements-explanation.png
│       ├── 06-export-pr-buttons.png
│       └── 07-history-tab.png
├── README.md
├── SETUP_GUIDE.md
└── .gitignore
```

---

## API Endpoints

### GitHub OAuth

- `GET /api/github/login` - Start GitHub login flow
- `GET /api/github/callback` - GitHub OAuth callback
- `GET /api/github` - Get user info by username

### Code Review

- `POST /api/review` - Submit code for review
- `GET /api/review/history` - Get user's review history
- `DELETE /api/review/:id` - Delete a specific review
- `GET /api/review/:id` - Get review details by ID

---

## Supported Languages

- JavaScript
- Python
- Java
- C++
- C
- C#
- Go
- Rust
- TypeScript
- Kotlin
- Dart
- Swift
- PHP
- Ruby
- SQL
- HTML
- CSS
- XML
- JSON

Plus auto-detection for many more languages.

---

## Environment Variables Reference

### Frontend (.env.local)

```
REACT_APP_API_BASE_URL=http://localhost:8000/api
REACT_APP_GITHUB_CLIENT_ID=your_github_client_id
```

### Backend (.env)

```
GITHUB_CLIENT_ID=your_id_here
GITHUB_CLIENT_SECRET=your_secret_here
GITHUB_CALLBACK_URL=http://localhost:8000/api/github/callback
GITHUB_TOKEN=your_token_here
JWT_SECRET=your_jwt_secret_here
MONGODB_URI=your_mongodb_url
GEMINI_API_KEY=your_gemini_key_here
CLIENT_URL=http://localhost:3000
```

---

## Troubleshooting

### "Failed to analyze code with AI"

- Check GEMINI_API_KEY is set in backend .env
- Verify API key is valid on Google AI Studio
- Check Render logs for detailed error messages

### "Connect GitHub button not working"

- Verify GITHUB_CALLBACK_URL in OAuth app matches your backend
- Check environment variables in Render dashboard
- Clear browser cookies and try again in incognito mode

### "Reviews not saving"

- Make sure you're logged in with GitHub
- Check MongoDB connection string in .env
- Verify JWT_SECRET is set in backend

### Network errors on Vercel/Render

- Render backend might be sleeping (auto-wakes on first request)
- Takes 30-60 seconds to start up
- Wait and try again

---

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## Support

For issues, questions, or suggestions:
- Open a GitHub issue
- Contact the maintainer

---

## Acknowledgments

- Google Gemini AI for code analysis
- GitHub for OAuth and API
- MongoDB for database
- Vercel for frontend hosting
- Render for backend hosting

---

**Made with care using React, Node.js, Tailwind CSS, and Gemini AI**