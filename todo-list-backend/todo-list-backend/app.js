const express = require('express');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());

// Sequelize setup
const sequelize = new Sequelize('todolist', 'postgres', 'yourpassword', {
  dialect: 'postgres',
  host: 'localhost',
});

// Model for tasks
const Task = sequelize.define('task', {
  title: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  completed: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
});

// Authentication middleware
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, 'super-secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// RESTful API endpoints
app.get('/tasks/:task_id', authenticateToken, async (req, res) => {
  const task = await Task.findByPk(req.params.task_id);
  if (task) {
    res.json(task);
  } else {
    res.status(404).json({ message: 'Task not found' });
  }
});

app.put('/tasks/:task_id', authenticateToken, async (req, res) => {
  const task = await Task.findByPk(req.params.task_id);
  if (task) {
    task.title = req.body.title;
    task.completed = req.body.completed;
    await task.save();
    res.json({ message: 'Task updated successfully' });
  } else {
    res.status(404).json({ message: 'Task not found' });
  }
});

app.delete('/tasks/:task_id', authenticateToken, async (req, res) => {
  const task = await Task.findByPk(req.params.task_id);
  if (task) {
    await task.destroy();
    res.json({ message: 'Task deleted successfully' });
  } else {
    res.status(404).json({ message: 'Task not found' });
  }
});

// Running the server
sequelize.sync().then(() => {
  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
});
