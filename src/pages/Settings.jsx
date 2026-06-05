import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// Decode JWT token to get user info (no backend call needed)
const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return decoded
  } catch {
    return null
  }
}

const Settings = () => {
  const navigate = useNavigate()

  const [name, setName]     = useState('')
  const [email, setEmail]   = useState('')
  const [role, setRole]     = useState('')
  const [profileMsg, setProfileMsg] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMsg, setPasswordMsg]         = useState({ text: '', type: '' })

  const [notifTaskAssigned,    setNotifTaskAssigned]    = useState(true)
  const [notifTaskCompleted,   setNotifTaskCompleted]   = useState(true)
  const [notifProjectUpdates,  setNotifProjectUpdates]  = useState(false)
  const [notifWeeklyReport,    setNotifWeeklyReport]    = useState(true)
  const [notifSaved,           setNotifSaved]           = useState(false)

  const [theme,    setTheme]    = useState('light')
  const [language, setLanguage] = useState('en')

  // ── Load user from JWT token ──────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    const decoded = decodeToken(token)
    if (decoded) {
      setName(decoded.name  || decoded.username || '')
      setEmail(decoded.email || '')
      setRole(decoded.role  || 'Team Member')
    }
  }, [])

  // ── Profile save — local only (no backend endpoint) ──
  const handleProfileSave = (e) => {
    e.preventDefault()
    // Store in localStorage so it persists across refreshes
    const token = localStorage.getItem('token')
    if (token) {
      localStorage.setItem('userProfile', JSON.stringify({ name, email, role }))
    }
    setProfileMsg('success')
    setTimeout(() => setProfileMsg(''), 3000)
  }

  // ── Password validation only (no backend endpoint) ───
  const handlePasswordSave = (e) => {
    e.preventDefault()
    if (!currentPassword) {
      setPasswordMsg({ text: 'Please enter your current password.', type: 'error' })
      return
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ text: 'New password must be at least 6 characters.', type: 'error' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'Passwords do not match.', type: 'error' })
      return
    }
    // Backend has no change-password endpoint — show honest message
    setPasswordMsg({
      text: 'Password change is not supported by this backend. Only login credentials set during signup are valid.',
      type: 'warn',
    })
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setTimeout(() => setPasswordMsg({ text: '', type: '' }), 5000)
  }

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

  // Load saved prefs on mount
  useEffect(() => {
    const saved = localStorage.getItem('userProfile')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.name)  setName(parsed.name)
        if (parsed.email) setEmail(parsed.email)
        if (parsed.role)  setRole(parsed.role)
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

  return (
    <section className="page-section">

      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your account, preferences, and workspace configuration.</p>
      </div>

      <div className="settings-grid">

        {/* ── LEFT ──────────────────────────────────────── */}
        <div className="settings-left">

          {/* PROFILE */}
          <div className="dashboard-card settings-card">
            <div className="settings-card-header">
              <h2>Profile Information</h2>
              <p>Update your display name, email, and role.</p>
            </div>

            <div className="settings-avatar-row">
              <div className="settings-avatar">
                {name ? name[0].toUpperCase() : 'U'}
              </div>
              <div>
                <strong>{name || 'User'}</strong>
                <span>{email}</span>
              </div>
            </div>

            <form className="settings-form" onSubmit={handleProfileSave}>
              <label className="modal-field">
                <span>Full Name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </label>

              <label className="modal-field">
                <span>Email Address</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </label>

              <label className="modal-field">
                <span>Role</span>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Developer, Designer"
                />
              </label>

              {profileMsg === 'success' && (
                <p className="settings-success-msg">✅ Profile saved locally!</p>
              )}

              <button type="submit" className="tasks-add-btn">
                Save Profile
              </button>
            </form>
          </div>

          {/* CHANGE PASSWORD */}
          <div className="dashboard-card settings-card">
            <div className="settings-card-header">
              <h2>Change Password</h2>
              <p>Use a strong password of at least 6 characters.</p>
            </div>

            <form className="settings-form" onSubmit={handlePasswordSave}>
              <label className="modal-field">
                <span>Current Password</span>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </label>

              <label className="modal-field">
                <span>New Password</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                />
              </label>

              <label className="modal-field">
                <span>Confirm New Password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                />
              </label>

              {passwordMsg.text && (
                <p className={
                  passwordMsg.type === 'success' ? 'settings-success-msg'
                  : passwordMsg.type === 'warn'  ? 'settings-warn-msg'
                  : 'settings-error-msg'
                }>
                  {passwordMsg.text}
                </p>
              )}

              <button type="submit" className="tasks-add-btn">
                Update Password
              </button>
            </form>
          </div>

        </div>

        {/* ── RIGHT ─────────────────────────────────────── */}
        <div className="settings-right">

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
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setter(e.target.checked)}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
              ))}
            </div>

            {notifSaved && (
              <p className="settings-success-msg" style={{ marginTop: '1rem' }}>
                ✅ Notification preferences saved!
              </p>
            )}

            <button
              type="button"
              className="tasks-add-btn"
              style={{ marginTop: '1rem' }}
              onClick={handleNotifSave}
            >
              Save Preferences
            </button>
          </div>

          {/* APPEARANCE */}
          <div className="dashboard-card settings-card">
            <div className="settings-card-header">
              <h2>Appearance</h2>
              <p>Customize the look and feel of your workspace.</p>
            </div>

            <div className="settings-form">
              <label className="modal-field">
                <span>Theme</span>
                <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System Default</option>
                </select>
              </label>

              <label className="modal-field">
                <span>Language</span>
                <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </label>
            </div>
          </div>

          {/* ACCOUNT */}
          <div className="dashboard-card settings-card settings-danger-card">
            <div className="settings-card-header">
              <h2>Account</h2>
              <p>Manage your session and account access.</p>
            </div>

            <div className="settings-danger-actions">
              <div className="settings-danger-row">
                <div>
                  <strong>Sign Out</strong>
                  <span>Log out of your current session</span>
                </div>
                <button
                  type="button"
                  className="settings-logout-btn"
                  onClick={handleLogout}
                >
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