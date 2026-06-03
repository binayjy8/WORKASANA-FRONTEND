import { Link, useParams } from 'react-router-dom'

import { updateTask } from '../services/taskApi'

import { useWorkspaceData } from '../hooks/useWorkspaceData'

import {
  getEntityId,
  isSameEntityId,
} from '../utils/entity'

import {
  taskStatusOptions,
  toDisplayStatus,
} from '../utils/taskUtils'

const TaskDetails = () => {

  const { taskId } =
    useParams()

  const {
    tasks,
    projects,
    updateTaskInStore,
    isLoading,
    error,
  } = useWorkspaceData()

  const task =
    tasks.find((item) =>
      isSameEntityId(
        getEntityId(item),
        taskId
      )
    )

  const project =
    projects.find(
      (item) =>
        isSameEntityId(
          getEntityId(item),
          task?.project
        ) ||
        item.title === task?.project ||
        item.title === task?.project?.title ||
        item.title === task?.project?.name
    )

  const handleStatusChange =
    async (status) => {

      if (!task) {
        return
      }

      try {

        const updatedTask =
          await updateTask(
            getEntityId(task),
            {
              status,
            }
          )

        updateTaskInStore(
          getEntityId(task),
          updatedTask
        )

      } catch (error) {

        console.log(error)

        alert(
          error.response?.data?.message ||
          'Failed to update task'
        )
      }
    }

  if (!task && !isLoading) {

    return (

      <section className="page-section">

        <div className="page-header">

          <h1>
            Task not found
          </h1>

          <p>
            This task does not exist.
          </p>

        </div>

      </section>

    )
  }

  if (!task) {

    return (

      <section className="page-section">

        <div className="page-header">

          <h1>
            Loading task
          </h1>

          <p>
            Fetching task details...
          </p>

        </div>

      </section>

    )
  }

  return (

    <section className="page-section">

      <div className="task-details-header">

        <div>

          <span className="project-label">
            TASK
          </span>

          <h1>
            {task.name || task.title}
          </h1>

          <p>
            {error ||
              'Review task progress and project workflow.'}
          </p>

        </div>

        <Link
          to="/tasks"
          className="project-add-btn"
        >
          Back to Tasks
        </Link>

      </div>


      <div className="task-details-grid">

        {/* MAIN INFO */}

        <div className="dashboard-card task-details-card">

          <h2>
            Task Information
          </h2>

          <div className="task-info-list">

            <div>
              <span>
                Project
              </span>

              <strong>
                {project?.title ||
                  task.project?.title ||
                  task.project?.name ||
                  task.project ||
                  'Unassigned'}
              </strong>
            </div>


            <div>
              <span>
                Team
              </span>

              <strong>
                {task.team?.name ||
                  task.team ||
                  'Unassigned'}
              </strong>
            </div>


            <div>
              <span>
                Tags
              </span>

              <strong>
                {task.tags?.length > 0
                  ? task.tags.join(', ')
                  : 'No Tags'}
              </strong>
            </div>


            <div>
              <span>
                Time To Complete
              </span>

              <strong>
                {task.timeToComplete || 0}
                {' '}
                Days
              </strong>
            </div>

          </div>

        </div>


        {/* STATUS */}

        <div className="dashboard-card task-details-card">

          <h2>
            Task Status
          </h2>

          <div className="task-status-box">

            <span
              className={`task-pill ${
                task.status === 'Completed'
                  ? 'task-pill-completed'
                  : task.status === 'In Progress'
                  ? 'task-pill-progress'
                  : 'task-pill-pending'
              }`}
            >
              {toDisplayStatus(task.status)}
            </span>


            <select
              className="task-status-select"
              value={
                toDisplayStatus(task.status)
              }
              onChange={(event) =>
                handleStatusChange(
                  event.target.value
                )
              }
            >

              {taskStatusOptions.map((statusOption) => (

                <option
                  value={statusOption}
                  key={statusOption}
                >
                  {statusOption}
                </option>

              ))}

            </select>


            <button
              type="button"
              className="project-add-btn"
              onClick={() =>
                handleStatusChange(
                  'Completed'
                )
              }
            >
              Mark as Complete
            </button>

          </div>

        </div>

      </div>

    </section>

  )
}

export default TaskDetails