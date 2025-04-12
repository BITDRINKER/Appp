const express = require('express');
const multer = require('multer');
const cors = require('cors');

const app = express();
app.use(cors());

// Multer setup
const upload = multer({ dest: 'uploads/' });

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>File Metadata Microservice</title>
  <style>
    body { font-family: sans-serif; max-width: 600px; margin: 2rem auto; }
    input, button { margin: 0.5rem 0; padding: 0.5rem; width: 100%; }
    pre { background: #f5f5f5; padding: 1rem; }
  </style>
</head>
<body>
  <h2>Upload a File</h2>
  <form id="uploadForm">
    <input type="file" name="upfile" id="fileInput" required />
    <button type="submit">Upload</button>
  </form>
  <pre id="result"></pre>

  <script>
    const form = document.getElementById('uploadForm');
    const result = document.getElementById('result');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);

      const res = await fetch('/api/fileanalyse', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      result.textContent = JSON.stringify(data, null, 2);
    });
  </script>
</body>
</html>
  `);
});

// API endpoint
app.post('/api/fileanalyse', upload.single('upfile'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const { originalname, mimetype, size } = req.file;
  res.json({
    name: originalname,
    type: mimetype,
    size: size
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log('🚀 File Metadata Microservice running on http://localhost:' + PORT);
});
