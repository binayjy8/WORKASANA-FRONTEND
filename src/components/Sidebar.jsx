import {
  FaChartLine,
  FaClipboardList,
  FaFolderOpen,
  FaRegCircleQuestion,
  FaTableColumns,
  FaUsers,
} from 'react-icons/fa6'
import { NavLink } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', icon: FaTableColumns, path: '/dashboard' },
  { label: 'Projects', icon: FaFolderOpen, path: '/projects' },
  { label: 'Tasks', icon: FaClipboardList, path: '/tasks' },
  { label: 'Teams', icon: FaUsers, path: '/teams' },
  { label: 'Reports', icon: FaChartLine, path: '/reports' },
]

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__logo">WA</span>
        <div>
          <p>Workasana</p>
          <small>Project OS</small>
        </div>
      </div>

      <nav className="sidebar__nav" aria-label="Main navigation">
        {navItems.map(({ label, icon: Icon, path }) => (
          <NavLink
            to={path}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
            key={label}
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__support">
        <FaRegCircleQuestion />
        <div>
          <strong>Need help?</strong>
          <span>Check docs</span>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
