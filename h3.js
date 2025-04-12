const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

// Serve simple HTML form at root
app.get('/', (req, res) => {
  res.send(`
    <h1>URL Shortener Microservice</h1>
    <form action="/api/shorturl" method="post">
      <label for="url">Enter URL:</label>
      <input type="text" name="url" placeholder="https://example.com" required>
      <button type="submit">Shorten</button>
    </form>
  `);
});

// In-memory database
let urlDatabase = {};
let idCounter = 1;

// POST route to shorten URL
app.post('/api/shorturl', (req, res) => {
  const url = req.body.url;

  // Validate URL format
  try {
    const parsedUrl = new URL(url);
    // DNS lookup to verify domain
    dns.lookup(parsedUrl.hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      }

      // Store in database
      const shortId = idCounter++;
      urlDatabase[shortId] = url;

      res.json({
        original_url: url,
        short_url: shortId
      });
    });
  } catch (e) {
    return res.json({ error: 'invalid url' });
  }
});

// GET route to redirect
app.get('/api/shorturl/:id', (req, res) => {
  const id = req.params.id;
  const originalUrl = urlDatabase[id];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found for given input' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
