const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { exec } = require('child_process'); // ✅ For running shell commands

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/taskmanager', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

const taskExecutionSchema = new mongoose.Schema({
  startTime: Date,
  endTime: Date,
  output: String,
});

const taskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: String, required: true },
  command: { type: String, required: true },
  taskExecutions: [taskExecutionSchema],
});

const Task = mongoose.model('Task', taskSchema);

// Create Task
app.post('/tasks', async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all Tasks
app.get('/tasks', async (req, res) => {
  const { search } = req.query;
  const query = search
    ? { name: { $regex: search, $options: 'i' } }
    : {};
  const tasks = await Task.find(query);
  res.json(tasks);
});

// Delete Task
app.delete('/tasks/:id', async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json({ success: true });
});

// Run command (with real execution)
app.post('/tasks/:id/run', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const startTime = new Date();

    exec(task.command, { timeout: 10000 }, async (error, stdout, stderr) => {
      const endTime = new Date();

      const output = error ? (stderr || error.message) : stdout;

      const execRecord = { startTime, endTime, output };
      task.taskExecutions.push(execRecord);
      await task.save();

      res.json(execRecord);
    });
  } catch (err) {
    console.error('Execution error:', err);
    res.status(500).json({ error: 'Command execution failed' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
