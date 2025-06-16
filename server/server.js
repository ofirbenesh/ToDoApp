const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors());
app.use(express.json());

// Import and setup task routes with io instance
const createTaskRoutes = require('./routes/tasks');
const taskRepository = require('./repositories/taskRepository');

// Pass io instance to routes
app.use('/api/tasks', createTaskRoutes(io));

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('client_ready', (data) => {
    console.log(`Client ${socket.id} is ready:`, data);
  });

  // Handle client starting to edit a task
  socket.on('start_editing', async (taskId) => {
    try {
      const task = await taskRepository.findById(taskId);
      if (!task) {
        socket.emit('edit_error', { message: 'Task not found' });
        return;
      }

      // Check if task is already being edited by another client
      if (task.editingBy && task.editingBy !== socket.id) {
        socket.emit('edit_error', { message: 'Task is being edited by another user' });
        return;
      }

      // Lock the task for this client
      const updatedTask = await taskRepository.updateTask(taskId, { editingBy: socket.id });
      
      // Notify all clients about the edit lock
      io.emit('task_edit_started', { taskId, editingBy: socket.id });
      socket.emit('edit_started', updatedTask);
      
      console.log(`Client ${socket.id} started editing task ${taskId}`);
    } catch (error) {
      console.error('Error starting edit:', error);
      socket.emit('edit_error', { message: 'Failed to start editing' });
    }
  });

  // Handle client stopping edit mode
  socket.on('stop_editing', async (taskId) => {
    try {
      const task = await taskRepository.findById(taskId);
      if (!task) {
        socket.emit('edit_error', { message: 'Task not found' });
        return;
      }

      // Only allow the client who locked the task to unlock it
      if (task.editingBy === socket.id) {
        const updatedTask = await taskRepository.updateTask(taskId, { editingBy: null });
        
        // Notify all clients that edit mode ended
        io.emit('task_edit_stopped', { taskId });
        socket.emit('edit_stopped', updatedTask);
        
        console.log(`Client ${socket.id} stopped editing task ${taskId}`);
      }
    } catch (error) {
      console.error('Error stopping edit:', error);
      socket.emit('edit_error', { message: 'Failed to stop editing' });
    }
  });

  // Handle client disconnect - release any tasks they were editing
  socket.on('disconnect', async () => {
    console.log(`Client disconnected: ${socket.id}`);
    
    try {
      // Find and release all tasks being edited by this client
      const tasks = await taskRepository.getTasksEditingBy(socket.id);
      
      for (const task of tasks) {
        await taskRepository.updateTask(task._id, { editingBy: null });
        io.emit('task_edit_stopped', { taskId: task._id });
        console.log(`Released task ${task._id} from disconnected client ${socket.id}`);
      }
    } catch (error) {
      console.error('Error cleaning up tasks on disconnect:', error);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
