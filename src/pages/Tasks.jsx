import { useState } from 'react'

import { useSearchParams } from 'react-router-dom'

import EmptyState from '../components/EmptyState'

import TaskCard from '../components/TaskCards'

import { useWorkspaceData } from '../hooks/useWorkspaceData'

import { getEntityId } from '../utils/entity'

import { createTask } from '../services/taskApi'

import {
  filterTasksByParams,
  sortTasks,
  taskStatusOptions,
  toDisplayStatus,
} from '../utils/taskUtils'

const taskGroups = [
  'To Do',
  'In Progress',
  'Completed',
  'Blocked',
]

const normalizeStatusForBoard = (status) => {
  return toDisplayStatus(status)
}

const Tasks = () => {

  const {
    filteredTasks,
    projects,
    teams,
    isLoading,
    error,
    addTask,
  } = useWorkspaceData()

  const [searchParams, setSearchParams] =
    useSearchParams()

  const [taskName, setTaskName] =
    useState('')

  const [isModalOpen, setIsModalOpen] =
    useState(false)

  const [isCreating, setIsCreating] =
    useState(false)

  const [selectedProjectId, setSelectedProjectId] =
    useState('')

  const [selectedTeamId, setSelectedTeamId] =
    useState('')

  const [tags, setTags] =
    useState('')

  const [timeToComplete, setTimeToComplete] =
    useState('1')

  const [status, setStatus] =
    useState('To Do')

  const defaultProjectId =
    projects.length > 0
      ? getEntityId(projects[0])
      : ''

  const projectId =
    selectedProjectId || defaultProjectId

  const defaultTeamId =
    teams.length > 0
      ? getEntityId(teams[0])
      : ''

  const teamId =
    selectedTeamId || defaultTeamId

  const filteredByUrl =
    filterTasksByParams(
      filteredTasks,
      searchParams
    )

  const visibleTasks =
    sortTasks(
      filteredByUrl,
      searchParams.get('sort')
    )

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

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleCreateTask = async (
    event
  ) => {

    event.preventDefault()

    const title =
      taskName.trim()

    if (!title) {
      alert('Please enter a task name')
      return
    }

    try {

      setIsCreating(true)

      const createdTask =
        await createTask({

          name: title,

          project: projectId,

          team: teamId,

          tags: tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),

          timeToComplete:
            Number(timeToComplete) || 1,

          status,

        })

      addTask(createdTask)

      setTaskName('')
      setTags('')
      setTimeToComplete('1')
      setStatus('To Do')

      closeModal()

    } catch (error) {

      console.log(error)

      alert(
        error.response?.data?.message ||
        'Failed to create task'
      )

    } finally {

      setIsCreating(false)

    }
  }

  return (

    <section className="page-section">

      <div className="tasks-header">

        <div className="page-header">

          <h1>
            Tasks
          </h1>

          <p>
            {isLoading
              ? 'Loading tasks...'
              : error ||
                'Track task progress across your projects.'}
          </p>

        </div>

        <button
          type="button"
          className="tasks-add-btn"
          onClick={() =>
            setIsModalOpen(true)
          }
        >
          + New Task
        </button>

      </div>


      {/* MODAL */}

      {isModalOpen && (

        <div
          className="modal-backdrop"
          onClick={closeModal}
        >

          <form
            className="task-modal"
            onSubmit={handleCreateTask}
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              type="button"
              className="modal-close-btn"
              onClick={closeModal}
            >
              ✕
            </button>

            <h2>
              Create New Task
            </h2>

            <label>

              <span>
                Task Name
              </span>

              <input
                type="text"
                placeholder="Enter task name"
                value={taskName}
                onChange={(e) =>
                  setTaskName(
                    e.target.value
                  )
                }
              />

            </label>


            <label>

              <span>
                Project
              </span>

              <select
                value={projectId}
                onChange={(e) =>
                  setSelectedProjectId(
                    e.target.value
                  )
                }
              >

                {projects.map((project) => (

                  <option
                    value={getEntityId(project)}
                    key={getEntityId(project)}
                  >
                    {project.title}
                  </option>

                ))}

              </select>

            </label>


            <label>

              <span>
                Team
              </span>

              <select
                value={teamId}
                onChange={(e) =>
                  setSelectedTeamId(
                    e.target.value
                  )
                }
              >

                {teams.map((team) => (

                  <option
                    value={getEntityId(team)}
                    key={getEntityId(team)}
                  >
                    {team.name}
                  </option>

                ))}

              </select>

            </label>


            <label>

              <span>
                Tags
              </span>

              <input
                type="text"
                placeholder="Frontend, Design"
                value={tags}
                onChange={(e) =>
                  setTags(
                    e.target.value
                  )
                }
              />

            </label>


            <label>

              <span>
                Time (Days)
              </span>

              <input
                type="number"
                min="1"
                value={timeToComplete}
                onChange={(e) =>
                  setTimeToComplete(
                    e.target.value
                  )
                }
              />

            </label>


            <label>

              <span>
                Status
              </span>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value
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

            </label>


            <div className="modal-actions">

              <button
                type="submit"
                className="tasks-add-btn"
                disabled={isCreating}
              >
                {isCreating
                  ? 'Creating...'
                  : 'Create Task'}
              </button>

              <button
                type="button"
                className="modal-cancel-btn"
                onClick={closeModal}
              >
                Cancel
              </button>

            </div>

          </form>

        </div>

      )}


      {/* FILTERS */}

      <div className="task-filter-panel">

        <h2 className="task-filter-title">
          Task Filters
        </h2>

        <div className="filter-grid">

          <label>
            Team

            <input
              value={searchParams.get('team') || ''}
              onChange={(e) =>
                updateFilter(
                  'team',
                  e.target.value
                )
              }
              placeholder="Development"
            />
          </label>

          <label>
            Tags

            <input
              value={searchParams.get('tags') || ''}
              onChange={(e) =>
                updateFilter(
                  'tags',
                  e.target.value
                )
              }
              placeholder="Urgent"
            />
          </label>

          <label>
            Project

            <input
              value={searchParams.get('project') || ''}
              onChange={(e) =>
                updateFilter(
                  'project',
                  e.target.value
                )
              }
              placeholder="Project Name"
            />
          </label>

          <label>
            Status

            <select
              value={searchParams.get('status') || ''}
              onChange={(e) =>
                updateFilter(
                  'status',
                  e.target.value
                )
              }
            >

              <option value="">
                All
              </option>

              {taskStatusOptions.map((statusOption) => (

                <option
                  value={statusOption}
                  key={statusOption}
                >
                  {statusOption}
                </option>

              ))}

            </select>

          </label>

          <label>
            Sort

            <select
              value={searchParams.get('sort') || ''}
              onChange={(e) =>
                updateFilter(
                  'sort',
                  e.target.value
                )
              }
            >
              <option value="">
                Default
              </option>

              <option value="dueDate">
                Due Date
              </option>

              <option value="priority">
                Priority
              </option>

            </select>

          </label>

        </div>

      </div>


      {/* TASK BOARD */}

      <div className="task-board-wrapper">

        <h2 className="task-board-title">
          Task Board
        </h2>

        <div className="task-board">

          {taskGroups.map((status) => {

            const tasksByStatus =
              visibleTasks.filter(
                (task) =>
                  normalizeStatusForBoard(
                    task.status
                  ) === status
              )

            return (

              <section
                className="task-column"
                key={status}
              >

                <div className="task-column__header">

                  <h2>
                    {status}
                  </h2>

                  <span>
                    {tasksByStatus.length}
                  </span>

                </div>

                <div className="task-column__list">

                  {tasksByStatus.length > 0 ? (

                    tasksByStatus.map((task) => (

                      <TaskCard
                        task={task}
                        key={getEntityId(task)}
                      />

                    ))

                  ) : (

                    <div className="empty-column">
                    <strong>No tasks</strong>
                    <p>Nothing in this column.</p>
                    </div>

                  )}

                </div>

              </section>

            )
          })}

        </div>

      </div>

    </section>
  )
}

export default Tasks