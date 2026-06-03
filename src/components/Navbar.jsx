import {
  FaBell,
  FaChevronDown,
  FaMagnifyingGlass,
  FaPlus,
  FaRightFromBracket,
} from 'react-icons/fa6'

import { useLocation, useNavigate } from 'react-router-dom'

import { useWorkspaceData } from '../hooks/useWorkspaceData'

const pageTitles = {
  '/dashboard': {
    title: 'Dashboard',
    description: 'Track work, teams, and delivery in one place.',
  },

  '/projects': {
    title: 'Projects',
    description: 'Manage project progress, status, and ownership.',
  },

  '/tasks': {
    title: 'Tasks',
    description: 'Organize work by status, due date, and priority.',
  },

  '/teams': {
    title: 'Teams',
    description: 'View workspace members and project ownership.',
  },

  '/reports': {
    title: 'Reports',
    description: 'Review project health and task completion.',
  },
}

const Navbar = () => {

  const { pathname } = useLocation()

  const navigate = useNavigate()

  const {
    searchQuery,
    setSearchQuery,
  } = useWorkspaceData()


  const handleLogout = () => {

    localStorage.removeItem('token')

    navigate('/login')
  }


  const page = pathname.startsWith('/projects/')
    ? {
        title: 'Project Details',
        description:
          'Review project information, team, and related tasks.',
      }
    : pageTitles[pathname] || pageTitles['/dashboard']


  return (
    <header className="navbar">

      <div className="navbar__title">
        <h2>{page.title}</h2>
        <p>{page.description}</p>
      </div>


      <div className="navbar__actions">

        <label className="navbar__search">

          <FaMagnifyingGlass />

          <input
            type="search"
            placeholder="Search tasks, projects..."
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(event.target.value)
            }
          />

        </label>


        <button
          type="button"
          className="navbar__button"
          onClick={() => navigate('/tasks')}
        >
          <FaPlus />
          <span>New Task</span>
        </button>


        <button
          type="button"
          className="navbar__icon"
        >
          <FaBell />
        </button>


        <button
          type="button"
          className="navbar__profile"
        >
          <span className="navbar__avatar">
            M
          </span>

          <span className="navbar__profileText">
            Mohan
          </span>

          <FaChevronDown />
        </button>


        <button
          type="button"
          className="navbar__logout"
          onClick={handleLogout}
        >
          <FaRightFromBracket />
          <span>Logout</span>
        </button>

      </div>

    </header>
  )
}

export default Navbar