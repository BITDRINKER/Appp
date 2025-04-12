const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

// Root route - simple HTML with instructions
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Request Header Parser</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background: #f0f0f0; }
          pre { background: #eee; padding: 10px; border-radius: 5px; }
          a { color: blue; text-decoration: none; }
        </style>
      </head>
      <body>
        <h2>Request Header Parser Microservice</h2>
        <p>Try it out:</p>
        <ul>
          <li><a href="/api/whoami">/api/whoami</a> - see your IP, language, and user-agent</li>
        </ul>
      </body>
    </html>
  `);
});

// /api/whoami route - return header information
app.get('/api/whoami', (req, res) => {
  res.json({
    ipaddress: req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress,
    language: req.headers['accept-language'],
    software: req.headers['user-agent']
  });
});

// Start server
const port = 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
