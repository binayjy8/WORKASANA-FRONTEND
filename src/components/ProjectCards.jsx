import { Link } from 'react-router-dom'

import { getEntityId } from '../utils/entity'

const ProjectCard = ({ project }) => {

  const projectId =
    getEntityId(project)

  return (

    <Link
      to={`/projects/${projectId}`}
      className="project-card"
    >

      <div className="project-card-top">

        <span className="project-card-label">
          PROJECT
        </span>

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


      <div className="project-card-content">

        <h3>
          {project.title}
        </h3>

        <p>
          {project.description ||
            'No description available.'}
        </p>

      </div>


      <div className="project-card-footer">

        <span>
          View Details
        </span>

        <span>
          →
        </span>

      </div>

    </Link>

  )
}

export default ProjectCard