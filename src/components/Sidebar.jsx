import {
  FaChartLine,
  FaClipboardList,
  FaFolderOpen,
  FaGear,
  FaRegCircleQuestion,
  FaTableColumns,
  FaUsers,
} from 'react-icons/fa6'
import { NavLink } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', icon: FaTableColumns,  path: '/dashboard' },
  { label: 'Projects',  icon: FaFolderOpen,    path: '/projects'  },
  { label: 'Tasks',     icon: FaClipboardList, path: '/tasks'     },
  { label: 'Teams',     icon: FaUsers,         path: '/teams'     },
  { label: 'Reports',   icon: FaChartLine,     path: '/reports'   },
  { label: 'Settings',  icon: FaGear,          path: '/settings'  },
]

const Sidebar = () => {
  return (
    <aside className="sidebar">

      {/* BRAND */}
      <div className="sidebar__brand">
        <div className="sidebar__logo">WA</div>
        <div className="sidebar__brand-text">
          <p className="sidebar__brand-name">Workasana</p>
          <small className="sidebar__brand-tagline">Project OS</small>
        </div>
      </div>

      {/* NAV */}
      <nav className="sidebar__nav" aria-label="Main navigation">
        {navItems.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={label}
            to={path}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
          >
            <Icon className="sidebar__link-icon" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* SUPPORT */}
      <div className="sidebar__support">
        <FaRegCircleQuestion className="sidebar__support-icon" />
        <div>
          <strong>Need help?</strong>
          <span>Check docs</span>
        </div>
      </div>

    </aside>
  )
}

export default Sidebar
