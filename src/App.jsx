import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Login          from './pages/Login'
import Signup         from './pages/Signup'
import Dashboard      from './pages/Dashboard'
import Projects       from './pages/Projects'
import ProjectDetails from './pages/ProjectDetails'
import Tasks          from './pages/Tasks'
import TaskDetails    from './pages/TaskDetails'
import Teams          from './pages/Teams'
import Reports        from './pages/Reports'
import Settings       from './pages/Settings'

import MainLayout     from './layouts/MainLayout'
import ProtectedRoute from './components/ProtectedRoute'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/login"  element={<Login />}  />
        <Route path="/signup" element={<Signup />} />

        {/* Protected */}
        <Route path="/dashboard" element={
          <ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>
        } />

        <Route path="/projects" element={
          <ProtectedRoute><MainLayout><Projects /></MainLayout></ProtectedRoute>
        } />

        <Route path="/projects/:projectId" element={
          <ProtectedRoute><MainLayout><ProjectDetails /></MainLayout></ProtectedRoute>
        } />

        <Route path="/tasks" element={
          <ProtectedRoute><MainLayout><Tasks /></MainLayout></ProtectedRoute>
        } />

        <Route path="/tasks/:taskId" element={
          <ProtectedRoute><MainLayout><TaskDetails /></MainLayout></ProtectedRoute>
        } />

        <Route path="/teams" element={
          <ProtectedRoute><MainLayout><Teams /></MainLayout></ProtectedRoute>
        } />

        <Route path="/reports" element={
          <ProtectedRoute><MainLayout><Reports /></MainLayout></ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute><MainLayout><Settings /></MainLayout></ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
