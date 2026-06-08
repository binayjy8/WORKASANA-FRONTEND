import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteTask, createTask } from '../services/taskApi'
import { createProject, getProjects } from '../services/api'
import { useWorkspaceData } from '../hooks/useWorkspaceData'
import { getEntityId } from '../utils/entity'
import api from '../services/api'

const decodeToken = (token) => {
  try { return JSON.parse(atob(token.split('.')[1])) } catch { return null }
}

const Settings = () => {
  const navigate = useNavigate()
  const { tasks, projects, teams, removeTask, addProject } = useWorkspaceData()

  // Profile from token
  const [name, setName]   = useState('')
  const [email, setEmail] = useState('')

  // Notifications (localStorage)
  const [notifTaskAssigned,   setNotifTaskAssigned]   = useState(true)
  const [notifTaskCompleted,  setNotifTaskCompleted]  = useState(true)
  const [notifProjectUpdates, setNotifProjectUpdates] = useState(false)
  const [notifWeeklyReport,   setNotifWeeklyReport]   = useState(true)
  const [notifSaved,          setNotifSaved]          = useState(false)

  // Delete states
  const [selectedTaskId,    setSelectedTaskId]    = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [selectedTeamId,    setSelectedTeamId]    = useState('')
  const [deleteMsg,         setDeleteMsg]         = useState('')
  const [isDeleting,        setIsDeleting]        = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      const decoded = decodeToken(token)
      if (decoded) {
        setName(decoded.name || decoded.username || 'Mohan')
        setEmail(decoded.email || '')
      }
    }
    const saved = localStorage.getItem('userProfile')
    if (saved) {
      try {
        const p = JSON.parse(saved)
        if (p.name)  setName(p.name)
        if (p.email) setEmail(p.email)
      } catch { /* ignore */ }
    }
    const notifPrefs = localStorage.getItem('notifPrefs')
    if (notifPrefs) {
      try {
        const p = JSON.parse(notifPrefs)
        if (p.notifTaskAssigned   !== undefined) setNotifTaskAssigned(p.notifTaskAssigned)
        if (p.notifTaskCompleted  !== undefined) setNotifTaskCompleted(p.notifTaskCompleted)
        if (p.notifProjectUpdates !== undefined) setNotifProjectUpdates(p.notifProjectUpdates)
        if (p.notifWeeklyReport   !== undefined) setNotifWeeklyReport(p.notifWeeklyReport)
      } catch { /* ignore */ }
    }
  }, [])

  const handleNotifSave = () => {
    localStorage.setItem('notifPrefs', JSON.stringify({
      notifTaskAssigned, notifTaskCompleted, notifProjectUpdates, notifWeeklyReport,
    }))
    setNotifSaved(true)
    setTimeout(() => setNotifSaved(false), 2500)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const showMsg = (msg) => {
    setDeleteMsg(msg)
    setTimeout(() => setDeleteMsg(''), 3500)
  }

  const handleDeleteTask = async () => {
    if (!selectedTaskId) { showMsg('⚠️ Please select a task to delete.'); return }
    if (!window.confirm('Are you sure you want to delete this task?')) return
    setIsDeleting(true)
    try {
      await deleteTask(selectedTaskId)
      removeTask(selectedTaskId)
      setSelectedTaskId('')
      showMsg('✅ Task deleted successfully!')
    } catch (err) {
      showMsg('❌ Failed to delete task: ' + (err.response?.data?.message || err.message))
    } finally { setIsDeleting(false) }
  }

  const handleDeleteProject = async () => {
    if (!selectedProjectId) { showMsg('⚠️ Please select a project to delete.'); return }
    if (!window.confirm('Are you sure? This will delete the project permanently.')) return
    setIsDeleting(true)
    try {
      await api.delete(`/projects/${selectedProjectId}`)
      showMsg('✅ Project deleted! Refresh the page to see changes.')
      setSelectedProjectId('')
    } catch (err) {
      showMsg('❌ Failed to delete project: ' + (err.response?.data?.message || err.message))
    } finally { setIsDeleting(false) }
  }

  const handleDeleteTeam = async () => {
    if (!selectedTeamId) { showMsg('⚠️ Please select a team to delete.'); return }
    if (!window.confirm('Are you sure you want to delete this team?')) return
    setIsDeleting(true)
    try {
      await api.delete(`/teams/${selectedTeamId}`)
      showMsg('✅ Team deleted! Refresh the page to see changes.')
      setSelectedTeamId('')
    } catch (err) {
      showMsg('❌ Failed to delete team: ' + (err.response?.data?.message || err.message))
    } finally { setIsDeleting(false) }
  }

  return (
    <section className="page-section">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your account, workspace data, and preferences.</p>
      </div>

      <div className="settings-grid">

        {/* ── LEFT ──────────────────────────────────────── */}
        <div className="settings-left">

          {/* PROFILE — read only from token */}
          <div className="dashboard-card settings-card">
            <div className="settings-card-header">
              <h2>Profile</h2>
              <p>Your account information from your login session.</p>
            </div>
            <div className="settings-avatar-row">
              <div className="settings-avatar">{name ? name[0].toUpperCase() : 'U'}</div>
              <div>
                <strong>{name || 'User'}</strong>
                <span>{email || 'No email'}</span>
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
              To update your profile, please contact your workspace admin or update via the backend.
            </p>
          </div>

          {/* NOTIFICATIONS */}
          <div className="dashboard-card settings-card">
            <div className="settings-card-header">
              <h2>Notifications</h2>
              <p>Choose what activity you want to be notified about.</p>
            </div>
            <div className="settings-toggles">
              {[
                ['Task Assigned',   'When a task is assigned to you',           notifTaskAssigned,   setNotifTaskAssigned],
                ['Task Completed',  'When one of your tasks is marked complete', notifTaskCompleted,  setNotifTaskCompleted],
                ['Project Updates', "When a project you're on is updated",       notifProjectUpdates, setNotifProjectUpdates],
                ['Weekly Report',   'Summary of workspace activity each week',   notifWeeklyReport,   setNotifWeeklyReport],
              ].map(([label, desc, value, setter]) => (
                <div key={label} className="settings-toggle-row">
                  <div>
                    <strong>{label}</strong>
                    <span>{desc}</span>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={value} onChange={(e) => setter(e.target.checked)} />
                    <span className="toggle-slider" />
                  </label>
                </div>
              ))}
            </div>
            {notifSaved && <p className="settings-success-msg" style={{ marginTop: '1rem' }}>✅ Preferences saved!</p>}
            <button type="button" className="tasks-add-btn" style={{ marginTop: '1rem' }} onClick={handleNotifSave}>
              Save Preferences
            </button>
          </div>

        </div>

        {/* ── RIGHT ─────────────────────────────────────── */}
        <div className="settings-right">

          {/* DELETE WORKSPACE DATA */}
          <div className="dashboard-card settings-card">
            <div className="settings-card-header">
              <h2>Manage Workspace Data</h2>
              <p>Delete tasks, projects, or teams from your workspace.</p>
            </div>

            {deleteMsg && (
              <p className={deleteMsg.startsWith('✅') ? 'settings-success-msg' : 'settings-error-msg'}
                style={{ marginBottom: '1rem' }}>
                {deleteMsg}
              </p>
            )}

            {/* DELETE TASK */}
            <div className="settings-delete-section">
              <label className="modal-field">
                <span>Delete Task</span>
                <select value={selectedTaskId} onChange={(e) => setSelectedTaskId(e.target.value)}>
                  <option value="">— Select a task —</option>
                  {tasks.map((t) => (
                    <option key={getEntityId(t)} value={getEntityId(t)}>
                      {t.title || t.name || 'Untitled'}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" className="settings-delete-btn"
                onClick={handleDeleteTask} disabled={isDeleting || !selectedTaskId}>
                🗑 Delete Task
              </button>
            </div>

            {/* DELETE PROJECT */}
            <div className="settings-delete-section">
              <label className="modal-field">
                <span>Delete Project</span>
                <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)}>
                  <option value="">— Select a project —</option>
                  {projects.map((p) => (
                    <option key={getEntityId(p)} value={getEntityId(p)}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" className="settings-delete-btn"
                onClick={handleDeleteProject} disabled={isDeleting || !selectedProjectId}>
                🗑 Delete Project
              </button>
            </div>

            {/* DELETE TEAM */}
            <div className="settings-delete-section">
              <label className="modal-field">
                <span>Delete Team</span>
                <select value={selectedTeamId} onChange={(e) => setSelectedTeamId(e.target.value)}>
                  <option value="">— Select a team —</option>
                  {teams.map((t) => (
                    <option key={getEntityId(t)} value={getEntityId(t)}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" className="settings-delete-btn"
                onClick={handleDeleteTeam} disabled={isDeleting || !selectedTeamId}>
                🗑 Delete Team
              </button>
            </div>
          </div>

          {/* ACCOUNT */}
          <div className="dashboard-card settings-card settings-danger-card">
            <div className="settings-card-header">
              <h2>Account</h2>
              <p>Manage your session.</p>
            </div>
            <div className="settings-danger-actions">
              <div className="settings-danger-row">
                <div>
                  <strong>Sign Out</strong>
                  <span>Log out of your current session</span>
                </div>
                <button type="button" className="settings-logout-btn" onClick={handleLogout}>
                  Sign Out
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default Settings
