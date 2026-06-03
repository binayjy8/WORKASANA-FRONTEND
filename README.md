# Workasana - Project Management Platform

A full-stack MERN project management application built with React, Node.js, Express, MongoDB, and JWT authentication.

## Features

* User Authentication (JWT)
* Protected Routes
* Project Management
* Task Management
* Team Management
* Task Status Updates
* Dashboard Overview
* Search Functionality
* MongoDB Database Integration
* REST API Architecture
* Responsive UI
* Backend Deployment on Vercel

---

## Tech Stack

### Frontend

* React.js
* React Router DOM
* Axios
* React Icons
* CSS

### Backend

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* JWT Authentication
* bcryptjs

---

## Folder Structure

```bash
client/
server/
```

---

## Environment Variables

### Backend `.env`

```env
MONGODB=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

### Frontend `.env`

```env
VITE_API_URL=your_backend_url/api
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/your-username/workasana.git
```

---

### Backend Setup

```bash
cd server
npm install
npm run dev
```

---

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

---

## API Routes

### Auth

* POST `/api/auth/register`
* POST `/api/auth/login`

### Projects

* GET `/api/projects`
* POST `/api/projects`

### Tasks

* GET `/api/tasks`
* POST `/api/tasks`
* PUT `/api/tasks/:id`
* DELETE `/api/tasks/:id`

### Teams

* GET `/api/teams`
* POST `/api/teams`

---

## Demo Credentials

```text
Email: chinmay@gmail.com
Password: 123456
```

---

## Live Demo

Frontend:

```text
Add frontend deployment URL here
```

Backend:

```text
Add backend deployment URL here
```

---


## Future Improvements

* Drag & Drop Kanban Board
* Role-Based Authentication
* Notifications
* Dark Mode
* Real-time Collaboration
* Analytics Dashboard

---

## Author

Built by Binay using the MERN Stack.
