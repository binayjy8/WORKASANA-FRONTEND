import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FaPlus, FaXmark } from 'react-icons/fa6'
import { useWorkspaceData } from '../hooks/useWorkspaceData'
import { getEntityId } from '../utils/entity'
import { createTask } from '../services/taskApi'
import { filterTasksByParams, sortTasks, taskStatusOptions, toDisplayStatus } from '../utils/taskUtils'

const GROUPS    = ['To Do', 'In Progress', 'Completed', 'Blocked']
const PRIORITY  = ['Low', 'Medium', 'High']

const statusDotClass = (status) => {
  if (status === 'In Progress') return 'tk__dot--inprogress'
  if (status === 'Completed')   return 'tk__dot--completed'
  if (status === 'Blocked')     return 'tk__dot--blocked'
  return 'tk__dot--todo'
}

const priorityClass = (p) => {
  if (p === 'High')   return 'tk__chip--high'
  if (p === 'Low')    return 'tk__chip--low'
  return 'tk__chip--medium'
}

const initials = (name) =>
  String(name || '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

const TagInput = ({ tags, onChange }) => {
  const [input, setInput] = useState('')
  const add = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = input.trim().replace(/,$/, '')
      if (val && !tags.includes(val)) onChange([...tags, val])
      setInput('')
    }
  }
  return (
    <div className="tk__tag-input">
      {tags.map((tag) => (
        <span key={tag} className="tk__tag-chip">
          {tag}
          <button type="button" onClick={() => onChange(tags.filter((t) => t !== tag))}>
            <FaXmark />
          </button>
        </span>
      ))}
      <input
        type="text"
        placeholder={tags.length === 0 ? 'Type and press Enter…' : ''}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={add}
      />
    </div>
  )
}

const Tasks = () => {
  const navigate = useNavigate()
  const { filteredTasks, projects, teams, users, isLoading, error, addTask } = useWorkspaceData()
  const [searchParams, setSearchParams] = useSearchParams()

  const [modalOpen, setModalOpen]         = useState(false)
  const [creating, setCreating]           = useState(false)
  const [formError, setFormError]         = useState('')
  const [taskName, setTaskName]           = useState('')
  const [projectId, setProjectId]         = useState('')
  const [teamId, setTeamId]               = useState('')
  const [owners, setOwners]               = useState([])
  const [tags, setTags]                   = useState([])
  const [time, setTime]                   = useState('1')
  const [dueDate, setDueDate]             = useState('')
  const [status, setStatus]               = useState('To Do')
  const [priority, setPriority]           = useState('Medium')

  const resolvedProject = projectId || (projects[0] ? getEntityId(projects[0]) : '')
  const resolvedTeam    = teamId    || (teams[0]    ? getEntityId(teams[0])    : '')

  const visibleTasks = sortTasks(
    filterTasksByParams(filteredTasks, searchParams),
    searchParams.get('sort'),
  )

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams)
    value ? next.set(key, value) : next.delete(key)
    setSearchParams(next)
  }

  const toggleOwner = (uid) =>
    setOwners((prev) => prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid])

  const closeModal = () => {
    setModalOpen(false)
    setTaskName(''); setProjectId(''); setTeamId('')
    setOwners([]); setTags([]); setTime('1')
    setDueDate(''); setStatus('To Do'); setPriority('Medium')
    setFormError('')
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    const name = taskName.trim()
    if (!name) { setFormError('Task name is required'); return }
    if (!resolvedProject) { setFormError('Please select a project'); return }
    if (!resolvedTeam)    { setFormError('Please select a team');    return }
    setCreating(true)
    setFormError('')
    try {
      const created = await createTask({
        name, project: resolvedProject, team: resolvedTeam,
        owners, tags, timeToComplete: Number(time) || 1,
        dueDate: dueDate || undefined,
        deadline: dueDate || undefined,
        status,
        priority,
      })
      addTask(created)
      closeModal()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create task')
    } finally {
      setCreating(false)
    }
  }

  const allTags = [...new Set(filteredTasks.flatMap((t) => t.tags || []))]

  return (
    <div className="tk">

      <div className="tk__header">
        <div>
          <h1 className="tk__title">Tasks</h1>
          <p className="tk__subtitle">
            {isLoading ? 'Loading tasks…' : error || 'Track task progress across your projects.'}
          </p>
        </div>
        <button type="button" className="tk__new-btn" onClick={() => setModalOpen(true)}>
          <FaPlus /><span>New Task</span>
        </button>
      </div>

      <div className="tk__filters">
        <div className="tk__filters-row">
          <select className="tk__select" value={searchParams.get('status') || ''} onChange={(e) => updateFilter('status', e.target.value)}>
            <option value="">All Statuses</option>
            {taskStatusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="tk__select" value={searchParams.get('project') || ''} onChange={(e) => updateFilter('project', e.target.value)}>
            <option value="">All Projects</option>
            {projects.map((p) => <option key={getEntityId(p)} value={p.title}>{p.title}</option>)}
          </select>
          <select className="tk__select" value={searchParams.get('team') || ''} onChange={(e) => updateFilter('team', e.target.value)}>
            <option value="">All Teams</option>
            {teams.map((t) => <option key={getEntityId(t)} value={t.name}>{t.name}</option>)}
          </select>
          <select className="tk__select" value={searchParams.get('owner') || ''} onChange={(e) => updateFilter('owner', e.target.value)}>
            <option value="">All Owners</option>
            {users.map((u) => <option key={getEntityId(u)} value={u.name}>{u.name}</option>)}
          </select>
          <select className="tk__select" value={searchParams.get('tags') || ''} onChange={(e) => updateFilter('tags', e.target.value)}>
            <option value="">All Tags</option>
            {allTags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
          </select>
          <select className="tk__select" value={searchParams.get('sort') || ''} onChange={(e) => updateFilter('sort', e.target.value)}>
            <option value="">Sort: Default</option>
            <option value="dueDate">Sort: Due Date</option>
            <option value="priority">Sort: Priority</option>
          </select>
          {searchParams.toString() && (
            <button type="button" className="tk__clear-btn" onClick={() => setSearchParams({})}>
              <FaXmark /> Clear
            </button>
          )}
        </div>
        <span className="tk__count">{visibleTasks.length} tasks</span>
      </div>

      <div className="tk__board">
        {GROUPS.map((group) => {
          const groupTasks = visibleTasks.filter((t) => toDisplayStatus(t.status) === group)
          return (
            <div key={group} className="tk__col">
              <div className="tk__col-header">
                <span className={`tk__col-dot tk__dot--${group.toLowerCase().replace(' ', '')}`} />
                <h3 className="tk__col-title">{group}</h3>
                <span className="tk__col-count">{groupTasks.length}</span>
              </div>
              <div className="tk__col-body">
                {groupTasks.length === 0 ? (
                  <div className="tk__col-empty">No tasks</div>
                ) : (
                  groupTasks.map((task) => (
                    <div
                      key={getEntityId(task)}
                      className="tk__card"
                      onClick={() => navigate(`/tasks/${getEntityId(task)}`)}
                    >
                      <div className="tk__card-top">
                        <span className={`tk__dot ${statusDotClass(task.status)}`} />
                        <p className="tk__card-name">{task.title || task.name}</p>
                      </div>
                      {task.dueDate && (
                        <p className="tk__card-due">Due: {task.dueDate}</p>
                      )}
                      <div className="tk__card-footer">
                        {task.assignee && (
                          <span className="tk__card-avatar" title={task.assignee}>
                            {initials(task.assignee)}
                          </span>
                        )}
                        {(task.tags || []).slice(0, 2).map((tag) => (
                          <span key={tag} className="tk__card-tag">{tag}</span>
                        ))}
                        <span className={`tk__chip ${priorityClass(task.priority)}`}>
                          {task.priority || 'Medium'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {modalOpen && (
        <div className="tk__modal-backdrop" onClick={closeModal}>
          <div className="tk__modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">

            <div className="tk__modal-header">
              <div>
                <h2 className="tk__modal-title">
                  Create New Task
                  {resolvedProject && projects.find((p) => getEntityId(p) === resolvedProject) && (
                    <span className="tk__modal-project">
                      {' '}for {projects.find((p) => getEntityId(p) === resolvedProject)?.title}
                    </span>
                  )}
                </h2>
                <p className="tk__modal-sub">Fill in the details below</p>
              </div>
              <button type="button" className="tk__modal-close" onClick={closeModal}>
                <FaXmark />
              </button>
            </div>

            <form className="tk__form" onSubmit={handleCreate}>

              <div className="tk__field">
                <label className="tk__label">Task Name *</label>
                <input
                  className="tk__input"
                  type="text"
                  placeholder="Enter task name"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="tk__field">
                <label className="tk__label">Team</label>
                <select className="tk__input" value={resolvedTeam} onChange={(e) => setTeamId(e.target.value)}>
                  {teams.map((t) => (
                    <option key={getEntityId(t)} value={getEntityId(t)}>{t.name}</option>
                  ))}
                </select>
              </div>

              {users.length > 0 && (
                <div className="tk__field">
                  <label className="tk__label">Owners</label>
                  <div className="tk__owners">
                    {users.map((u) => {
                      const uid = getEntityId(u)
                      return (
                        <button
                          key={uid}
                          type="button"
                          className={`tk__owner-chip ${owners.includes(uid) ? 'tk__owner-chip--on' : ''}`}
                          onClick={() => toggleOwner(uid)}
                        >
                          <span className="tk__owner-avatar">{initials(u.name)}</span>
                          <span>{u.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="tk__field">
                <label className="tk__label">Tags (Enter or comma to add)</label>
                <TagInput tags={tags} onChange={setTags} />
              </div>

              <div className="tk__form-row">
                <div className="tk__field">
                  <label className="tk__label">Due Date</label>
                  <input className="tk__input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
                <div className="tk__field">
                  <label className="tk__label">Time (Days)</label>
                  <input className="tk__input" type="number" min="1" value={time} onChange={(e) => setTime(e.target.value)} />
                </div>
              </div>

              <div className="tk__form-row">
                <div className="tk__field">
                  <label className="tk__label">Priority</label>
                  <select className="tk__input" value={priority} onChange={(e) => setPriority(e.target.value)}>
                    {PRIORITY.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="tk__field">
                  <label className="tk__label">Status</label>
                  <select className="tk__input" value={status} onChange={(e) => setStatus(e.target.value)}>
                    {taskStatusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {formError && <p className="tk__form-error">{formError}</p>}

              <div className="tk__form-actions">
                <button type="submit" className="tk__submit-btn" disabled={creating}>
                  {creating ? 'Creating…' : 'Create Task'}
                </button>
                <button type="button" className="tk__cancel-btn" onClick={closeModal}>Cancel</button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default Tasks
