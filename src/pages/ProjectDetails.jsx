import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FaArrowLeft, FaPlus, FaXmark } from 'react-icons/fa6'
import { useWorkspaceData } from '../hooks/useWorkspaceData'
import {
  getTaskProjectName,
  getTaskTeamName,
  getTaskTags,
  taskBelongsToProject,
  sortTasks,
  taskStatusOptions,
} from '../utils/taskUtils'
import { createTask } from '../services/taskApi'

const statusDotClass = (status) => {
  if (status === 'In Progress') return 'pd__dot--inprogress'
  if (status === 'Completed')   return 'pd__dot--completed'
  if (status === 'Blocked')     return 'pd__dot--blocked'
  return 'pd__dot--todo'
}

const getAssigneeName = (assignee) =>
  assignee?.name || assignee?.username || (typeof assignee === 'string' ? assignee : null)

const initials = (name) =>
  String(name || '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

const ProjectDetails = () => {
  const { projectId }                       = useParams()
  const navigate                            = useNavigate()
  const { projects, tasks, teams, addTask, isLoading } = useWorkspaceData()

  const [ownerFilter, setOwnerFilter]   = useState('')
  const [tagFilter, setTagFilter]       = useState('')
  const [sortBy, setSortBy]             = useState('')
  const [showAddForm, setShowAddForm]   = useState(false)
  const [newTaskName, setNewTaskName]   = useState('')
  const [newTaskStatus, setNewTaskStatus] = useState('To Do')
  const [newTaskPriority, setNewTaskPriority] = useState('Medium')
  const [newTaskDue, setNewTaskDue]     = useState('')
  const [newTaskAssignee, setNewTaskAssignee] = useState('')
  const [adding, setAdding]             = useState(false)

  const project = projects.find(
    (p) => String(p._id) === String(projectId)
  )

  const projectTasks = tasks.filter((t) => taskBelongsToProject(t, project || { _id: projectId }))

  const allOwners = [...new Set(
    projectTasks
      .map((t) => getAssigneeName(t.assignee))
      .filter(Boolean)
  )]
  const allTags = [...new Set(projectTasks.flatMap((t) => getTaskTags(t)).filter(Boolean))]

  let filtered = projectTasks

  if (ownerFilter) {
    filtered = filtered.filter((t) => {
      const name = getAssigneeName(t.assignee) || ''
      return name.toLowerCase().includes(ownerFilter.toLowerCase())
    })
  }

  if (tagFilter) {
    filtered = filtered.filter((t) =>
      getTaskTags(t).some((tag) => tag.toLowerCase().includes(tagFilter.toLowerCase()))
    )
  }

  if (sortBy) filtered = sortTasks(filtered, sortBy)

  const handleAddTask = async () => {
    const name = newTaskName.trim()
    if (!name || !project) return
    setAdding(true)
    try {
      const teamId = project.team?.[0]?._id || project.team?.[0] || teams[0]?._id
      const task = await createTask({
        name,
        project: project._id,
        team: teamId,
        status: newTaskStatus,
        priority: newTaskPriority,
        dueDate: newTaskDue,
        deadline: newTaskDue,
        assignee: newTaskAssignee,
        timeToComplete: 1,
      })
      addTask(task)
      setNewTaskName('')
      setNewTaskStatus('To Do')
      setNewTaskPriority('Medium')
      setNewTaskDue('')
      setNewTaskAssignee('')
      setShowAddForm(false)
    } catch (e) {
      console.error('Failed to create task:', e)
    } finally {
      setAdding(false)
    }
  }

  if (isLoading) {
    return <div className="pd__empty">Loading project…</div>
  }

  return (
    <div className="pd">

      <div className="pd__header">
        <button type="button" className="pd__back" onClick={() => navigate('/dashboard')}>
          <FaArrowLeft />
          <span>Back to Dashboard</span>
        </button>
        <div className="pd__header-info">
          <h1 className="pd__title">{project?.title || project?.name || 'Project'}</h1>
          {project?.description && (
            <p className="pd__desc">{project.description}</p>
          )}
        </div>
      </div>

      <div className="pd__toolbar">
        <div className="pd__filters">
          <select
            className="pd__select"
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
          >
            <option value="">By Owner</option>
            {allOwners.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>

          <select
            className="pd__select"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
          >
            <option value="">By Tag</option>
            {allTags.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {(ownerFilter || tagFilter) && (
            <button
              type="button"
              className="pd__clear-btn"
              onClick={() => { setOwnerFilter(''); setTagFilter('') }}
            >
              <FaXmark /> Clear
            </button>
          )}
        </div>

        <div className="pd__sorts">
          <span className="pd__sort-label">Sort by:</span>
          <button
            type="button"
            className={`pd__sort-btn ${sortBy === 'dueDate' ? 'pd__sort-btn--active' : ''}`}
            onClick={() => setSortBy(sortBy === 'dueDate' ? '' : 'dueDate')}
          >
            Due Date
          </button>
          <button
            type="button"
            className={`pd__sort-btn ${sortBy === 'priority' ? 'pd__sort-btn--active' : ''}`}
            onClick={() => setSortBy(sortBy === 'priority' ? '' : 'priority')}
          >
            Priority
          </button>
        </div>
      </div>

      <div className="pd__task-list">
        {filtered.length === 0 && !showAddForm && (
          <div className="pd__empty">No tasks found for this project.</div>
        )}

        {filtered.map((task) => (
          <div
            key={task._id}
            className="pd__task-row"
            onClick={() => navigate(`/tasks/${task._id}`)}
          >
            <span className={`pd__dot ${statusDotClass(task.status)}`} />
            <span className="pd__task-name">{task.title || task.name}</span>

            <div className="pd__task-meta">
              {task.dueDate && (
                <span className="pd__task-due">{task.dueDate}</span>
              )}
              {task.assignee && (
                <span className="pd__task-avatar" title={getAssigneeName(task.assignee)}>
                  {initials(getAssigneeName(task.assignee))}
                </span>
              )}
              {getTaskTags(task).slice(0, 2).map((tag) => (
                <span key={tag} className="pd__tag">{tag}</span>
              ))}
              <span className={`pd__priority pd__priority--${(task.priority || 'medium').toLowerCase()}`}>
                {task.priority || 'Medium'}
              </span>
              <span className="pd__status">{task.status}</span>
            </div>
          </div>
        ))}

        {showAddForm && (
          <div className="pd__add-form">
            <input
              className="pd__add-input pd__add-input--name"
              type="text"
              placeholder="Task name…"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              autoFocus
            />
            <div className="pd__add-row">
              <select
                className="pd__add-input"
                value={newTaskStatus}
                onChange={(e) => setNewTaskStatus(e.target.value)}
              >
                {taskStatusOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                className="pd__add-input"
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value)}
              >
                {['High', 'Medium', 'Low'].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <input
                className="pd__add-input"
                type="date"
                value={newTaskDue}
                onChange={(e) => setNewTaskDue(e.target.value)}
              />
              <input
                className="pd__add-input"
                type="text"
                placeholder="Assignee"
                value={newTaskAssignee}
                onChange={(e) => setNewTaskAssignee(e.target.value)}
              />
              <button
                type="button"
                className="pd__add-submit"
                onClick={handleAddTask}
                disabled={adding || !newTaskName.trim()}
              >
                {adding ? 'Adding…' : 'Add'}
              </button>
              <button
                type="button"
                className="pd__add-cancel"
                onClick={() => { setShowAddForm(false); setNewTaskName('') }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="pd__add-btn-row">
          <button
            type="button"
            className="pd__add-task-btn"
            onClick={() => setShowAddForm(true)}
          >
            <FaPlus />
            <span>Add New Task</span>
          </button>
        </div>
      </div>

    </div>
  )
}

export default ProjectDetails
