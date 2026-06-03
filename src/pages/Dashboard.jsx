import { Link } from 'react-router-dom'

import { useWorkspaceData } from '../hooks/useWorkspaceData'

import { getEntityId } from '../utils/entity'

const Dashboard = () => {

  const {
    projects,
    tasks,
    filteredProjects,
    filteredTasks,
    searchQuery,
    isLoading,
    error,
  } = useWorkspaceData()

  const visibleProjects =
    searchQuery ? filteredProjects : projects

  const visibleTasks =
    searchQuery ? filteredTasks : tasks

  const previewProjects =
    visibleProjects.slice(0, 3)

  const previewTasks =
    visibleTasks.slice(0, 5)

  return (

    <section className="page-section">

      {/* HEADER */}

      <div className="page-header page-header--with-action">

        <div>

          <h1>
            Dashboard
          </h1>

          <p>
            {isLoading
              ? 'Loading workspace data...'
              : error ||
                'Manage projects, track tasks, and monitor workspace activity.'}
          </p>

        </div>

        <Link
          to="/tasks"
          className="dashboard-add-btn"
        >
          + Add New Task
        </Link>

      </div>


      {/* PROJECTS */}

      <div className="dashboard-card">

        <div className="dashboard-card-header">

          <h2>
            Projects
          </h2>

          <Link
            to="/projects"
            className="dashboard-view-link"
          >
            View All
          </Link>

        </div>

        <div className="dashboard-project-grid">

          {previewProjects.length > 0 ? (

            previewProjects.map((project) => (

              <Link
                key={getEntityId(project)}
                to={`/projects/${getEntityId(project)}`}
                className="dashboard-project-card"
              >

                <strong>
                  {project.title}
                </strong>

                <p>
                  {project.description ||
                    'Project details'}
                </p>

              </Link>

            ))

          ) : (

            <div className="dashboard-empty">
              No projects found
            </div>

          )}

        </div>

      </div>


      {/* TASKS */}

      <div className="dashboard-card">

        <div className="dashboard-card-header">

          <h2>
            My Tasks
          </h2>

          <div className="dashboard-filter-row">

            <span>
              Quick Filters:
            </span>

            <button type="button">
              In Progress
            </button>

            <button type="button">
              Completed
            </button>

          </div>

        </div>

        <div className="dashboard-task-list">

          {previewTasks.length > 0 ? (

            previewTasks.map((task, index) => (

              <Link
                key={getEntityId(task)}
                to={`/tasks/${getEntityId(task)}`}
                className="dashboard-task-row"
              >

                <div className="dashboard-task-left">

                  <strong>
                    Task {index + 1}
                  </strong>

                  <p>
                    {task.assignee || 'Owner'}
                  </p>

                </div>

                <div className="dashboard-task-right">

                  <span>
                    {task.dueDate || 'No Due Date'}
                  </span>

                  <small
                    className={`dashboard-task-status ${
                      task.status === 'Completed'
                        ? 'dashboard-task-completed'
                        : task.status === 'In Progress'
                        ? 'dashboard-task-progress'
                        : 'dashboard-task-pending'
                    }`}
                  >
                    {task.status || 'Pending'}
                  </small>

                </div>

              </Link>

            ))

          ) : (

            <div className="dashboard-empty">
              No tasks found
            </div>

          )}

        </div>

      </div>

    </section>

  )
}

export default Dashboard