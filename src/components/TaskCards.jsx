import { Link } from 'react-router-dom'
import { deleteTask, updateTask } from '../services/taskApi'
import { useWorkspaceData } from '../hooks/useWorkspaceData'
import { getEntityId } from '../utils/entity'
import {
  taskStatusOptions,
  toApiStatus,
  toDisplayStatus,
} from '../utils/taskUtils'

const statusBadgeClass = (status) => {
  switch (status) {
    case 'Completed':  return 'task-badge-completed'
    case 'In Progress': return 'task-badge-progress'
    case 'Blocked':    return 'task-badge-blocked'
    default:           return 'task-badge-todo'
  }
}

const TaskCard = ({ task }) => {
  const { updateTaskInStore, removeTask } = useWorkspaceData()
  const taskId = getEntityId(task)
  const displayStatus = toDisplayStatus(task.status)

  const handleDelete = async () => {
    if (!taskId) return
    if (!window.confirm('Are you sure you want to delete this task?')) return

    try {
      await deleteTask(taskId)
      removeTask(taskId)
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.message || 'Failed to delete task')
    }
  }

  const handleStatusChange = async (event) => {
    if (!taskId) return

    try {
      const updatedTask = await updateTask(taskId, {
        status: toApiStatus(event.target.value),
      })

      updateTaskInStore(taskId, {
        ...updatedTask,
        status: toDisplayStatus(updatedTask.status || event.target.value),
      })
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.message || 'Failed to update task')
    }
  }

  return (
    <article className="task-card">

      {/* HEADER */}
      <div className="task-card__top">
        <div className="task-card__content">
          <h3 className="task-title">{task.title || task.name || 'Untitled Task'}</h3>
          <p className="task-project">
            {task.project?.title || task.project?.name || task.project || 'No Project'}
          </p>
        </div>

        <span className={`task-badge ${statusBadgeClass(displayStatus)}`}>
          {displayStatus}
        </span>
      </div>

      {/* META */}
      <div className="task-meta">
        <span title="Assignee">
          👤 {task.assignee || 'Unassigned'}
        </span>
        <span title="Time to complete">
          ⏳ {task.timeToComplete || 0}d
        </span>
        {task.dueDate && (
          <span title="Due date">
            📅 {task.dueDate}
          </span>
        )}
        {task.tags?.length > 0 && (
          <span title="Tags" className="task-tags">
            {task.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="task-tag">{tag}</span>
            ))}
            {task.tags.length > 2 && (
              <span className="task-tag task-tag--more">+{task.tags.length - 2}</span>
            )}
          </span>
        )}
      </div>

      {/* ACTIONS */}
      <div className="task-card__actions">
        <Link to={`/tasks/${taskId}`} className="task-details-link">
          View Details
        </Link>

        <select
          value={displayStatus}
          onChange={handleStatusChange}
          className="task-status-select"
        >
          {taskStatusOptions.map((opt) => (
            <option value={opt} key={opt}>{opt}</option>
          ))}
        </select>

        <button
          type="button"
          className="delete-task-btn"
          onClick={handleDelete}
          title="Delete task"
        >
          🗑
        </button>
      </div>

    </article>
  )
}

export default TaskCard
