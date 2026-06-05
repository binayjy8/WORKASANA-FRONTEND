import { useRef, useState, useEffect } from 'react'
import {
  FaBars,
  FaChevronDown,
  FaMagnifyingGlass,
  FaPlus,
  FaRightFromBracket,
  FaUser,
} from 'react-icons/fa6'
import { useLocation, useNavigate } from 'react-router-dom'
import { useWorkspaceData } from '../hooks/useWorkspaceData'

const pageTitles = {
  '/dashboard': { title: 'Dashboard',      description: 'Track work, teams, and delivery in one place.' },
  '/projects':  { title: 'Projects',       description: 'Manage project progress, status, and ownership.' },
  '/tasks':     { title: 'Tasks',          description: 'Organize work by status, due date, and priority.' },
  '/teams':     { title: 'Teams',          description: 'View workspace members and project ownership.' },
  '/reports':   { title: 'Reports',        description: 'Review project health and task completion.' },
  '/settings':  { title: 'Settings',       description: 'Manage your account and workspace preferences.' },
}

const Navbar = ({ onMenuClick }) => {
  const { pathname }                  = useLocation()
  const navigate                      = useNavigate()
  const { searchQuery, setSearchQuery } = useWorkspaceData()
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef                    = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const page = pathname.startsWith('/projects/')
    ? { title: 'Project Details', description: 'Review project information, team, and related tasks.' }
    : pathname.startsWith('/tasks/')
    ? { title: 'Task Details',    description: 'Review and manage task details.' }
    : pageTitles[pathname] || pageTitles['/dashboard']

  return (
    <header className="navbar">

      {/* HAMBURGER — mobile only */}
      {onMenuClick && (
        <button type="button" className="navbar__hamburger" onClick={onMenuClick} aria-label="Toggle menu">
          <FaBars />
        </button>
      )}

      {/* PAGE TITLE */}
      <div className="navbar__title">
        <h2>{page.title}</h2>
        <p>{page.description}</p>
      </div>

      {/* ACTIONS */}
      <div className="navbar__actions">

        {/* SEARCH */}
        <label className="navbar__search">
          <FaMagnifyingGlass className="navbar__search-icon" />
          <input
            type="search"
            placeholder="Search tasks, projects…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="navbar__search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </label>

        {/* NEW TASK — navigates to tasks page */}
        <button type="button" className="navbar__button" onClick={() => navigate('/tasks')}>
          <FaPlus />
          <span>New Task</span>
        </button>

        {/* PROFILE DROPDOWN */}
        <div className="navbar__profile-wrapper" ref={profileRef}>
          <button
            type="button"
            className="navbar__profile"
            onClick={() => setProfileOpen((prev) => !prev)}
            aria-expanded={profileOpen}
          >
            <span className="navbar__avatar">M</span>
            <span className="navbar__profile-name">Mohan</span>
            <FaChevronDown className={`navbar__chevron ${profileOpen ? 'navbar__chevron--open' : ''}`} />
          </button>

          {profileOpen && (
            <div className="navbar__dropdown">
              <div className="navbar__dropdown-header">
                <span className="navbar__avatar navbar__avatar--lg">M</span>
                <div>
                  <strong>Mohan</strong>
                  <small>Workspace member</small>
                </div>
              </div>
              <hr className="navbar__dropdown-divider" />
              <button type="button" className="navbar__dropdown-item"
                onClick={() => { setProfileOpen(false); navigate('/settings') }}>
                <FaUser /><span>Settings</span>
              </button>
              <button type="button" className="navbar__dropdown-item navbar__dropdown-item--danger"
                onClick={handleLogout}>
                <FaRightFromBracket /><span>Logout</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  )
}

export default Navbar
