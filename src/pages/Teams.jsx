import { useWorkspaceData } from '../hooks/useWorkspaceData'

import { getEntityId } from '../utils/entity'

import { Link, useSearchParams } from 'react-router-dom'

import {
  sortTasks,
  taskStatusOptions,
  toDisplayStatus,
} from '../utils/taskUtils'

const Teams = () => {

  const {
    filteredUsers,
    filteredTasks,
    searchQuery,
    isLoading,
    error,
  } = useWorkspaceData()

  const [searchParams, setSearchParams] =
    useSearchParams()

  const statusFilter =
    searchParams.get('status') || ''

  const sortBy =
    searchParams.get('sort') || ''


  const updateFilter = (
    key,
    value
  ) => {

    const nextParams =
      new URLSearchParams(searchParams)

    if (value) {
      nextParams.set(key, value)
    } else {
      nextParams.delete(key)
    }

    setSearchParams(nextParams)
  }


  // GET TEAM TASKS
  const getTeamTasks = (member) => {

    const memberTasks =
      filteredTasks.filter((task) => {

        const assignee =
          String(task.assignee || '')
            .toLowerCase()

        return assignee.includes(
          member.name.toLowerCase()
        )
      })

    const filtered =
      statusFilter
        ? memberTasks.filter(
            (task) =>
              toDisplayStatus(task.status) ===
              statusFilter
          )
        : memberTasks

    return sortTasks(filtered, sortBy)
  }


  return (

    <section className="page-section">

      {/* HEADER */}

      <div className="page-header">

        <h1>
          Teams
        </h1>

        <p>
          {isLoading
            ? 'Loading team members...'
            : error ||
              'Manage workspace members and task ownership.'}
        </p>

      </div>


      {/* FILTERS */}

      <div className="dashboard-card">

        <div className="project-toolbar">

          <div className="project-toolbar-group">

            <select
              value={statusFilter}
              onChange={(event) =>
                updateFilter(
                  'status',
                  event.target.value
                )
              }
            >

              <option value="">
                All Statuses
              </option>

              {taskStatusOptions.map((status) => (

                <option
                  value={status}
                  key={status}
                >
                  {status}
                </option>

              ))}

            </select>


            <select
              value={sortBy}
              onChange={(event) =>
                updateFilter(
                  'sort',
                  event.target.value
                )
              }
            >

              <option value="">
                Default Sort
              </option>

              <option value="dueDate">
                Due Date
              </option>

              <option value="priority">
                Priority
              </option>

            </select>

          </div>

        </div>

      </div>


      {/* TEAM MEMBERS */}

      <div className="card-grid">

        {filteredUsers.length > 0 ? (

          filteredUsers.map((member) => {

            const memberTasks =
              getTeamTasks(member)

            return (

              <article
                className="team-card"
                key={getEntityId(member)}
              >

                <div className="team-card__content">

                  <div className="team-card__avatar">

                    {member.name?.charAt(0)}

                  </div>


                  <div>

                    <h3>
                      {member.name}
                    </h3>

                    <p>
                      {member.role}
                    </p>

                    <span>
                      {member.email}
                    </span>

                  </div>

                </div>


                <div className="team-task-section">

                  <div className="project-task-header">

                    <h2>
                      Tasks
                    </h2>

                    <span>
                      {memberTasks.length}
                    </span>

                  </div>


                  {memberTasks.length > 0 ? (

                    <div className="project-task-list">

                      {memberTasks.map((task) => (

                        <Link
                          key={getEntityId(task)}
                          to={`/tasks/${getEntityId(task)}`}
                          className="project-task-row"
                        >

                          <div className="project-task-info">

                            <strong>
                              {task.title}
                            </strong>

                            <p>
                              {task.project?.title ||
                                task.project?.name ||
                                'Project'}
                            </p>

                          </div>


                          <div className="project-task-meta">

                            <span
                              className={`task-pill ${
                                toDisplayStatus(task.status) === 'Completed'
                                  ? 'task-pill-completed'
                                  : toDisplayStatus(task.status) === 'In Progress'
                                  ? 'task-pill-progress'
                                  : 'task-pill-pending'
                              }`}
                            >

                              {toDisplayStatus(task.status)}

                            </span>


                            <small>

                              {task.dueDate ||
                                'No due date'}

                            </small>

                          </div>

                        </Link>

                      ))}

                    </div>

                  ) : (

                    <p className="empty-message">
                      No tasks assigned
                    </p>

                  )}

                </div>

              </article>

            )
          })

        ) : (

          <div className="dashboard-card">

            <h3>
              No team members found
            </h3>

            <p>
              {searchQuery
                ? 'Try another search term.'
                : 'Members will appear here.'}
            </p>

          </div>

        )}

      </div>

    </section>

  )
}

export default Teams