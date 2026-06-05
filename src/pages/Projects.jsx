import { useState } from 'react'
import EmptyState from '../components/EmptyState'
import ProjectCard from '../components/ProjectCards'
import { useWorkspaceData } from '../hooks/useWorkspaceData'
import { getEntityId } from '../utils/entity'
import { createProject } from '../services/api'

const Projects = () => {
  const {
    filteredProjects,
    searchQuery,
    isLoading,
    error,
    addProject,
  } = useWorkspaceData()

  const [isModalOpen, setIsModalOpen]           = useState(false)
  const [projectName, setProjectName]           = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [isCreating, setIsCreating]             = useState(false)

  const closeModal = () => {
    setIsModalOpen(false)
    setProjectName('')
    setProjectDescription('')
  }

  const handleCreateProject = async (event) => {
    event.preventDefault()
    if (!projectName.trim()) {
      alert('Please enter a project name')
      return
    }

    try {
      setIsCreating(true)
      const created = await createProject({
        name: projectName.trim(),
        description: projectDescription.trim(),
      })
      addProject({ ...created, title: created.title || projectName.trim() })
      closeModal()
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.message || 'Failed to create project')
    } finally {
      setIsCreating(false)
    }
  }

  const totalProjects   = filteredProjects.length
  const activeProjects  = filteredProjects.filter((p) => p.status !== 'Completed').length
  const completedProjects = filteredProjects.filter((p) => p.status === 'Completed').length

  return (
    <section className="page-section">

      {/* HEADER */}
      <div className="project-page-header">
        <div>
          <span className="project-label">WORKSPACE</span>
          <h1>Projects</h1>
          <p>
            {isLoading
              ? 'Loading projects…'
              : error || 'Manage project progress, teams, and delivery timelines.'}
          </p>
        </div>

        <button
          type="button"
          className="project-add-btn"
          onClick={() => setIsModalOpen(true)}
        >
          + New Project
        </button>
      </div>

      {/* STATS */}
      <div className="projects-stats">
        <article className="dashboard-card">
          <span>Total Projects</span>
          <strong>{totalProjects}</strong>
        </article>
        <article className="dashboard-card">
          <span>Active</span>
          <strong>{activeProjects}</strong>
        </article>
        <article className="dashboard-card">
          <span>Completed</span>
          <strong>{completedProjects}</strong>
        </article>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div
            className="project-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Create New Project"
          >
            <div className="modal-header">
              <div>
                <h2>Create New Project</h2>
                <p>Add a new project to your workspace</p>
              </div>
              <button type="button" className="modal-close-btn" onClick={closeModal}>✕</button>
            </div>

            <form className="modal-form" onSubmit={handleCreateProject}>
              <label className="modal-field">
                <span>Project Name *</span>
                <input
                  type="text"
                  placeholder="Enter project name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                  autoFocus
                />
              </label>

              <label className="modal-field">
                <span>Description</span>
                <textarea
                  placeholder="Describe the project goal or scope"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  rows={3}
                />
              </label>

              <div className="modal-actions">
                <button
                  type="submit"
                  className="project-submit-btn"
                  disabled={isCreating}
                >
                  {isCreating ? 'Creating…' : 'Create Project'}
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
        </div>
      )}

      {/* GRID */}
      <div className="projects-grid">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <ProjectCard project={project} key={getEntityId(project)} />
          ))
        ) : (
          <EmptyState
            icon="📁"
            title="No projects found"
            description={
              searchQuery
                ? 'Try a different search term.'
                : 'Create your first project to get started.'
            }
          />
        )}
      </div>

    </section>
  )
}

export default Projects
