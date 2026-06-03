import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'

import { WorkspaceDataProvider } from '../hooks/useWorkspaceData'

const MainLayout = ({ children }) => {

  return (

    <WorkspaceDataProvider>

      <div className="app-layout">

        <Sidebar />

        <div className="app-main">

          <Navbar />

          <main className="app-content">

            {children}

          </main>

        </div>

      </div>

    </WorkspaceDataProvider>

  )
}

export default MainLayout
