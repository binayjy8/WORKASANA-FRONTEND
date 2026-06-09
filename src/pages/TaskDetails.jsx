import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FaArrowLeft, FaCheck, FaPen, FaXmark } from 'react-icons/fa6'
import { useWorkspaceData } from '../hooks/useWorkspaceData'
import { getEntityId, isSameEntityId } from '../utils/entity'
import { taskStatusOptions, toDisplayStatus } from '../utils/taskUtils'
import { updateTask } from '../services/taskApi'

const PRIORITY = ['Low', 'Medium', 'High']

const statusColor = (status) => {
  if (status === 'Completed')   return 'tdd__status--completed'
  if (status === 'In Progress') return 'tdd__status--inprogress'
  if (status === 'Blocked')     return 'tdd__status--blocked'
  return 'tdd__status--todo'
}

const priorityClass = (p) => {
  if (p === 'High') return 'tdd__chip--high'
  if (p === 'Low')  return 'tdd__chip--low'
  return 'tdd__chip--medium'
}

const fmt = (dateStr) => {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

const getTaskDueDate = (task) =>
  task?.dueDate || task?.deadline || task?.due_date || task?.due || task?.completionDate || ''

const toDateInputValue = (dateStr) => {
  if (!dateStr) return ''
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return dateStr.slice(0, 10)
  }
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const initials = (name) =>
  String(name || '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

const TagInput = ({ tags, onChange }) => {
  const [input, setInput] = useState('')
  const addTags = (value) => {
    const nextTags = value
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag && !tags.includes(tag))
    if (nextTags.length) onChange([...tags, ...nextTags])
    setInput('')
  }
  const handleKeyDown = (e) => {
    if (e.key !== 'Enter' && e.key !== ',') return
    e.preventDefault()
    addTags(input)
  }
  return (
    <div className="tdd__tag-input">
      {tags.map((tag) => (
        <span key={tag} className="tdd__tag-chip">
          {tag}
          <button type="button" onClick={() => onChange(tags.filter((t) => t !== tag))}>
            <FaXmark />
          </button>
        </span>
      ))}
      <input
        type="text"
        placeholder={tags.length === 0 ? 'Type and press Enter…' : ''}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTags(input)}
      />
    </div>
  )
}

const TaskDetails = () => {
  const { taskId } = useParams()
  const navigate   = useNavigate()
  const { tasks, projects, teams, users, updateTaskInStore, isLoading } = useWorkspaceData()

  const task    = tasks.find((t) => isSameEntityId(getEntityId(t), taskId))
  const project = projects.find((p) =>
    isSameEntityId(getEntityId(p), task?.project?._id || task?.project) ||
    p.title === task?.project?.title || p.title === task?.project?.name
  )
  const team = teams.find((t) =>
    isSameEntityId(getEntityId(t), task?.team?._id || task?.team) ||
    t.name === task?.team?.name || t.name === task?.team
  )

  const [editing, setEditing]           = useState(false)
  const [saving, setSaving]             = useState(false)
  const [formError, setFormError]       = useState('')
  const [editName, setEditName]         = useState('')
  const [editProject, setEditProject]   = useState('')
  const [editTeam, setEditTeam]         = useState('')
  const [editOwners, setEditOwners]     = useState([])
  const [editTags, setEditTags]         = useState([])
  const [editTime, setEditTime]         = useState('')
  const [editDue, setEditDue]           = useState('')
  const [editStatus, setEditStatus]     = useState('')
  const [editPriority, setEditPriority] = useState('Medium')

  const openEdit = () => {
    setEditName(task.title || task.name || '')
    setEditProject(getEntityId(project) || task?.project?._id || task?.project || '')
    setEditTeam(getEntityId(team) || task?.team?._id || task?.team || '')
    setEditOwners(task.owners || [])
    setEditTags(task.tags || [])
    setEditTime(String(task.timeToComplete || ''))
    setEditDue(toDateInputValue(getTaskDueDate(task)))
    setEditStatus(toDisplayStatus(task.status))
    setEditPriority(task.priority || 'Medium')
    setFormError('')
    setEditing(true)
  }

  // owners are name strings — toggle by name
  const toggleOwner = (name) =>
    setEditOwners((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    )

  const handleSave = async (e) => {
    e.preventDefault()
    if (!editName.trim()) { setFormError('Task name is required'); return }
    setSaving(true)
    setFormError('')
    try {
      const payload = {
        name:           editName.trim(),
        project:        editProject || undefined,
        team:           editTeam || undefined,
        owners:         editOwners,
        tags:           editTags,
        timeToComplete: Number(editTime) || 0,
        dueDate:        editDue || '',
        deadline:       editDue || '',
        status:         editStatus,
        priority:       editPriority,
      }
      const updated = await updateTask(getEntityId(task), payload)
      updateTaskInStore(getEntityId(task), {
        ...updated,
        title:          editName.trim(),
        tags:           editTags,
        dueDate:        editDue || '',
        deadline:       editDue || '',
        priority:       editPriority,
        status:         editStatus,
        timeToComplete: Number(editTime) || 0,
        owners:         editOwners,
      })
      setEditing(false)
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    if (!task) return
    try {
      const updated = await updateTask(getEntityId(task), { status: newStatus })
      const currentDueDate = getTaskDueDate(task)
      updateTaskInStore(getEntityId(task), {
        ...updated,
        tags:     updated.tags?.length ? updated.tags : task.tags || [],
        dueDate:  updated.dueDate || currentDueDate,
        deadline: updated.deadline || task.deadline || currentDueDate,
      })
    } catch (err) {
      console.error(err)
    }
  }

  if (isLoading && !task) {
    return <div className="tdd__empty">Loading task…</div>
  }

  if (!task) {
    return (
      <div className="tdd__empty">
        <p>Task not found.</p>
        <button type="button" className="tdd__back" onClick={() => navigate('/tasks')}>
          <FaArrowLeft /> Back to Tasks
        </button>
      </div>
    )
  }

  const displayStatus = toDisplayStatus(task.status)
  const isCompleted   = displayStatus === 'Completed'
  const projectName   = project?.title || task?.project?.title || task?.project?.name || (typeof task?.project === 'string' && task.project.length < 30 ? task.project : null)
  const teamName      = team?.name || task?.team?.name || (typeof task?.team === 'string' && task.team.length < 30 ? task.team : null)
  const ownerNames    = (task.owners || []).filter(Boolean)

  return (
    <div className="tdd">

      <div className="tdd__header">
        <button type="button" className="tdd__back" onClick={() => navigate(project ? `/projects/${getEntityId(project)}` : '/tasks')}>
          <FaArrowLeft />
          <span>Back to {projectName || 'Tasks'}</span>
        </button>
        <div className="tdd__header-row">
          <div>
            <h1 className="tdd__title">{task.title || task.name || 'Untitled Task'}</h1>
            <p className="tdd__subtitle">Task Details</p>
          </div>
          <button type="button" className="tdd__edit-btn" onClick={openEdit}>
            <FaPen /><span>Edit Task</span>
          </button>
        </div>
      </div>

      <div className="tdd__grid">

        <div className="tdd__card">
          <h2 className="tdd__card-title">Task Information</h2>
          <div className="tdd__info-list">

            <div className="tdd__info-row">
              <span className="tdd__info-label">Project</span>
              <span className="tdd__info-value">{projectName || '—'}</span>
            </div>
            <div className="tdd__info-row">
              <span className="tdd__info-label">Team</span>
              <span className="tdd__info-value">{teamName || '—'}</span>
            </div>
            <div className="tdd__info-row">
              <span className="tdd__info-label">Owners</span>
              <div className="tdd__info-chips">
                {ownerNames.length > 0 ? ownerNames.map((name) => (
                  <span key={name} className="tdd__owner-tag">
                    <span className="tdd__owner-avatar">{initials(name)}</span>
                    {name}
                  </span>
                )) : <span className="tdd__info-value">—</span>}
              </div>
            </div>
            <div className="tdd__info-row">
              <span className="tdd__info-label">Tags</span>
              <div className="tdd__info-chips">
                {task.tags?.length > 0 ? task.tags.map((tag) => (
                  <span key={tag} className="tdd__tag">{tag}</span>
                )) : <span className="tdd__info-value">—</span>}
              </div>
            </div>
            <div className="tdd__info-row">
              <span className="tdd__info-label">Due Date</span>
              <span className="tdd__info-value">{fmt(task.dueDate) || '—'}</span>
            </div>
            <div className="tdd__info-row">
              <span className="tdd__info-label">Priority</span>
              <span className={`tdd__chip ${priorityClass(task.priority)}`}>{task.priority || 'Medium'}</span>
            </div>

          </div>
        </div>

        <div className="tdd__card">
          <h2 className="tdd__card-title">Status &amp; Progress</h2>
          <div className="tdd__status-box">

            <div className="tdd__info-row">
              <span className="tdd__info-label">Status</span>
              <span className={`tdd__status-badge ${statusColor(displayStatus)}`}>{displayStatus}</span>
            </div>

            <div className="tdd__info-row">
              <span className="tdd__info-label">Time Remaining</span>
              <span className="tdd__info-value">
                {task.timeToComplete ? `${task.timeToComplete} Days` : '—'}
              </span>
            </div>

            <div className="tdd__info-row">
              <span className="tdd__info-label">Change Status</span>
              <select
                className="tdd__status-select"
                value={displayStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                {taskStatusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {!isCompleted ? (
              <button
                type="button"
                className="tdd__complete-btn"
                onClick={() => handleStatusChange('Completed')}
              >
                <FaCheck /><span>Mark as Complete</span>
              </button>
            ) : (
              <div className="tdd__completed-msg">
                <FaCheck />
                <span>This task has been completed!</span>
              </div>
            )}

          </div>
        </div>

      </div>

      {editing && (
        <div className="tdd__modal-backdrop" onClick={() => setEditing(false)}>
          <div className="tdd__modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">

            <div className="tdd__modal-header">
              <div>
                <h2 className="tdd__modal-title">Edit Task</h2>
                <p className="tdd__modal-sub">Update task details</p>
              </div>
              <button type="button" className="tdd__modal-close" onClick={() => setEditing(false)}>
                <FaXmark />
              </button>
            </div>

            <form className="tdd__form" onSubmit={handleSave}>

              <div className="tdd__field">
                <label className="tdd__label">Task Name *</label>
                <input className="tdd__input" type="text" value={editName}
                  onChange={(e) => setEditName(e.target.value)} autoFocus />
              </div>

              <div className="tdd__form-row">
                <div className="tdd__field">
                  <label className="tdd__label">Project</label>
                  <select className="tdd__input" value={editProject} onChange={(e) => setEditProject(e.target.value)}>
                    <option value="">— None —</option>
                    {projects.map((p) => <option key={getEntityId(p)} value={getEntityId(p)}>{p.title}</option>)}
                  </select>
                </div>
                <div className="tdd__field">
                  <label className="tdd__label">Team</label>
                  <select className="tdd__input" value={editTeam} onChange={(e) => setEditTeam(e.target.value)}>
                    <option value="">— None —</option>
                    {teams.map((t) => <option key={getEntityId(t)} value={getEntityId(t)}>{t.name}</option>)}
                  </select>
                </div>
              </div>

              {users.length > 0 && (
                <div className="tdd__field">
                  <label className="tdd__label">Owners</label>
                  <div className="tdd__owners">
                    {users.map((u) => (
                      <button
                        key={getEntityId(u)}
                        type="button"
                        className={`tdd__owner-chip ${editOwners.includes(u.name) ? 'tdd__owner-chip--on' : ''}`}
                        onClick={() => toggleOwner(u.name)}
                      >
                        <span className="tdd__owner-chip-avatar">{initials(u.name)}</span>
                        <span>{u.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="tdd__field">
                <label className="tdd__label">Tags</label>
                <TagInput tags={editTags} onChange={setEditTags} />
              </div>

              <div className="tdd__form-row">
                <div className="tdd__field">
                  <label className="tdd__label">Due Date</label>
                  <input className="tdd__input" type="date" value={editDue} onChange={(e) => setEditDue(e.target.value)} />
                </div>
                <div className="tdd__field">
                  <label className="tdd__label">Time (Days)</label>
                  <input className="tdd__input" type="number" min="1" value={editTime} onChange={(e) => setEditTime(e.target.value)} />
                </div>
              </div>

              <div className="tdd__form-row">
                <div className="tdd__field">
                  <label className="tdd__label">Priority</label>
                  <select className="tdd__input" value={editPriority} onChange={(e) => setEditPriority(e.target.value)}>
                    {PRIORITY.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="tdd__field">
                  <label className="tdd__label">Status</label>
                  <select className="tdd__input" value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                    {taskStatusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {formError && <p className="tdd__form-error">{formError}</p>}

              <div className="tdd__form-actions">
                <button type="submit" className="tdd__submit-btn" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                <button type="button" className="tdd__cancel-btn" onClick={() => setEditing(false)}>Cancel</button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default TaskDetails
