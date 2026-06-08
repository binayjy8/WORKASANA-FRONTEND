import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaPlus } from 'react-icons/fa6'
import { useWorkspaceData } from '../hooks/useWorkspaceData'
import { getTaskProjectName, getTaskTeamName } from '../utils/taskUtils'
import { createTask } from '../services/taskApi'

const STATUS_FILTERS = ['All', 'In Progress', 'Completed', 'To Do', 'Blocked']

const statusDotClass = (status) => {
  if (status === 'In Progress') return 'dash__task-status-dot--inprogress'
  if (status === 'Completed')   return 'dash__task-status-dot--completed'
  if (status === 'Blocked')     return 'dash__task-status-dot--blocked'
  return 'dash__task-status-dot--todo'
}

const projectBadgeClass = (status) => {
  if (!status || status === 'Pending') return 'dash__badge--pending'
  if (status === 'Completed')          return 'dash__badge--completed'
  return 'dash__badge--active'
}

const initials = (name) =>
  String(name || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const Dashboard = () => {
  const navigate                          = useNavigate()
  const { projects, tasks, isLoading, addTask } = useWorkspaceData()
  const [filter, setFilter]               = useState('All')
  const [newTaskName, setNewTaskName]     = useState('')
  const [adding, setAdding]               = useState(false)

  const filteredTasks = filter === 'All'
    ? tasks
    : tasks.filter((t) => t.status === filter)

  const taskCountForProject = (project) =>
    tasks.filter((t) => {
      const name = getTaskProjectName(t)
      return name === (project.title || project.name)
    }).length

  const handleAddTask = async () => {
    const name = newTaskName.trim()
    if (!name) return
    if (!projects.length) return

    setAdding(true)
    try {
      const task = await createTask({
        name,
        project: projects[0]._id,
        team: tasks[0]?.team?._id || tasks[0]?.team || undefined,
        timeToComplete: 1,
        status: 'To Do',
        priority: 'Medium',
      })
      addTask(task)
      setNewTaskName('')
    } catch (e) {
      console.error('Failed to create task:', e)
    } finally {
      setAdding(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAddTask()
    if (e.key === 'Escape') setNewTaskName('')
  }

  if (isLoading) {
    return (
      <div className="dash">
        <div className="dash__empty">Loading workspace…</div>
      </div>
    )
  }

  return (
    <div className="dash">

      <p className="dash__section-title">Projects</p>
      <div className="dash__projects">
        {projects.slice(0, 6).map((project) => (
          <div
            key={project._id}
            className="dash__proj-card"
            onClick={() => navigate(`/projects/${project._id}`)}
          >
            <p className="dash__proj-name">{project.title || project.name}</p>
            <p className="dash__proj-desc">{project.description || 'No description'}</p>
            <div className="dash__proj-meta">
              <span className="dash__proj-tasks">
                {taskCountForProject(project)} tasks
              </span>
              <span className={`dash__badge ${projectBadgeClass(project.status)}`}>
                {project.status || 'Active'}
              </span>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <p className="dash__empty">No projects yet.</p>
        )}
      </div>

      <div className="dash__tasks-header">
        <p className="dash__section-title" style={{ margin: 0 }}>My Tasks</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="dash__filters">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                className={`dash__filter-btn ${filter === f ? 'dash__filter-btn--active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="dash__task-list">
        {filteredTasks.length === 0 && (
          <div className="dash__empty">No tasks found.</div>
        )}

        {filteredTasks.slice(0, 15).map((task) => (
          <div
            key={task._id}
            className="dash__task-row"
            onClick={() => navigate(`/tasks/${task._id}`)}
          >
            <span className={`dash__task-status-dot ${statusDotClass(task.status)}`} />
            <span className="dash__task-name">{task.title || task.name}</span>
            {task.dueDate && (
              <span className="dash__task-due">{task.dueDate}</span>
            )}
            {task.assignee && (
              <span className="dash__task-assignee" title={task.assignee}>
                {initials(task.assignee)}
              </span>
            )}
            {task.priority && (
              <span className={`dash__task-priority dash__task-priority--${task.priority.toLowerCase()}`}>
                {task.priority}
              </span>
            )}
          </div>
        ))}

        <div className="dash__add-task-row">
          <FaPlus style={{ fontSize: 12, color: 'var(--color-text-muted)', flexShrink: 0 }} />
          <input
            className="dash__add-task-input"
            type="text"
            placeholder="Add a task…"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {newTaskName.trim() && (
            <button
              type="button"
              className="dash__add-task-submit"
              onClick={handleAddTask}
              disabled={adding}
            >
              {adding ? 'Adding…' : 'Add'}
            </button>
          )}
        </div>
      </div>

    </div>
  )
}

export default Dashboard
