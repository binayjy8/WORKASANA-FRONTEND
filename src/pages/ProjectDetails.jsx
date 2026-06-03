import { Link, useParams, useSearchParams } from 'react-router-dom'

import EmptyState from '../components/EmptyState'

import { useWorkspaceData } from '../hooks/useWorkspaceData'

import {
  getEntityId,
  isSameEntityId,
} from '../utils/entity'

import {
  filterTasksByParams,
  getTaskTags,
  sortTasks,
  taskBelongsToProject,
  toDisplayStatus,
} from '../utils/taskUtils'

const ProjectDetails = () => {

  const { projectId } = useParams()

  const [searchParams, setSearchParams] =
    useSearchParams()

  const {
    projects,
    tasks,
    isLoading,
    error,
  } = useWorkspaceData()

  const project =
    projects.find((item) =>
      isSameEntityId(
        getEntityId(item),
        projectId
      )
    )

  const projectTasks = project
    ? sortTasks(
        filterTasksByParams(
          tasks.filter((task) =>
            taskBelongsToProject(task, project)
          ),
          searchParams,
        ),
        searchParams.get('sort'),
      )
    : []

  const allTags = [
    ...new Set(
      tasks
        .filter((task) =>
          project
            ? taskBelongsToProject(task, project)
            : false
        )
        .flatMap(getTaskTags),
    ),
  ]


  const updateFilter = (key, value) => {

    const nextParams =
      new URLSearchParams(searchParams)

    if (value) {
      nextParams.set(key, value)
    } else {
      nextParams.delete(key)
    }

    setSearchParams(nextParams)
  }


  if (!project && !isLoading) {

    return (

      <section className="page-section">

        <div className="page-header">

          <h1>
            Project not found
          </h1>

          <p>
            This project does not exist.
          </p>

        </div>

      </section>

    )
  }


  if (!project) {

    return (

      <section className="page-section">

        <div className="page-header">

          <h1>
            Loading Project
          </h1>

          <p>
            Fetching project details...
          </p>

        </div>

      </section>

    )
  }


  return (

    <section className="page-section">

      {/* HEADER */}

      <div className="project-header">

        <div>

          <span className="project-label">
            PROJECT
          </span>

          <h1>
            {project.title}
          </h1>

          <p>
            {isLoading
              ? 'Loading project details...'
              : error ||
                project.description ||
                'Manage project tasks and workflow.'}
          </p>

        </div>

        <Link
          to="/tasks"
          className="project-add-btn"
        >
          + Add Task
        </Link>

      </div>


      {/* FILTERS */}

      <div className="dashboard-card">

        <div className="project-toolbar">

          <div className="project-toolbar-group">

            <select
              value={
                searchParams.get('owner') || ''
              }
              onChange={(event) =>
                updateFilter(
                  'owner',
                  event.target.value
                )
              }
            >

              <option value="">
                Filter by Owner
              </option>

              {project.team?.map((member) => (

                <option
                  key={member}
                  value={member}
                >
                  {member}
                </option>

              ))}

            </select>


            <select
              value={
                searchParams.get('tags') || ''
              }
              onChange={(event) =>
                updateFilter(
                  'tags',
                  event.target.value
                )
              }
            >

              <option value="">
                Filter by Tag
              </option>

              {allTags.map((tag) => (

                <option
                  key={tag}
                  value={tag}
                >
                  {tag}
                </option>

              ))}

            </select>

          </div>


          <div className="project-toolbar-group">

            <button
              type="button"
              onClick={() =>
                updateFilter(
                  'sort',
                  'dueDate'
                )
              }
            >
              Due Date
            </button>

            <button
              type="button"
              onClick={() =>
                updateFilter(
                  'sort',
                  'priority'
                )
              }
            >
              Priority
            </button>

          </div>

        </div>

      </div>


      {/* TASK LIST */}

      <div className="dashboard-card">

        <div className="project-task-header">

          <h2>
            Task List
          </h2>

          <span>
            {projectTasks.length} Tasks
          </span>

        </div>


        <div className="project-task-list">

          {projectTasks.length > 0 ? (

            projectTasks.map((task, index) => (

              <Link
                to={`/tasks/${getEntityId(task)}`}
                key={getEntityId(task)}
                className="project-task-row"
              >

                <div className="project-task-info">

                  <strong>
                    Task {index + 1}
                  </strong>

                  <p>
                    {task.assignee || 'Owner'}
                  </p>

                </div>


                <div className="project-task-meta">

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

                  <small>
                    {task.dueDate || 'No due date'}
                  </small>

                </div>

              </Link>

            ))

          ) : (

            <EmptyState
              title="No tasks yet"
              description="Tasks for this project will appear here."
            />

          )}

        </div>

      </div>

    </section>

  )
}

export default ProjectDetails