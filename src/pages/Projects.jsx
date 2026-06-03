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


  const [isModalOpen, setIsModalOpen] =
    useState(false)

  const [projectName, setProjectName] =
    useState('')

  const [projectDescription, setProjectDescription] =
    useState('')

  const [isCreating, setIsCreating] =
    useState(false)


  const handleCreateProject = async (
    event
  ) => {

    event.preventDefault()

    if (!projectName.trim()) {
      alert('Please enter project name')
      return
    }

    try {

      setIsCreating(true)

      const createdProject =
        await createProject({
          name: projectName,
          description: projectDescription,
        })

      addProject({
        ...createdProject,
        title:
          createdProject.title ||
          projectName,
      })

      setProjectName('')
      setProjectDescription('')

      setIsModalOpen(false)

      alert(
        'Project created successfully'
      )

    } catch (error) {

      console.log(error)

      alert(
        error.response?.data?.message ||
        'Failed to create project'
      )

    } finally {

      setIsCreating(false)

    }
  }


  return (

    <section className="page-section">

      <div className="project-page-header">

        <div>

          <span className="project-label">
            WORKSPACE
          </span>

          <h1>
            Projects
          </h1>

          <p>
            {isLoading
              ? 'Loading projects...'
              : error ||
                'Manage project progress, teams, and delivery timelines.'}
          </p>

        </div>

        <button
          type="button"
          className="project-add-btn"
          onClick={() =>
            setIsModalOpen(true)
          }
        >
          + New Project
        </button>

      </div>


      {/* MODAL */}

      {isModalOpen && (

        <div className="modal-backdrop">

          <form
            className="project-modal"
            onSubmit={handleCreateProject}
          >

            <h2>
              Create New Project
            </h2>

            <p>
              Add a new workspace project
            </p>


            <label>

              Project Name

              <input
                type="text"
                placeholder="Enter project name"
                value={projectName}
                onChange={(e) =>
                  setProjectName(e.target.value)
                }
              />

            </label>


            <label>

              Description

              <textarea
                placeholder="Enter project description"
                value={projectDescription}
                onChange={(e) =>
                  setProjectDescription(
                    e.target.value
                  )
                }
              />

            </label>


            <div className="project-modal-actions">

              <button
                type="submit"
                className="project-submit-btn"
                disabled={isCreating}
              >
                {
                  isCreating
                    ? 'Creating...'
                    : 'Create Project'
                }
              </button>

              <button
                type="button"
                className="project-cancel-btn"
                onClick={() =>
                  setIsModalOpen(false)
                }
              >
                Cancel
              </button>

            </div>

          </form>

        </div>

      )}


      <div className="projects-stats">

        <article className="dashboard-card">

          <span>
            Total Projects
          </span>

          <strong>
            {filteredProjects.length}
          </strong>

        </article>

        <article className="dashboard-card">

          <span>
            Active Projects
          </span>

          <strong>
            {
              filteredProjects.filter(
                (project) =>
                  project.status !== 'Completed'
              ).length
            }
          </strong>

        </article>

        <article className="dashboard-card">

          <span>
            Completed
          </span>

          <strong>
            {
              filteredProjects.filter(
                (project) =>
                  project.status === 'Completed'
              ).length
            }
          </strong>

        </article>

      </div>


      <div className="projects-grid">

        {filteredProjects.length > 0 ? (

          filteredProjects.map((project) => (

            <ProjectCard
              project={project}
              key={getEntityId(project)}
            />

          ))

        ) : (

          <EmptyState
            title="No projects found"
            description={
              searchQuery
                ? 'Try another search term.'
                : 'Projects will appear here.'
            }
          />

        )}

      </div>

    </section>

  )
}

export default Projects