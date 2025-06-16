# ToDoApp

**ToDoApp** is a full-stack task management app with real-time collaboration. It supports creating, editing, deleting, and completing tasks across multiple clients using Angular (frontend), Node.js with Express (backend), and MongoDB (database). All task changes are synchronized in real time, and edit-locking ensures no two users can edit the same task simultaneously.

---

## 🚀 Features

- Add, edit, delete tasks
- Mark tasks as completed/incomplete
- Real-time updates using WebSockets (Socket.IO)
- Edit-lock mechanism per task (only one client can edit at a time)
- Responsive UI using Angular Material
- User authentication with JWT (bonus)

---

## 🛠 Technologies Used

### Frontend
- **Angular 17**
- **RxJS** for reactive data streams
- **Angular Material** for UI components
- **Socket.IO Client** for real-time updates
- **SCSS** styling
- **FormsModule** and **ReactiveFormsModule**

### Backend
- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose**
- **Socket.IO Server**
- **JWT (JSON Web Tokens)** for authentication
- **Dotenv** for environment configuration

---

## 📐 Design Patterns

- **Repository Pattern** (Backend): Encapsulates all DB interactions in a dedicated layer
- **Singleton Pattern** (Backend): Manages a single shared Socket.IO instance
- **Service Pattern** (Frontend): Handles API communication and shared state via Angular services
- **Reactive Programming** (Frontend): Real-time UI updates with `BehaviorSubject` from RxJS

---

## 📦 Prerequisites

Make sure you have the following installed:

- **Node.js** (v18+)
- **npm** (v8+)
- **MongoDB** running locally or via cloud URI
- **Angular CLI** (`npm install -g @angular/cli`)

---

## 🧪 Installation and Setup

```bash
# Clone this repository
$ git clone https://github.com/ofirbenesh/ToDoApp.git
$ cd ToDoApp

# ---- Backend Setup ----
$ cd server
$ npm install

# Create a .env file with the following:
MONGO_URI=mongodb://localhost:27017/tasks
JWT_SECRET=yourSecretKey

# Start backend server
$ npm run dev
# Runs at http://localhost:3000

# ---- Frontend Setup ----
$ cd ../client
$ npm install

# Start frontend server
$ npm start
# Runs at http://localhost:4200
