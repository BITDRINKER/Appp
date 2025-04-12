const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const users = [];
const exercises = [];

// Serve frontend directly
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Exercise Tracker</title>
  <style>
    body { font-family: sans-serif; max-width: 600px; margin: 2rem auto; }
    input, button { margin: 0.5rem 0; padding: 0.5rem; width: 100%; }
    pre { background: #f5f5f5; padding: 1rem; }
    .section { margin-top: 2rem; }
  </style>
</head>
<body>
  <div id="app"></div>
  <script>
    const app = document.getElementById('app');

    function createSection(title) {
      const section = document.createElement('div');
      section.className = 'section';
      section.innerHTML = '<h2>' + title + '</h2>';
      return section;
    }

    function createInput(id, placeholder, type = 'text') {
      const input = document.createElement('input');
      input.type = type;
      input.id = id;
      input.placeholder = placeholder;
      return input;
    }

    function createButton(label, onClick) {
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.onclick = onClick;
      return btn;
    }

    function createPre(id) {
      const pre = document.createElement('pre');
      pre.id = id;
      return pre;
    }

    const userSection = createSection('Create User');
    const usernameInput = createInput('username', 'Username');
    const userPre = createPre('userPre');
    userSection.appendChild(usernameInput);
    userSection.appendChild(createButton('Create User', async () => {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username: usernameInput.value })
      });
      const data = await res.json();
      userPre.textContent = JSON.stringify(data, null, 2);
    }));
    userSection.appendChild(userPre);
    app.appendChild(userSection);

    const exerciseSection = createSection('Add Exercise');
    const exId = createInput('exUserId', 'User ID');
    const desc = createInput('desc', 'Description');
    const dur = createInput('dur', 'Duration (minutes)', 'number');
    const date = createInput('date', 'Date', 'date');
    const exPre = createPre('exPre');
    exerciseSection.append(exId, desc, dur, date);
    exerciseSection.appendChild(createButton('Add Exercise', async () => {
      const res = await fetch('/api/users/' + exId.value + '/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          description: desc.value,
          duration: dur.value,
          date: date.value
        })
      });
      const data = await res.json();
      exPre.textContent = JSON.stringify(data, null, 2);
    }));
    exerciseSection.appendChild(exPre);
    app.appendChild(exerciseSection);

    const logSection = createSection('Get Logs');
    const logId = createInput('logUserId', 'User ID');
    const logPre = createPre('logPre');
    logSection.append(logId);
    logSection.appendChild(createButton('Get Logs', async () => {
      const res = await fetch('/api/users/' + logId.value + '/logs');
      const data = await res.json();
      logPre.textContent = JSON.stringify(data, null, 2);
    }));
    logSection.appendChild(logPre);
    app.appendChild(logSection);
  </script>
</body>
</html>
  `);
});

// API routes
app.post('/api/users', (req, res) => {
  const username = req.body.username;
  const _id = uuidv4().replace(/-/g, '').slice(0, 24);
  const user = { username, _id };
  users.push(user);
  res.json(user);
});

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const user = users.find(u => u._id === req.params._id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { description, duration, date } = req.body;
  const exercise = {
    username: user.username,
    description,
    duration: parseInt(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString(),
    _id: user._id
  };
  exercises.push(exercise);
  res.json(exercise);
});

app.get('/api/users/:_id/logs', (req, res) => {
  const user = users.find(u => u._id === req.params._id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  let log = exercises.filter(e => e._id === user._id);

  if (req.query.from) {
    const from = new Date(req.query.from);
    log = log.filter(e => new Date(e.date) >= from);
  }
  if (req.query.to) {
    const to = new Date(req.query.to);
    log = log.filter(e => new Date(e.date) <= to);
  }
  if (req.query.limit) {
    log = log.slice(0, parseInt(req.query.limit));
  }

  res.json({
    username: user.username,
    count: log.length,
    _id: user._id,
    log: log.map(e => ({ description: e.description, duration: e.duration, date: e.date }))
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log('🚀 Server running on http://localhost:' + PORT);
});
