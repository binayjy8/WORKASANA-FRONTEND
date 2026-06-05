import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import { WorkspaceDataProvider } from '../hooks/useWorkspaceData'

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // Close sidebar on outside click (mobile)
  const handleBackdropClick = () => setSidebarOpen(false)

  return (
    <WorkspaceDataProvider>
      <div className="app-layout">

        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="sidebar-backdrop"
            onClick={handleBackdropClick}
            aria-hidden="true"
          />
        )}

        {/* Sidebar — gets open class on mobile */}
        <div className={sidebarOpen ? 'sidebar--open' : ''}>
          <Sidebar />
        </div>

        <div className="app-main">
          <Navbar onMenuClick={() => setSidebarOpen((prev) => !prev)} />

          <main className="app-content">
            {children}
          </main>
        </div>

      </div>
    </WorkspaceDataProvider>
  )
}

export default MainLayout
