const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files (HTML form)
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB (using mongoose)
mongoose.connect('mongodb://localhost:27017/exercise-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('Error connecting to MongoDB:', err));

// Define User and Exercise Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
});

const exerciseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: String,
  duration: Number,
  date: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);

// Serve the form to create a new user
app.get('/', (req, res) => {
  res.send(`
    <h1>Exercise Tracker</h1>
    <form action="/api/exercise/new-user" method="POST">
      <label for="username">Enter your username:</label>
      <input type="text" id="username" name="username" required>
      <button type="submit">Create User</button>
    </form>

    <hr>

    <form action="/api/exercise/add" method="POST">
      <label for="userId">User ID:</label>
      <input type="text" id="userId" name="userId" required><br><br>

      <label for="description">Exercise Description:</label>
      <input type="text" id="description" name="description" required><br><br>

      <label for="duration">Duration (in minutes):</label>
      <input type="number" id="duration" name="duration" required><br><br>

      <label for="date">Date:</label>
      <input type="date" id="date" name="date"><br><br>

      <button type="submit">Add Exercise</button>
    </form>

    <hr>

    <h2>Exercise Log</h2>
    <form action="/api/exercise/log" method="GET">
      <label for="logUserId">User ID:</label>
      <input type="text" id="logUserId" name="userId" required><br><br>

      <label for="from">From:</label>
      <input type="date" id="from" name="from"><br><br>

      <label for="to">To:</label>
      <input type="date" id="to" name="to"><br><br>

      <label for="limit">Limit:</label>
      <input type="number" id="limit" name="limit"><br><br>

      <button type="submit">Get Exercise Log</button>
    </form>
  `);
});

// Create a new user
app.post('/api/exercise/new-user', async (req, res) => {
  const { username } = req.body;
  const newUser = new User({ username });

  try {
    const savedUser = await newUser.save();
    res.json({
      username: savedUser.username,
      _id: savedUser._id,
    });
  } catch (err) {
    res.status(500).json({ error: 'Error creating new user' });
  }
});

// Add a new exercise for an existing user
app.post('/api/exercise/add', async (req, res) => {
  const { userId, description, duration, date } = req.body;
  const exercise = new Exercise({
    userId,
    description,
    duration,
    date: date ? new Date(date) : new Date(),
  });

  try {
    const savedExercise = await exercise.save();
    const user = await User.findById(userId);
    res.json({
      username: user.username,
      description: savedExercise.description,
      duration: savedExercise.duration,
      date: savedExercise.date.toDateString(),
      _id: user._id,
    });
  } catch (err) {
    res.status(500).json({ error: 'Error adding exercise' });
  }
});

// Get exercise logs for a user
app.get('/api/exercise/log', async (req, res) => {
  const { userId, from, to, limit } = req.query;
  
  let filter = { userId };

  if (from) filter.date = { $gte: new Date(from) };
  if (to) filter.date = { $lte: new Date(to) };

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ error: 'User not found' });
    }

    let exercises = await Exercise.find(filter)
      .limit(Number(limit) || 100)
      .exec();

    const log = exercises.map(ex => ({
      description: ex.description,
      duration: ex.duration,
      date: ex.date.toDateString(),
    }));

    res.json({
      username: user.username,
      count: log.length,
      _id: user._id,
      log,
    });
  } catch (err) {
    res.status(500).json({ error: 'Error retrieving exercise logs' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Exercise Tracker running on port ${PORT}`);
});
