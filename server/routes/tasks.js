const express = require('express');
const router = express.Router();
const taskRepository = require('../repositories/taskRepository');
const { io } = require('../server');

// GET all tasks
router.get('/', async (req, res) => {
  const tasks = await taskRepository.getAllTasks();
  res.json(tasks);
});

// POST create task
router.post('/', async (req, res) => {
  const newTask = await taskRepository.createTask(req.body);
  io.emit('task_created', newTask);
  res.status(201).json(newTask);
});

// PUT update task
router.put('/:id', async (req, res) => {
  const updated = await taskRepository.updateTask(req.params.id, req.body);
  io.emit('task_updated', updated);
  res.json(updated);
});

// DELETE task
router.delete('/:id', async (req, res) => {
  await taskRepository.deleteTask(req.params.id);
  io.emit('task_deleted', req.params.id);
  res.sendStatus(204);
});

module.exports = router;
