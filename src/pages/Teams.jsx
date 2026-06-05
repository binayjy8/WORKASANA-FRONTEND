import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useWorkspaceData } from '../hooks/useWorkspaceData'
import { getEntityId } from '../utils/entity'
import { sortTasks, taskStatusOptions, toDisplayStatus } from '../utils/taskUtils'
import EmptyState from '../components/EmptyState'
import { createTeam } from '../services/api'

const statusPillClass = (status) => {
  switch (status) {
    case 'Completed':   return 'task-pill-completed'
    case 'In Progress': return 'task-pill-progress'
    case 'Blocked':     return 'task-pill-blocked'
    default:            return 'task-pill-pending'
  }
}

const AVATAR_COLORS = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6']
const avatarColor = (name) => AVATAR_COLORS[String(name || '').charCodeAt(0) % AVATAR_COLORS.length]
const getInitials = (name) => String(name || 'U').split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2)

const VIEWS = ['By Member', 'By Team']

const Teams = () => {
  const {
    filteredUsers,
    filteredTasks,
    teams,
    searchQuery,
    isLoading,
    error,
    addTeam,
  } = useWorkspaceData()

  const [searchParams, setSearchParams] = useSearchParams()
  const [view, setView] = useState('By Member')

  // ── Create team modal ─────────────────────────────────
  const [isModalOpen, setIsModalOpen]   = useState(false)
  const [teamName, setTeamName]         = useState('')
  const [teamDesc, setTeamDesc]         = useState('')
  const [isCreating, setIsCreating]     = useState(false)

  const closeModal = () => {
    setIsModalOpen(false)
    setTeamName('')
    setTeamDesc('')
  }

  const handleCreateTeam = async (e) => {
    e.preventDefault()
    if (!teamName.trim()) { alert('Please enter a team name'); return }
    try {
      setIsCreating(true)
      const created = await createTeam({
        name:        teamName.trim(),
        description: teamDesc.trim(),
      })
      addTeam(created)
      closeModal()
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Failed to create team')
    } finally {
      setIsCreating(false)
    }
  }

  const statusFilter = searchParams.get('status') || ''
  const sortBy       = searchParams.get('sort')   || ''

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams)
    value ? next.set(key, value) : next.delete(key)
    setSearchParams(next)
  }

  const getMemberTasks = (member) => {
    const raw = filteredTasks.filter((task) =>
      String(task.assignee || '').toLowerCase().includes(member.name.toLowerCase()),
    )
    const filtered = statusFilter
      ? raw.filter((t) => toDisplayStatus(t.status) === statusFilter)
      : raw
    return sortTasks(filtered, sortBy)
  }

  const getTeamTasks = (team) => {
    const raw = filteredTasks.filter((task) => {
      const taskTeam = task.team?.name || task.team || ''
      return String(taskTeam).toLowerCase().includes(team.name.toLowerCase())
    })
    const filtered = statusFilter
      ? raw.filter((t) => toDisplayStatus(t.status) === statusFilter)
      : raw
    return sortTasks(filtered, sortBy)
  }

  const TaskList = ({ tasks: taskList }) => {
    if (taskList.length === 0) return <p className="empty-message">No tasks assigned</p>
    return (
      <div className="project-task-list">
        {taskList.map((task) => {
          const status = toDisplayStatus(task.status)
          return (
            <Link key={getEntityId(task)} to={`/tasks/${getEntityId(task)}`} className="project-task-row">
              <div className="project-task-info">
                <strong>{task.title || task.name || 'Untitled'}</strong>
                <p>{task.project?.title || task.project?.name || 'No Project'}</p>
              </div>
              <div className="project-task-meta">
                <span className={`task-pill ${statusPillClass(status)}`}>{status}</span>
                <small>{task.dueDate || 'No due date'}</small>
              </div>
            </Link>
          )
        })}
      </div>
    )
  }

  return (
    <section className="page-section">

      {/* HEADER */}
      <div className="page-header page-header--with-action">
        <div>
          <h1>Teams</h1>
          <p>
            {isLoading ? 'Loading team members…'
              : error || 'Manage workspace members and task ownership.'}
          </p>
        </div>
        <button type="button" className="tasks-add-btn" onClick={() => setIsModalOpen(true)}>
          + New Team
        </button>
      </div>

      {/* ── CREATE TEAM MODAL ────────────────────────────── */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="project-modal" onClick={(e) => e.stopPropagation()}
            role="dialog" aria-modal="true">
            <div className="modal-header">
              <div>
                <h2>Create New Team</h2>
                <p>Add a new team to your workspace</p>
              </div>
              <button type="button" className="modal-close-btn" onClick={closeModal}>✕</button>
            </div>
            <form className="modal-form" onSubmit={handleCreateTeam}>
              <label className="modal-field">
                <span>Team Name *</span>
                <input
                  type="text"
                  placeholder="e.g. Development, Marketing"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                  autoFocus
                />
              </label>
              <label className="modal-field">
                <span>Description</span>
                <textarea
                  placeholder="What does this team work on?"
                  value={teamDesc}
                  onChange={(e) => setTeamDesc(e.target.value)}
                  rows={3}
                />
              </label>
              <div className="modal-actions">
                <button type="submit" className="project-submit-btn" disabled={isCreating}>
                  {isCreating ? 'Creating…' : 'Create Team'}
                </button>
                <button type="button" className="modal-cancel-btn" onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STATS */}
      <div className="teams-stats-row">
        <div className="dashboard-stat-card">
          <span className="dashboard-stat-label">Total Members</span>
          <strong className="dashboard-stat-value">{filteredUsers.length}</strong>
        </div>
        <div className="dashboard-stat-card dashboard-stat-card--progress">
          <span className="dashboard-stat-label">Active Tasks</span>
          <strong className="dashboard-stat-value">
            {filteredTasks.filter((t) => toDisplayStatus(t.status) === 'In Progress').length}
          </strong>
        </div>
        <div className="dashboard-stat-card dashboard-stat-card--completed">
          <span className="dashboard-stat-label">Completed Tasks</span>
          <strong className="dashboard-stat-value">
            {filteredTasks.filter((t) => toDisplayStatus(t.status) === 'Completed').length}
          </strong>
        </div>
      </div>

      {/* FILTERS + VIEW TOGGLE */}
      <div className="dashboard-card">
        <div className="project-toolbar">
          <div className="project-toolbar-group">
            {VIEWS.map((v) => (
              <button key={v} type="button"
                className={`toolbar-sort-btn ${view === v ? 'toolbar-sort-btn--active' : ''}`}
                onClick={() => setView(v)}>
                {v}
              </button>
            ))}
          </div>
          <div className="project-toolbar-group">
            <select value={statusFilter} onChange={(e) => updateFilter('status', e.target.value)}>
              <option value="">All Statuses</option>
              {taskStatusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={sortBy} onChange={(e) => updateFilter('sort', e.target.value)}>
              <option value="">Default Sort</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── BY MEMBER ────────────────────────────────────── */}
      {view === 'By Member' && (
        filteredUsers.length > 0 ? (
          <div className="teams-member-grid">
            {filteredUsers.map((member) => {
              const memberTasks = getMemberTasks(member)
              const completed   = memberTasks.filter(
                (t) => toDisplayStatus(t.status) === 'Completed').length
              return (
                <article className="team-member-card" key={getEntityId(member)}>
                  <div className="team-member-header">
                    <div className="team-card__avatar" style={{ background: avatarColor(member.name) }}>
                      {getInitials(member.name)}
                    </div>
                    <div className="team-member-info">
                      <h3>{member.name}</h3>
                      <p>{member.role || 'Team Member'}</p>
                      <span>{member.email}</span>
                    </div>
                    <div className="team-member-stats">
                      <div><strong>{memberTasks.length}</strong><small>Tasks</small></div>
                      <div><strong>{completed}</strong><small>Done</small></div>
                    </div>
                  </div>
                  <div className="team-task-section">
                    <div className="project-task-header">
                      <h4>Assigned Tasks</h4>
                      <span>{memberTasks.length}</span>
                    </div>
                    <TaskList tasks={memberTasks} />
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <EmptyState icon="👥" title="No team members found"
            description={searchQuery ? 'Try a different search term.' : 'Members will appear here.'} />
        )
      )}

      {/* ── BY TEAM ──────────────────────────────────────── */}
      {view === 'By Team' && (
        teams.length > 0 ? (
          <div className="teams-member-grid">
            {teams.map((team) => {
              const teamTasks  = getTeamTasks(team)
              const completed  = teamTasks.filter((t) => toDisplayStatus(t.status) === 'Completed').length
              const inProgress = teamTasks.filter((t) => toDisplayStatus(t.status) === 'In Progress').length
              return (
                <article className="team-member-card" key={getEntityId(team)}>
                  <div className="team-member-header">
                    <div className="team-card__avatar"
                      style={{ background: avatarColor(team.name), borderRadius: '10px', fontSize: '0.8rem' }}>
                      {getInitials(team.name)}
                    </div>
                    <div className="team-member-info">
                      <h3>{team.name}</h3>
                      <p>{team.description || 'Team'}</p>
                    </div>
                    <div className="team-member-stats">
                      <div><strong>{teamTasks.length}</strong><small>Tasks</small></div>
                      <div><strong>{completed}</strong><small>Done</small></div>
                      <div><strong>{inProgress}</strong><small>Active</small></div>
                    </div>
                  </div>
                  <div className="team-task-section">
                    <div className="project-task-header">
                      <h4>Team Tasks</h4><span>{teamTasks.length}</span>
                    </div>
                    <TaskList tasks={teamTasks} />
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <EmptyState icon="🏢" title="No teams found"
            description="Create your first team using the button above." />
        )
      )}

    </section>
  )
}

export default Teams
