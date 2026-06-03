import {
  deleteTask,
  updateTask,
} from '../services/taskApi'

import { useWorkspaceData } from '../hooks/useWorkspaceData'

import { getEntityId } from '../utils/entity'

import { Link } from 'react-router-dom'

import {
  taskStatusOptions,
  toApiStatus,
  toDisplayStatus,
} from '../utils/taskUtils'


const TaskCard = ({ task }) => {

  const {
    updateTaskInStore,
    removeTask,
  } = useWorkspaceData()

  const taskId =
    getEntityId(task)


  const handleDelete = async () => {

    if (!taskId) {
      return
    }

    try {

      await deleteTask(taskId)

      removeTask(taskId)

    } catch (error) {

      console.log(error)

      alert(
        error.response?.data?.message ||
        'Failed to delete task'
      )

    }
  }


  const handleStatusChange = async (
    event
  ) => {

    if (!taskId) {
      return
    }

    try {

      const updatedTask =
        await updateTask(
          taskId,
          {
            status:
              toApiStatus(
                event.target.value
              ),
          }
        )

      updateTaskInStore(
        taskId,
        {
          ...updatedTask,

          status:
            toDisplayStatus(
              updatedTask.status ||
              event.target.value
            ),
        }
      )

    } catch (error) {

      console.log(error)

      alert(
        error.response?.data?.message ||
        'Failed to update task'
      )

    }
  }


  return (

    <article className="task-card">

      {/* TOP */}

      <div className="task-card__top">

        <div className="task-card__content">

          <h3 className="task-title">
            {task.title}
          </h3>

          <p className="task-project">

            {
              task.project?.title ||
              task.project?.name ||
              'Project'
            }

          </p>

        </div>


        <span
          className={`task-badge task-badge-${toDisplayStatus(task.status)
            .toLowerCase()
            .replace(/\s/g, '-')}`}
        >
          {toDisplayStatus(task.status)}
        </span>

      </div>


      {/* META */}

      <div className="task-meta">

        <span>
          👤 {task.assignee || 'Unassigned'}
        </span>

        <span>
          ⏳ {task.timeToComplete || 0} Days
        </span>

        <span>
          🏷️ {
            task.tags?.length > 0
              ? task.tags.join(', ')
              : 'No Tags'
          }
        </span>

      </div>


      {/* ACTIONS */}

      <div className="task-card__actions">

        <Link
          to={`/tasks/${taskId}`}
          className="task-details-link"
        >
          View Details
        </Link>


        <select
          value={
            toDisplayStatus(task.status)
          }
          onChange={handleStatusChange}
          className="task-status-select"
        >

          {taskStatusOptions.map(
            (statusOption) => (

              <option
                value={statusOption}
                key={statusOption}
              >
                {statusOption}
              </option>

            )
          )}

        </select>


        <button
          className="delete-task-btn"
          onClick={handleDelete}
        >
          Delete Task
        </button>

      </div>

    </article>

  )
}

export default TaskCard