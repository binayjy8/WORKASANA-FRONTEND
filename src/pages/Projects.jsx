import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaPlus, FaXmark, FaFolderOpen } from 'react-icons/fa6'
import { useWorkspaceData } from '../hooks/useWorkspaceData'
import { createProject } from '../services/api'
import { getEntityId } from '../utils/entity'

const projectBadgeClass = (status) => {
  if (status === 'Completed') return 'proj__badge--completed'
  if (status === 'Active')    return 'proj__badge--active'
  return 'proj__badge--pending'
}

const Projects = () => {
  const navigate = useNavigate()
  const { projects, filteredProjects, searchQuery, isLoading, error, addProject } = useWorkspaceData()

  const [modalOpen, setModalOpen]   = useState(false)
  const [name, setName]             = useState('')
  const [desc, setDesc]             = useState('')
  const [creating, setCreating]     = useState(false)
  const [formError, setFormError]   = useState('')

  const display = searchQuery ? filteredProjects : projects

  const total     = display.length
  const active    = display.filter((p) => p.status !== 'Completed').length
  const completed = display.filter((p) => p.status === 'Completed').length

  const closeModal = () => {
    setModalOpen(false)
    setName('')
    setDesc('')
    setFormError('')
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim()) { setFormError('Project name is required'); return }
    setCreating(true)
    setFormError('')
    try {
      const created = await createProject({ name: name.trim(), description: desc.trim() })
      addProject({ ...created, title: created.title || name.trim() })
      closeModal()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="proj">

      <div className="proj__header">
        <div>
          <h1 className="proj__title">Projects</h1>
          <p className="proj__subtitle">
            {isLoading ? 'Loading…' : error || 'Manage project progress, teams, and delivery timelines.'}
          </p>
        </div>
        <button type="button" className="proj__new-btn" onClick={() => setModalOpen(true)}>
          <FaPlus />
          <span>New Project</span>
        </button>
      </div>

      <div className="proj__stats">
        <div className="proj__stat">
          <span className="proj__stat-label">Total Projects</span>
          <strong className="proj__stat-value">{total}</strong>
        </div>
        <div className="proj__stat">
          <span className="proj__stat-label">Active</span>
          <strong className="proj__stat-value proj__stat-value--green">{active}</strong>
        </div>
        <div className="proj__stat">
          <span className="proj__stat-label">Completed</span>
          <strong className="proj__stat-value proj__stat-value--purple">{completed}</strong>
        </div>
      </div>

      {isLoading ? (
        <div className="proj__empty">Loading projects…</div>
      ) : display.length === 0 ? (
        <div className="proj__empty">
          <FaFolderOpen style={{ fontSize: 32, marginBottom: 10, opacity: 0.3 }} />
          <p>{searchQuery ? 'No projects match your search.' : 'No projects yet. Create your first one!'}</p>
        </div>
      ) : (
        <div className="proj__grid">
          {display.map((project) => (
            <div
              key={getEntityId(project)}
              className="proj__card"
              onClick={() => navigate(`/projects/${getEntityId(project)}`)}
            >
              <div className="proj__card-top">
                <p className="proj__card-name">{project.title || project.name}</p>
                <span className={`proj__badge ${projectBadgeClass(project.status)}`}>
                  {project.status || 'Pending'}
                </span>
              </div>
              <p className="proj__card-desc">{project.description || 'No description'}</p>
              <div className="proj__card-footer">
                <span className="proj__card-meta">Click to view tasks</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="proj__modal-backdrop" onClick={closeModal}>
          <div className="proj__modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="proj__modal-header">
              <div>
                <h2 className="proj__modal-title">Create New Project</h2>
                <p className="proj__modal-sub">Add a new project to your workspace</p>
              </div>
              <button type="button" className="proj__modal-close" onClick={closeModal}>
                <FaXmark />
              </button>
            </div>

            <form onSubmit={handleCreate} className="proj__form">
              <div className="proj__field">
                <label className="proj__label">Project Name *</label>
                <input
                  className="proj__input"
                  type="text"
                  placeholder="Enter project name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="proj__field">
                <label className="proj__label">Description</label>
                <textarea
                  className="proj__input proj__textarea"
                  placeholder="Describe the project goal or scope"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={3}
                />
              </div>
              {formError && <p className="proj__form-error">{formError}</p>}
              <div className="proj__form-actions">
                <button type="submit" className="proj__submit-btn" disabled={creating}>
                  {creating ? 'Creating…' : 'Create Project'}
                </button>
                <button type="button" className="proj__cancel-btn" onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default Projects
