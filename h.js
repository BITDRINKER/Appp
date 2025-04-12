const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ optionsSuccessStatus: 200 }));

// Serve HTML directly at root
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Request Header Parser</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 2em;
          background: #f0f0f0;
        }
        .container {
          background: white;
          padding: 1.5em;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          max-width: 600px;
          margin: 0 auto;
        }
        h1 { margin-bottom: 1em; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Request Header Parser</h1>
        <p><strong>IP Address:</strong> <span id="ip"></span></p>
        <p><strong>Language:</strong> <span id="lang"></span></p>
        <p><strong>Software:</strong> <span id="software"></span></p>
      </div>

      <script>
        fetch('/api/whoami')
          .then(res => res.json())
          .then(data => {
            document.getElementById('ip').textContent = data.ipaddress;
            document.getElementById('lang').textContent = data.language;
            document.getElementById('software').textContent = data.software;
          })
          .catch(err => {
            document.body.innerHTML = '<p>Failed to load data</p>';
            console.error(err);
          });
      </script>
    </body>
    </html>
  `);
});

// API endpoint
app.get('/api/whoami', (req, res) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
  const lang = req.headers['accept-language'];
  const software = req.headers['user-agent'];

  res.json({
    ipaddress: ip,
    language: lang,
    software: software
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running on port', PORT);
});
