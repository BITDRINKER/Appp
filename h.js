const express = require('express');
const app = express();

// Enable CORS so FCC can test the API
const cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 }));

// Root route
app.get('/', (req, res) => {
  res.send('Timestamp Microservice is running!');
});

// GET /api/ => current timestamp
app.get('/api', (req, res) => {
  const currentDate = new Date();
  res.json({
    unix: currentDate.getTime(),
    utc: currentDate.toUTCString()
  });
});

// GET /api/:date
app.get('/api/:date', (req, res) => {
  const dateParam = req.params.date;

  // Check if it's a UNIX timestamp
  let date;
  if (!isNaN(dateParam)) {
    // Check if it’s in milliseconds or seconds
    date = new Date(parseInt(dateParam));
  } else {
    date = new Date(dateParam);
  }

  if (date.toString() === 'Invalid Date') {
    return res.json({ error: 'Invalid Date' });
  }

  res.json({
    unix: date.getTime(),
    utc: date.toUTCString()
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

