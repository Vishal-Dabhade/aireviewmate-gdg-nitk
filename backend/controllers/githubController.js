const axios = require('axios');
const jwt = require('jsonwebtoken');

exports.githubLogin = (req, res) => {
  const redirectUri = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.GITHUB_CALLBACK_URL)}&scope=repo,user:email`;
  res.json({ redirectUri });
};

exports.githubCallback = async (req, res) => {
  const { code } = req.query;
  console.log('=== GitHub Callback ===');
  console.log('Received code:', code);
  
  if (!code) {
    console.error('No code provided');
    return res.status(400).json({ error: 'No authorization code provided' });
  }
  
  try {
    const tokenResp = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      },
      { headers: { Accept: 'application/json' } }
    );
    
    if (tokenResp.data.error) {
      console.error('GitHub token error:', tokenResp.data.error_description);
      return res.status(400).json({ error: tokenResp.data.error_description });
    }
    
    const accessToken = tokenResp.data.access_token;
    
    const userResp = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    const token = jwt.sign(
      { githubId: userResp.data.id, githubToken: accessToken, login: userResp.data.login },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Now redirects to frontend with token
    res.redirect(`${process.env.CLIENT_URL}?token=${token}`);
    
  } catch (error) {
    console.error('GitHub callback error:', error.response?.data || error.message);
    res.redirect(`${process.env.CLIENT_URL}?error=${encodeURIComponent(error.message)}`);
  }
};

exports.getUserInfo = async (req, res) => {
  const { username } = req.query;
  
  if (!username) {
    return res.status(400).json({ error: "Username required" });
  }
  
  try {
    const response = await axios.get(`https://api.github.com/users/${username}`, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`
      }
    });
    res.json(response.data);
  } catch (err) {
    console.error('GitHub getUserInfo error:', err.message);
    res.status(err.response?.status || 500).json({ error: err.message });
  }
};