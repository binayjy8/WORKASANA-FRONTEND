import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { updateTask } from '../services/taskApi'
import { useWorkspaceData } from '../hooks/useWorkspaceData'
import { getEntityId, isSameEntityId } from '../utils/entity'
import { taskStatusOptions, toDisplayStatus } from '../utils/taskUtils'

const statusPillClass = (status) => {
  switch (status) {
    case 'Completed':   return 'task-pill-completed'
    case 'In Progress': return 'task-pill-progress'
    case 'Blocked':     return 'task-pill-blocked'
    default:            return 'task-pill-pending'
  }
}

// Tag chip input
const TagInput = ({ tags, onChange }) => {
  const [input, setInput] = useState('')
  const add = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = input.trim().replace(/,$/, '')
      if (val && !tags.includes(val)) onChange([...tags, val])
      setInput('')
    }
  }
  return (
    <div className="tag-input-wrapper">
      {tags.map((tag) => (
        <span key={tag} className="tag-chip">
          {tag}
          <button type="button" className="tag-chip-remove"
            onClick={() => onChange(tags.filter((t) => t !== tag))}>×</button>
        </span>
      ))}
      <input
        type="text"
        className="tag-chip-input"
        placeholder={tags.length === 0 ? 'e.g. Urgent…' : ''}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={add}
      />
    </div>
  )
}

const InfoRow = ({ label, value }) => (
  <div className="task-info-row">
    <span className="task-info-label">{label}</span>
    <strong className="task-info-value">{value || '—'}</strong>
  </div>
)

const TaskDetails = () => {
  const { taskId } = useParams()
  const { tasks, projects, teams, users, updateTaskInStore, isLoading, error } =
    useWorkspaceData()

  const task = tasks.find((item) => isSameEntityId(getEntityId(item), taskId))

  const project = projects.find(
    (item) =>
      isSameEntityId(getEntityId(item), task?.project) ||
      item.title === task?.project ||
      item.title === task?.project?.title ||
      item.title === task?.project?.name,
  )

  // ── Edit modal state ──────────────────────────────────
  const [isEditing, setIsEditing]         = useState(false)
  const [editName, setEditName]           = useState('')
  const [editProjectId, setEditProjectId] = useState('')
  const [editTeamId, setEditTeamId]       = useState('')
  const [editOwners, setEditOwners]       = useState([])
  const [editTags, setEditTags]           = useState([])
  const [editTime, setEditTime]           = useState('')
  const [editDueDate, setEditDueDate]     = useState('')
  const [editStatus, setEditStatus]       = useState('')
  const [isSaving, setIsSaving]           = useState(false)

  const openEdit = () => {
    setEditName(task.title || task.name || '')
    setEditProjectId(getEntityId(project) || '')
    setEditTeamId(task.team?._id || task.team || '')
    setEditOwners(task.owners || [])
    setEditTags(task.tags || [])
    setEditTime(String(task.timeToComplete || ''))
    setEditDueDate(task.dueDate || '')
    setEditStatus(toDisplayStatus(task.status))
    setIsEditing(true)
  }

  const toggleEditOwner = (uid) =>
    setEditOwners((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid],
    )

  const handleSave = async (e) => {
    e.preventDefault()
    if (!editName.trim()) { alert('Task name is required'); return }
    try {
      setIsSaving(true)
      const updated = await updateTask(getEntityId(task), {
        name:           editName.trim(),
        project:        editProjectId || undefined,
        team:           editTeamId    || undefined,
        owners:         editOwners,
        tags:           editTags,
        timeToComplete: Number(editTime) || 0,
        dueDate:        editDueDate || undefined,
        status:         editStatus,
      })
      updateTaskInStore(getEntityId(task), {
        ...updated,
        title: updated.title || updated.name || editName.trim(),
      })
      setIsEditing(false)
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Failed to save task')
    } finally {
      setIsSaving(false)
    }
  }

  // Quick status change (from status card, no modal)
  const handleStatusChange = async (status) => {
    if (!task) return
    try {
      const updated = await updateTask(getEntityId(task), { status })
      updateTaskInStore(getEntityId(task), updated)
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Failed to update status')
    }
  }

  // ── Loading / not found ───────────────────────────────
  if (!task && isLoading) {
    return (
      <section className="page-section">
        <div className="page-header"><h1>Loading task…</h1><p>Fetching task details…</p></div>
      </section>
    )
  }

  if (!task) {
    return (
      <section className="page-section">
        <div className="page-header">
          <h1>Task not found</h1>
          <p>This task does not exist or has been removed.</p>
        </div>
        <Link to="/tasks" className="project-add-btn" style={{ display: 'inline-flex', marginTop: '1rem' }}>← Back to Tasks</Link>
      </section>
    )
  }

  const displayStatus = toDisplayStatus(task.status)
  const isCompleted   = displayStatus === 'Completed'

  return (
    <section className="page-section">

      {/* ── EDIT MODAL ─────────────────────────────────── */}
      {isEditing && (
        <div className="modal-backdrop" onClick={() => setIsEditing(false)}>
          <div
            className="task-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header">
              <h2>Edit Task</h2>
              <button type="button" className="modal-close-btn" onClick={() => setIsEditing(false)}>✕</button>
            </div>

            <form className="modal-form" onSubmit={handleSave}>
              <label className="modal-field">
                <span>Task Name *</span>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required autoFocus />
              </label>

              <div className="modal-row">
                <label className="modal-field">
                  <span>Project</span>
                  <select value={editProjectId} onChange={(e) => setEditProjectId(e.target.value)}>
                    <option value="">— None —</option>
                    {projects.map((p) => (
                      <option key={getEntityId(p)} value={getEntityId(p)}>{p.title}</option>
                    ))}
                  </select>
                </label>
                <label className="modal-field">
                  <span>Team</span>
                  <select value={editTeamId} onChange={(e) => setEditTeamId(e.target.value)}>
                    <option value="">— None —</option>
                    {teams.map((t) => (
                      <option key={getEntityId(t)} value={getEntityId(t)}>{t.name}</option>
                    ))}
                  </select>
                </label>
              </div>

              {users.length > 0 && (
                <div className="modal-field">
                  <span>Owners</span>
                  <div className="modal-owners-grid">
                    {users.map((u) => {
                      const uid = getEntityId(u)
                      const selected = editOwners.includes(uid)
                      return (
                        <button key={uid} type="button"
                          className={`owner-chip ${selected ? 'owner-chip--selected' : ''}`}
                          onClick={() => toggleEditOwner(uid)}>
                          <span className="owner-chip-avatar">{String(u.name || 'U')[0].toUpperCase()}</span>
                          <span>{u.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="modal-field">
                <span>Tags (Enter or comma to add)</span>
                <TagInput tags={editTags} onChange={setEditTags} />
              </div>

              <div className="modal-row">
                <label className="modal-field">
                  <span>Due Date</span>
                  <input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} />
                </label>
                <label className="modal-field">
                  <span>Time (Days)</span>
                  <input type="number" min="1" value={editTime} onChange={(e) => setEditTime(e.target.value)} />
                </label>
              </div>

              <label className="modal-field">
                <span>Status</span>
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                  {taskStatusOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </label>

              <div className="modal-actions">
                <button type="submit" className="tasks-add-btn" disabled={isSaving}>
                  {isSaving ? 'Saving…' : 'Save Changes'}
                </button>
                <button type="button" className="modal-cancel-btn" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── HEADER ─────────────────────────────────────── */}
      <div className="task-details-header">
        <div>
          <span className="project-label">TASK</span>
          <h1>{task.name || task.title || 'Untitled Task'}</h1>
          <p>{error || 'Review and manage task details.'}</p>
        </div>
        <div className="task-details-actions">
          <button type="button" className="tasks-add-btn" onClick={openEdit}>
            ✏️ Edit Task
          </button>
          <Link to="/tasks" className="modal-cancel-btn task-back-btn">
            ← Back
          </Link>
        </div>
      </div>

      <div className="task-details-grid">

        {/* TASK INFO */}
        <div className="dashboard-card task-details-card">
          <h2>Task Information</h2>
          <div className="task-info-list">
            <InfoRow label="Project" value={
              project?.title || task.project?.title || task.project?.name || task.project
            } />
            <InfoRow label="Team"    value={task.team?.name || task.team} />
            <InfoRow label="Assignee" value={task.assignee} />
            <InfoRow label="Due Date" value={task.dueDate} />
            <InfoRow label="Time to Complete"
              value={task.timeToComplete ? `${task.timeToComplete} Days` : null} />
            <div className="task-info-row">
              <span className="task-info-label">Tags</span>
              <div className="task-tags-row">
                {task.tags?.length > 0
                  ? task.tags.map((tag) => <span key={tag} className="task-tag">{tag}</span>)
                  : <strong className="task-info-value">—</strong>
                }
              </div>
            </div>
          </div>
        </div>

        {/* STATUS — FIX: no duplicate "Task Status" heading + status pill */}
        <div className="dashboard-card task-details-card">
          <h2>Update Status</h2>
          <div className="task-status-box">

            {/* Current status pill */}
            <div className="task-current-status">
              <span className="task-info-label">Current Status</span>
              <span className={`task-pill task-pill--lg ${statusPillClass(displayStatus)}`}>
                {displayStatus}
              </span>
            </div>

            {/* Status select */}
            <label className="modal-field">
              <span>Change to</span>
              <select
                className="task-status-select"
                value={displayStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                {taskStatusOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </label>

            {!isCompleted && (
              <button type="button" className="tasks-add-btn"
                onClick={() => handleStatusChange('Completed')}>
                ✓ Mark as Complete
              </button>
            )}

            {isCompleted && (
              <p className="task-completed-msg">✅ This task has been completed!</p>
            )}
          </div>
        </div>

      </div>
    </section>
  )
}

export default TaskDetails
