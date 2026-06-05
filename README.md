# Workasana — Project Management App

A full-stack project management application built with React (frontend) and Express + MongoDB (backend).

## Features

- **Authentication** — Signup, Login, JWT-based protected routes
- **Dashboard** — Overview of projects, tasks with quick filters
- **Projects** — Create and manage projects, view tasks per project
- **Tasks** — Kanban board (To Do / In Progress / Completed / Blocked), create, edit, delete tasks with tag chips, owner multi-select, due date
- **Teams** — View members and teams, create new teams, filter by member or team
- **Reports** — Chart.js visualizations — status pie chart, tasks closed by team/owner/project, pending work bar chart
- **Settings** — Profile management, notification preferences, sign out

## Tech Stack

- **Frontend:** React, React Router, Axios, Chart.js, React Icons
- **Backend:** Express.js, MongoDB, Mongoose, JWT

## Getting Started

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd WORKASANA
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root:

```
VITE_API_URL=https://workasana-backend-iota.vercel.app/api
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Project Structure

```
src/
├── App.jsx
├── index.css
├── pages/          # Login, Signup, Dashboard, Projects, Tasks, Teams, Reports, Settings
├── components/     # Sidebar, Navbar, ProjectCard, TaskCard, TeamCard, EmptyState
├── layouts/        # MainLayout
├── hooks/          # useWorkspaceData (global state)
├── services/       # api.js, authApi.js, taskApi.js
├── utils/          # entity.js, taskUtils.js
└── styles/         # CSS files per component/page
```

## Backend API

Base URL: `https://workasana-backend-iota.vercel.app/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Create account |
| POST | /auth/login | Login |
| GET | /projects | Get all projects |
| POST | /projects | Create project |
| GET | /tasks | Get all tasks |
| POST | /tasks | Create task |
| PUT | /tasks/:id | Update task |
| DELETE | /tasks/:id | Delete task |
| GET | /teams | Get all teams |
| POST | /teams | Create team |
| GET | /users | Get all users |