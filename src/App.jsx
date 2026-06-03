import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import MainLayout from './layouts/MainLayout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectDetails from './pages/ProjectDetails'
import Tasks from './pages/Tasks'
import TaskDetails from './pages/TaskDetails'
import Teams from './pages/Teams'
import Reports from './pages/Reports'
import ProtectedRoute from './routes/ProtectedRoute'


function App() {

  return (
    <BrowserRouter>

        <Routes>

          <Route
            path="/"
            element={<Navigate to="/login" replace />}
          />

          
          {/* PUBLIC ROUTE */}
          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />


          {/* PROTECTED ROUTES */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>

                <MainLayout>
                  <Dashboard />
                </MainLayout>

              </ProtectedRoute>
            }
          />


          <Route
            path="/projects"
            element={
              <ProtectedRoute>

                <MainLayout>
                  <Projects />
                </MainLayout>

              </ProtectedRoute>
            }
          />


          <Route
            path="/projects/:projectId"
            element={
              <ProtectedRoute>

                <MainLayout>
                  <ProjectDetails />
                </MainLayout>

              </ProtectedRoute>
            }
          />


          <Route
            path="/tasks"
            element={
              <ProtectedRoute>

                <MainLayout>
                  <Tasks />
                </MainLayout>

              </ProtectedRoute>
            }
          />

          <Route
            path="/tasks/:taskId"
            element={
              <ProtectedRoute>

                <MainLayout>
                  <TaskDetails />
                </MainLayout>

              </ProtectedRoute>
            }
          />


          <Route
            path="/teams"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Teams />
                </MainLayout>

              </ProtectedRoute>
            }
          />


          <Route
            path="/reports"
            element={
              <ProtectedRoute>

                <MainLayout>
                  <Reports />
                </MainLayout>

              </ProtectedRoute>
            }
          />

        </Routes>

    </BrowserRouter>
  )
}

export default App
