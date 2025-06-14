const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  editingBy: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);