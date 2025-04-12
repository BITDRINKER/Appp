const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const app = express();
const urlParser = require('url');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

const urlDatabase = {};
let urlCounter = 1;

// Root HTML
app.get('/', (req, res) => {
  res.send(`
    <h2>URL Shortener Microservice</h2>
    <form action="/api/shorturl" method="post">
      <input type="text" name="url" placeholder="https://example.com" required />
      <button type="submit">Shorten</button>
    </form>
  `);
});

// POST endpoint
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  // Check if URL starts with http:// or https://
  if (!/^https?:\/\/.+/i.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  try {
    const hostname = urlParser.parse(originalUrl).hostname;

    dns.lookup(hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      }

      const shortUrl = urlCounter++;
      urlDatabase[shortUrl] = originalUrl;

      res.json({
        original_url: originalUrl,
        short_url: shortUrl
      });
    });
  } catch (err) {
    res.json({ error: 'invalid url' });
  }
});

// GET redirect
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = parseInt(req.params.short_url);
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

// Start server
const port = 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});