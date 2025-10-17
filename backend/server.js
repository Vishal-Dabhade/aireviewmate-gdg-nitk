require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dbConnect = require('./config/db');
const reviewRoutes = require('./routes/reviewRoutes');
const githubRoutes = require('./routes/githubRoutes');
const prRoutes = require("./routes/prRoutes")
const errorHandler = require("./middleware/errorHandler")



const app = express();
const PORT = process.env.PORT || 8000;

dbConnect();

app.use(cors()); // allow everything

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Server is running' }));

app.use('/api/review', reviewRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/pr', prRoutes);
console.log('✅ PR routes registered');

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Global error handler
app.use(errorHandler);


app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
