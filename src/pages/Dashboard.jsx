import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useWorkspaceData } from '../hooks/useWorkspaceData'
import { getEntityId } from '../utils/entity'
import { toDisplayStatus } from '../utils/taskUtils'

const STATUS_FILTERS = ['All', 'In Progress', 'Completed', 'To Do', 'Blocked']

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

  const [activeFilter, setActiveFilter] = useState('All')

  const visibleProjects = searchQuery ? filteredProjects : projects
  const visibleTasks = searchQuery ? filteredTasks : tasks

  const previewProjects = visibleProjects.slice(0, 3)

  const filteredByStatus =
    activeFilter === 'All'
      ? visibleTasks
      : visibleTasks.filter(
          (task) => toDisplayStatus(task.status) === activeFilter,
        )

  const previewTasks = filteredByStatus.slice(0, 5)

  const stats = {
    total: tasks.length,
    inProgress: tasks.filter((t) => toDisplayStatus(t.status) === 'In Progress').length,
    completed: tasks.filter((t) => toDisplayStatus(t.status) === 'Completed').length,
    todo: tasks.filter((t) => toDisplayStatus(t.status) === 'To Do').length,
  }

  return (
    <section className="page-section">

      {/* HEADER */}
      <div className="page-header page-header--with-action">
        <div>
          <h1>Dashboard</h1>
          <p>
            {isLoading
              ? 'Loading workspace data...'
              : error || 'Manage projects, track tasks, and monitor workspace activity.'}
          </p>
        </div>
        <Link to="/tasks" className="dashboard-add-btn">
          + Add New Task
        </Link>
      </div>

      {/* STATS ROW */}
      <div className="dashboard-stats-row">
        <article className="dashboard-stat-card">
          <span className="dashboard-stat-label">Total Tasks</span>
          <strong className="dashboard-stat-value">{stats.total}</strong>
        </article>
        <article className="dashboard-stat-card dashboard-stat-card--progress">
          <span className="dashboard-stat-label">In Progress</span>
          <strong className="dashboard-stat-value">{stats.inProgress}</strong>
        </article>
        <article className="dashboard-stat-card dashboard-stat-card--completed">
          <span className="dashboard-stat-label">Completed</span>
          <strong className="dashboard-stat-value">{stats.completed}</strong>
        </article>
        <article className="dashboard-stat-card dashboard-stat-card--todo">
          <span className="dashboard-stat-label">To Do</span>
          <strong className="dashboard-stat-value">{stats.todo}</strong>
        </article>
      </div>

      {/* PROJECTS */}
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h2>Recent Projects</h2>
          <Link to="/projects" className="dashboard-view-link">
            View All →
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
                <div className="dashboard-project-card-top">
                  <span
                    className={`project-status ${
                      project.status === 'Completed'
                        ? 'project-status-completed'
                        : project.status === 'In Progress'
                        ? 'project-status-progress'
                        : 'project-status-pending'
                    }`}
                  >
                    {project.status || 'Pending'}
                  </span>
                </div>
                <strong>{project.title}</strong>
                <p>{project.description || 'No description available.'}</p>
              </Link>
            ))
          ) : (
            <div className="dashboard-empty">
              {isLoading ? 'Loading projects...' : 'No projects found'}
            </div>
          )}
        </div>
      </div>

      {/* TASKS */}
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h2>My Tasks</h2>
          <Link to="/tasks" className="dashboard-view-link">
            View All →
          </Link>
        </div>

        {/* QUICK FILTERS */}
        <div className="dashboard-filter-row">
          <span>Quick Filters:</span>
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`dashboard-filter-btn ${
                activeFilter === filter ? 'dashboard-filter-btn--active' : ''
              }`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="dashboard-task-list">
          {previewTasks.length > 0 ? (
            previewTasks.map((task) => (
              <Link
                key={getEntityId(task)}
                to={`/tasks/${getEntityId(task)}`}
                className="dashboard-task-row"
              >
                <div className="dashboard-task-left">
                  <strong>{task.title || task.name || 'Untitled Task'}</strong>
                  <p>
                    {task.project?.title || task.project?.name || task.project || 'No Project'}
                  </p>
                </div>

                <div className="dashboard-task-right">
                  <span>{task.dueDate || 'No Due Date'}</span>
                  <small
                    className={`dashboard-task-status ${
                      toDisplayStatus(task.status) === 'Completed'
                        ? 'dashboard-task-completed'
                        : toDisplayStatus(task.status) === 'In Progress'
                        ? 'dashboard-task-progress'
                        : toDisplayStatus(task.status) === 'Blocked'
                        ? 'dashboard-task-blocked'
                        : 'dashboard-task-pending'
                    }`}
                  >
                    {toDisplayStatus(task.status) || 'Pending'}
                  </small>
                </div>
              </Link>
            ))
          ) : (
            <div className="dashboard-empty">
              {isLoading ? 'Loading tasks...' : `No ${activeFilter !== 'All' ? activeFilter : ''} tasks found`}
            </div>
          )}
        </div>
      </div>

    </section>
  )
}

export default Dashboard
