const Task = require('../models/Task');

class TaskRepository {
  async getAllTasks() {
    return Task.find();
  }

  async createTask(taskData) {
    const task = new Task(taskData);
    return task.save();
  }

  async updateTask(id, updates) {
    return Task.findByIdAndUpdate(id, updates, { new: true });
  }

  async deleteTask(id) {
    return Task.findByIdAndDelete(id);
  }

  async findById(id) {
    return Task.findById(id);
  }
}

module.exports = new TaskRepository();