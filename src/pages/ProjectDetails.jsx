import { Link, useParams, useSearchParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState'
import { useWorkspaceData } from '../hooks/useWorkspaceData'
import { getEntityId, isSameEntityId } from '../utils/entity'
import {
  filterTasksByParams,
  getTaskTags,
  sortTasks,
  taskBelongsToProject,
  toDisplayStatus,
} from '../utils/taskUtils'

const statusPillClass = (status) => {
  switch (status) {
    case 'Completed':   return 'task-pill-completed'
    case 'In Progress': return 'task-pill-progress'
    case 'Blocked':     return 'task-pill-blocked'
    default:            return 'task-pill-pending'
  }
}

const ProjectDetails = () => {
  const { projectId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { projects, tasks, isLoading, error } = useWorkspaceData()

  const project = projects.find((item) =>
    isSameEntityId(getEntityId(item), projectId),
  )

  const projectTasks = project
    ? sortTasks(
        filterTasksByParams(
          tasks.filter((task) => taskBelongsToProject(task, project)),
          searchParams,
        ),
        searchParams.get('sort'),
      )
    : []

  const allTags = [
    ...new Set(
      tasks
        .filter((task) => (project ? taskBelongsToProject(task, project) : false))
        .flatMap(getTaskTags),
    ),
  ]

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams)
    value ? next.set(key, value) : next.delete(key)
    setSearchParams(next)
  }

  const clearFilters = () => setSearchParams({})
  const hasFilters = searchParams.toString() !== ''

  // ── Loading / not found ──────────────────────────────
  if (!project && isLoading) {
    return (
      <section className="page-section">
        <div className="page-header">
          <h1>Loading Project…</h1>
          <p>Fetching project details…</p>
        </div>
      </section>
    )
  }

  if (!project) {
    return (
      <section className="page-section">
        <div className="page-header">
          <h1>Project not found</h1>
          <p>This project does not exist or has been removed.</p>
        </div>
        <Link to="/projects" className="project-add-btn">← Back to Projects</Link>
      </section>
    )
  }

  // ── Stats ────────────────────────────────────────────
  const completedCount = projectTasks.filter(
    (t) => toDisplayStatus(t.status) === 'Completed',
  ).length

  return (
    <section className="page-section">

      {/* HEADER */}
      <div className="project-header">
        <div>
          <span className="project-label">PROJECT</span>
          <h1>{project.title}</h1>
          <p>
            {error || project.description || 'Manage project tasks and workflow.'}
          </p>
        </div>
        <Link to="/tasks" className="project-add-btn">+ Add Task</Link>
      </div>

      {/* STATS */}
      <div className="project-stats-row">
        <div className="project-stat">
          <strong>{projectTasks.length}</strong>
          <span>Total Tasks</span>
        </div>
        <div className="project-stat project-stat--completed">
          <strong>{completedCount}</strong>
          <span>Completed</span>
        </div>
        <div className="project-stat project-stat--pending">
          <strong>{projectTasks.length - completedCount}</strong>
          <span>Remaining</span>
        </div>
        {project.team?.length > 0 && (
          <div className="project-stat">
            <strong>{project.team.length}</strong>
            <span>Team Members</span>
          </div>
        )}
      </div>

      {/* FILTERS */}
      <div className="dashboard-card">
        <div className="project-toolbar">
          <div className="project-toolbar-group">

            <select
              value={searchParams.get('owner') || ''}
              onChange={(e) => updateFilter('owner', e.target.value)}
            >
              <option value="">Filter by Owner</option>
              {project.team?.map((member) => (
                <option key={member} value={member}>{member}</option>
              ))}
            </select>

            <select
              value={searchParams.get('tags') || ''}
              onChange={(e) => updateFilter('tags', e.target.value)}
            >
              <option value="">Filter by Tag</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>

          </div>

          <div className="project-toolbar-group">
            <button
              type="button"
              className={`toolbar-sort-btn ${searchParams.get('sort') === 'dueDate' ? 'toolbar-sort-btn--active' : ''}`}
              onClick={() => updateFilter('sort', searchParams.get('sort') === 'dueDate' ? '' : 'dueDate')}
            >
              Due Date
            </button>
            <button
              type="button"
              className={`toolbar-sort-btn ${searchParams.get('sort') === 'priority' ? 'toolbar-sort-btn--active' : ''}`}
              onClick={() => updateFilter('sort', searchParams.get('sort') === 'priority' ? '' : 'priority')}
            >
              Priority
            </button>
            {hasFilters && (
              <button type="button" className="toolbar-clear-btn" onClick={clearFilters}>
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TASK LIST */}
      <div className="dashboard-card">
        <div className="project-task-header">
          <h2>Task List</h2>
          <span className="project-task-count">{projectTasks.length} Tasks</span>
        </div>

        <div className="project-task-list">
          {projectTasks.length > 0 ? (
            projectTasks.map((task) => {
              const status = toDisplayStatus(task.status)
              return (
                <Link
                  key={getEntityId(task)}
                  to={`/tasks/${getEntityId(task)}`}
                  className="project-task-row"
                >
                  <div className="project-task-info">
                    <strong>{task.title || task.name || 'Untitled Task'}</strong>
                    <p>{task.assignee || 'Unassigned'}</p>
                  </div>

                  <div className="project-task-meta">
                    <span className={`task-pill ${statusPillClass(status)}`}>
                      {status}
                    </span>
                    <small>{task.dueDate || 'No due date'}</small>
                  </div>
                </Link>
              )
            })
          ) : (
            <EmptyState
              icon="📋"
              title="No tasks yet"
              description="Tasks for this project will appear here. Add a task to get started."
            />
          )}
        </div>
      </div>

    </section>
  )
}

export default ProjectDetails
