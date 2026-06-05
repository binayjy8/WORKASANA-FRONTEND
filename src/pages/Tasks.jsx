import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState'
import TaskCard from '../components/TaskCards'
import { useWorkspaceData } from '../hooks/useWorkspaceData'
import { getEntityId } from '../utils/entity'
import { createTask } from '../services/taskApi'
import {
  filterTasksByParams,
  sortTasks,
  taskStatusOptions,
  toDisplayStatus,
} from '../utils/taskUtils'

const TASK_GROUPS = ['To Do', 'In Progress', 'Completed', 'Blocked']

// ── Tag chip input ────────────────────────────────────────
const TagInput = ({ tags, onChange }) => {
  const [input, setInput] = useState('')

  const addTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = input.trim().replace(/,$/, '')
      if (val && !tags.includes(val)) onChange([...tags, val])
      setInput('')
    }
  }

  const removeTag = (tag) => onChange(tags.filter((t) => t !== tag))

  return (
    <div className="tag-input-wrapper">
      {tags.map((tag) => (
        <span key={tag} className="tag-chip">
          {tag}
          <button type="button" className="tag-chip-remove" onClick={() => removeTag(tag)}>×</button>
        </span>
      ))}
      <input
        type="text"
        className="tag-chip-input"
        placeholder={tags.length === 0 ? 'e.g. Urgent, Bug…' : ''}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={addTag}
      />
    </div>
  )
}

const Tasks = () => {
  const {
    filteredTasks,
    projects,
    teams,
    users,
    isLoading,
    error,
    addTask,
  } = useWorkspaceData()

  const [searchParams, setSearchParams] = useSearchParams()

  // ── Create modal state ────────────────────────────────
  const [isModalOpen, setIsModalOpen]             = useState(false)
  const [isCreating, setIsCreating]               = useState(false)
  const [taskName, setTaskName]                   = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [selectedTeamId, setSelectedTeamId]       = useState('')
  const [selectedOwners, setSelectedOwners]       = useState([])
  const [tags, setTags]                           = useState([])
  const [timeToComplete, setTimeToComplete]       = useState('1')
  const [dueDate, setDueDate]                     = useState('')
  const [status, setStatus]                       = useState('To Do')

  const defaultProjectId = projects.length > 0 ? getEntityId(projects[0]) : ''
  const defaultTeamId    = teams.length > 0    ? getEntityId(teams[0])    : ''
  const projectId = selectedProjectId || defaultProjectId
  const teamId    = selectedTeamId    || defaultTeamId

  // ── Filtered + sorted tasks ───────────────────────────
  const visibleTasks = sortTasks(
    filterTasksByParams(filteredTasks, searchParams),
    searchParams.get('sort'),
  )

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams)
    value ? next.set(key, value) : next.delete(key)
    setSearchParams(next)
  }

  const clearFilters = () => setSearchParams({})
  const hasFilters   = searchParams.toString() !== ''

  const toggleOwner = (uid) => {
    setSelectedOwners((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid],
    )
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setTaskName('')
    setTags([])
    setTimeToComplete('1')
    setDueDate('')
    setStatus('To Do')
    setSelectedProjectId('')
    setSelectedTeamId('')
    setSelectedOwners([])
  }

  const handleCreateTask = async (event) => {
    event.preventDefault()
    const title = taskName.trim()
    if (!title) { alert('Please enter a task name'); return }

    try {
      setIsCreating(true)
      const createdTask = await createTask({
        name:           title,
        project:        projectId,
        team:           teamId,
        owners:         selectedOwners,
        tags,
        timeToComplete: Number(timeToComplete) || 1,
        dueDate:        dueDate || undefined,
        status,
      })
      addTask(createdTask)
      closeModal()
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.message || 'Failed to create task')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <section className="page-section">

      {/* ── HEADER ───────────────────────────────────────── */}
      <div className="tasks-header">
        <div className="page-header">
          <h1>Tasks</h1>
          <p>
            {isLoading ? 'Loading tasks…' : error || 'Track task progress across your projects.'}
          </p>
        </div>
        <button
          type="button"
          className="tasks-add-btn"
          onClick={() => setIsModalOpen(true)}
        >
          + New Task
        </button>
      </div>

      {/* ── CREATE MODAL ─────────────────────────────────── */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div
            className="task-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Create New Task"
          >
            <div className="modal-header">
              <h2>Create New Task</h2>
              <button type="button" className="modal-close-btn" onClick={closeModal}>✕</button>
            </div>

            <form className="modal-form" onSubmit={handleCreateTask}>

              <label className="modal-field">
                <span>Task Name *</span>
                <input
                  type="text"
                  placeholder="Enter task name"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  required
                  autoFocus
                />
              </label>

              <div className="modal-row">
                <label className="modal-field">
                  <span>Project</span>
                  <select value={projectId} onChange={(e) => setSelectedProjectId(e.target.value)}>
                    {projects.map((p) => (
                      <option key={getEntityId(p)} value={getEntityId(p)}>{p.title}</option>
                    ))}
                  </select>
                </label>

                <label className="modal-field">
                  <span>Team</span>
                  <select value={teamId} onChange={(e) => setSelectedTeamId(e.target.value)}>
                    {teams.map((t) => (
                      <option key={getEntityId(t)} value={getEntityId(t)}>{t.name}</option>
                    ))}
                  </select>
                </label>
              </div>

              {/* OWNERS — multi-select chips */}
              {users.length > 0 && (
                <div className="modal-field">
                  <span>Owners</span>
                  <div className="modal-owners-grid">
                    {users.map((user) => {
                      const uid      = getEntityId(user)
                      const selected = selectedOwners.includes(uid)
                      return (
                        <button
                          key={uid}
                          type="button"
                          className={`owner-chip ${selected ? 'owner-chip--selected' : ''}`}
                          onClick={() => toggleOwner(uid)}
                        >
                          <span className="owner-chip-avatar">
                            {String(user.name || 'U')[0].toUpperCase()}
                          </span>
                          <span>{user.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* TAGS — chip input (press Enter or comma) */}
              <div className="modal-field">
                <span>Tags (press Enter or comma to add)</span>
                <TagInput tags={tags} onChange={setTags} />
              </div>

              <div className="modal-row">
                <label className="modal-field">
                  <span>Due Date</span>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </label>

                <label className="modal-field">
                  <span>Time (Days)</span>
                  <input
                    type="number"
                    min="1"
                    value={timeToComplete}
                    onChange={(e) => setTimeToComplete(e.target.value)}
                  />
                </label>
              </div>

              <label className="modal-field">
                <span>Status</span>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  {taskStatusOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </label>

              <div className="modal-actions">
                <button type="submit" className="tasks-add-btn" disabled={isCreating}>
                  {isCreating ? 'Creating…' : 'Create Task'}
                </button>
                <button type="button" className="modal-cancel-btn" onClick={closeModal}>
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ── FILTERS ──────────────────────────────────────── */}
      <div className="task-filter-panel">
        <div className="task-filter-header">
          <h2 className="task-filter-title">Filters</h2>
          {hasFilters && (
            <button type="button" className="toolbar-clear-btn" onClick={clearFilters}>
              Clear all
            </button>
          )}
        </div>

        <div className="filter-grid">

          {/* Owner — dropdown from users list */}
          <label>
            <span>Owner</span>
            <select
              value={searchParams.get('owner') || ''}
              onChange={(e) => updateFilter('owner', e.target.value)}
            >
              <option value="">All Owners</option>
              {users.map((u) => (
                <option key={getEntityId(u)} value={u.name}>
                  {u.name}
                </option>
              ))}
            </select>
          </label>

          {/* Team — dropdown from teams list */}
          <label>
            <span>Team</span>
            <select
              value={searchParams.get('team') || ''}
              onChange={(e) => updateFilter('team', e.target.value)}
            >
              <option value="">All Teams</option>
              {teams.map((t) => (
                <option key={getEntityId(t)} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>

          {/* Tags — multi-select chip filter */}
          <label>
            <span>Tag</span>
            <select
              value={searchParams.get('tags') || ''}
              onChange={(e) => updateFilter('tags', e.target.value)}
            >
              <option value="">All Tags</option>
              {[
                ...new Set(
                  filteredTasks.flatMap((t) => t.tags || []),
                ),
              ].map((tag) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </label>

          {/* Project — dropdown from projects list */}
          <label>
            <span>Project</span>
            <select
              value={searchParams.get('project') || ''}
              onChange={(e) => updateFilter('project', e.target.value)}
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={getEntityId(p)} value={p.title}>
                  {p.title}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Status</span>
            <select
              value={searchParams.get('status') || ''}
              onChange={(e) => updateFilter('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              {taskStatusOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </label>

          <label>
            <span>Sort by</span>
            <select
              value={searchParams.get('sort') || ''}
              onChange={(e) => updateFilter('sort', e.target.value)}
            >
              <option value="">Default</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
            </select>
          </label>

        </div>
      </div>

      {/* ── KANBAN BOARD ─────────────────────────────────── */}
      <div className="task-board-wrapper">
        <div className="task-board-title-row">
          <h2 className="task-board-title">Task Board</h2>
          <span className="task-board-count">{visibleTasks.length} tasks</span>
        </div>

        <div className="task-board">
          {TASK_GROUPS.map((group) => {
            const groupTasks = visibleTasks.filter(
              (task) => toDisplayStatus(task.status) === group,
            )
            return (
              <section className="task-column" key={group}>
                <div className="task-column__header">
                  <h3>{group}</h3>
                  <span className="task-column__count">{groupTasks.length}</span>
                </div>
                <div className="task-column__list">
                  {groupTasks.length > 0 ? (
                    groupTasks.map((task) => (
                      <TaskCard task={task} key={getEntityId(task)} />
                    ))
                  ) : (
                    <div className="empty-column">
                      <strong>No tasks</strong>
                      <p>Nothing here yet.</p>
                    </div>
                  )}
                </div>
              </section>
            )
          })}
        </div>
      </div>

    </section>
  )
}

export default Tasks
