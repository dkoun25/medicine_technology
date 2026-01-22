// Local development server for testing email API
// Run: node api/server-local.js

require('dotenv').config();
const express = require('express');
const sendVerification = require('./send-verification');

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(express.json());

// Wrap the serverless function for Express
app.post('/api/send-verification', async (req, res) => {
  await sendVerification(req, res);
});

app.get('/', (req, res) => {
  res.json({ 
    status: 'API running',
    endpoints: ['/api/send-verification']
  });
});

app.listen(PORT, () => {
  console.log(`✅ API server running at http://localhost:${PORT}`);
  console.log(`📧 Email: ${process.env.EMAIL_USER || 'Not configured'}`);
});
