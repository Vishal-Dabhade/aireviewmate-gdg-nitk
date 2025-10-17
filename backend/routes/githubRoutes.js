const express = require('express');
const router = express.Router();
const githubController = require('../controllers/githubController');
const auth = require('../middleware/auth');

router.get('/login', githubController.githubLogin);
router.get('/callback', githubController.githubCallback);
// Add this in routes/github.js
router.get('/', githubController.getUserInfo);


// Uncomment when JWT auth ready
// router.get('/repos', auth, githubController.listRepositories);
// router.get('/file/:owner/:repo', auth, githubController.getFileContents);
// router.post('/create-pr', auth, githubController.createPullRequest);

module.exports = router;
