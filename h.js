const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

// Root route - display HTML with current timestamp
app.get('/', (req, res) => {
  const parsedDate = new Date();
  const response = {
    unix: parsedDate.getTime(),
    utc: parsedDate.toUTCString()
  };

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Timestamp Microservice</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9; }
          pre { background: #eee; padding: 10px; border-radius: 5px; }
          a { color: blue; text-decoration: none; }
        </style>
      </head>
      <body>
        <h2>Timestamp Microservice</h2>
        <p><strong>Example Output:</strong></p>
        <pre>${JSON.stringify(response, null, 2)}</pre>
        <p>Try more:</p>
        <ul>
          <li><a href="/api/">/api/</a> - current timestamp (API)</li>
          <li><a href="/api/2025-04-12">/api/2025-04-12</a> - specific date</li>
          <li><a href="/api/1640995200000">/api/1640995200000</a> - Unix timestamp</li>
          <li><a href="/api/invalid-date">/api/invalid-date</a> - invalid date example</li>
        </ul>
      </body>
    </html>
  `);
});

// /api/ route - current timestamp
app.get('/api/', (req, res) => {
  const parsedDate = new Date();
  res.json({
    unix: parsedDate.getTime(),
    utc: parsedDate.toUTCString()
  });
});

// /api/:date route - date or timestamp parsing
app.get('/api/:date', (req, res) => {
  const { date } = req.params;
  let parsedDate;

  if (!isNaN(date)) {
    parsedDate = new Date(parseInt(date));
  } else {
    parsedDate = new Date(date);
  }

  if (parsedDate.toString() === 'Invalid Date') {
    return res.json({ error: 'Invalid Date' });
  }

  res.json({
    unix: parsedDate.getTime(),
    utc: parsedDate.toUTCString()
  });
});

// Start server
const port = 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
