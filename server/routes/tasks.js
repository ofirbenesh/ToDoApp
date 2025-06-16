const express = require('express');
const taskRepository = require('../repositories/taskRepository');

// Export a function that accepts io instance
module.exports = (io) => {
  const router = express.Router();

  // GET all tasks
  router.get('/', async (req, res) => {
    const tasks = await taskRepository.getAllTasks();
    res.json(tasks);
  });

  // POST create task
  router.post('/', async (req, res) => {
    try {
      const newTask = await taskRepository.createTask(req.body);
      console.log('🚀 Emitting task_created event:', newTask);
      io.emit('task_created', newTask);
      res.status(201).json(newTask);
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ message: 'Failed to create task' });
    }
  });

  // PUT update task
  router.put('/:id', async (req, res) => {
    try {
      const updated = await taskRepository.updateTask(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ message: 'Task not found' });
      }
      console.log('🔄 Emitting task_updated event:', updated);
      io.emit('task_updated', updated);
      res.json(updated);
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ message: 'Failed to update task' });
    }
  });

  router.patch('/:id/start-edit', async (req, res) => {
    try {
      const task = await taskRepository.findById(req.params.id);
      if (!task) return res.status(404).json({ message: 'Task not found' });
    
      if (task.editingBy && task.editingBy !== req.body.userId) {
        return res.status(409).json({ message: 'Task is already being edited' });
      }
    
      task.editingBy = req.body.userId;
      await task.save();
      console.log('🔒 Emitting task_locked event:', task);
      io.emit('task_locked', task);
      res.json(task);
    } catch (error) {
      console.error('Error locking task:', error);
      res.status(500).json({ message: 'Failed to lock task' });
    }
  });

  router.patch('/:id/end-edit', async (req, res) => {
    try {
      const task = await taskRepository.findById(req.params.id);
      if (!task) return res.status(404).json({ message: 'Task not found' });
    
      task.editingBy = null;
      await task.save();
      console.log('🔓 Emitting task_unlocked event:', task);
      io.emit('task_unlocked', task);
      res.json(task);
    } catch (error) {
      console.error('Error unlocking task:', error);
      res.status(500).json({ message: 'Failed to unlock task' });
    }
  });

  // DELETE task
  router.delete('/:id', async (req, res) => {
    try {
      const deleted = await taskRepository.deleteTask(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Task not found' });
      }
      console.log('🗑️ Emitting task_deleted event for ID:', req.params.id);
      io.emit('task_deleted', req.params.id);
      res.sendStatus(204);
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ message: 'Failed to delete task' });
    }
  });

  return router;
};