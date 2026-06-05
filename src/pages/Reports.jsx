import { useEffect, useRef } from 'react'
import { useWorkspaceData } from '../hooks/useWorkspaceData'
import { getTaskProjectName, getTaskTeamName, toDisplayStatus } from '../utils/taskUtils'

// FIX 1: import and register EVERYTHING from chart.js
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899']

// FIX 2: bulletproof ChartCanvas — always destroys before recreating
const ChartCanvas = ({ type, data, options }) => {
  const canvasRef = useRef(null)
  const chartRef  = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Always destroy existing chart first (fixes StrictMode double-invoke)
    if (chartRef.current) {
      chartRef.current.destroy()
      chartRef.current = null
    }

    // Small timeout so canvas is fully unmounted before re-creating
    const timer = setTimeout(() => {
      if (!canvasRef.current) return
      try {
        chartRef.current = new Chart(canvasRef.current, {
          type,
          data,
          options,
        })
      } catch (e) {
        console.error('Chart error:', e)
      }
    }, 0)

    return () => {
      clearTimeout(timer)
      if (chartRef.current) {
        chartRef.current.destroy()
        chartRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(data)])

  return <canvas ref={canvasRef} />
}

const barOptions = (title) => ({
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: { display: false },
    title: {
      display: true,
      text: title,
      font: { size: 13, weight: '600' },
      padding: { bottom: 12 },
    },
  },
  scales: {
    y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } },
  },
})

const pieOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { padding: 16, font: { size: 12 } },
    },
    title: {
      display: true,
      text: 'Task Status Breakdown',
      font: { size: 13, weight: '600' },
      padding: { bottom: 12 },
    },
  },
}

const Reports = () => {
  const { filteredTasks, isLoading, error } = useWorkspaceData()
  const tasks = filteredTasks

  // ── Stats ─────────────────────────────────────────────
  const totalTasks      = tasks.length
  const completedTasks  = tasks.filter((t) => toDisplayStatus(t.status) === 'Completed').length
  const inProgressTasks = tasks.filter((t) => toDisplayStatus(t.status) === 'In Progress').length
  const toDoTasks       = tasks.filter((t) => toDisplayStatus(t.status) === 'To Do').length
  const blockedTasks    = tasks.filter((t) => toDisplayStatus(t.status) === 'Blocked').length
  const completionRate  = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const pendingDays = tasks
    .filter((t) => toDisplayStatus(t.status) !== 'Completed')
    .reduce((sum, t) => sum + (Number(t.timeToComplete) || 0), 0)

  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const lastWeekCompleted = tasks.filter((t) => {
    if (toDisplayStatus(t.status) !== 'Completed') return false
    const updated = t.updatedAt ? new Date(t.updatedAt) : null
    return updated && updated >= oneWeekAgo
  }).length

  // ── Aggregations ──────────────────────────────────────
  const teamCounts = {}
  tasks
    .filter((t) => toDisplayStatus(t.status) === 'Completed')
    .forEach((t) => {
      const team = getTaskTeamName(t) || 'Unknown'
      teamCounts[team] = (teamCounts[team] || 0) + 1
    })

  const ownerCounts = {}
  tasks
    .filter((t) => toDisplayStatus(t.status) === 'Completed')
    .forEach((t) => {
      const owner = t.assignee || 'Unassigned'
      ownerCounts[owner] = (ownerCounts[owner] || 0) + 1
    })

  const projectCounts = {}
  tasks
    .filter((t) => toDisplayStatus(t.status) === 'Completed')
    .forEach((t) => {
      const proj = getTaskProjectName(t) || 'Unknown'
      projectCounts[proj] = (projectCounts[proj] || 0) + 1
    })

  const pendingTasks = tasks
    .filter((t) => toDisplayStatus(t.status) !== 'Completed')
    .slice(0, 8)

  // ── Chart data ────────────────────────────────────────
  const statusChartData = {
    labels: ['Completed', 'In Progress', 'To Do', 'Blocked'],
    datasets: [{
      data: [completedTasks, inProgressTasks, toDoTasks, blockedTasks],
      backgroundColor: ['#10b981', '#6366f1', '#f59e0b', '#ef4444'],
      borderWidth: 2,
      borderColor: '#fff',
    }],
  }

  const teamChartData = {
    labels: Object.keys(teamCounts).length ? Object.keys(teamCounts) : ['No Data'],
    datasets: [{
      label: 'Tasks Closed',
      data: Object.keys(teamCounts).length ? Object.values(teamCounts) : [0],
      backgroundColor: COLORS,
      borderRadius: 6,
    }],
  }

  const ownerChartData = {
    labels: Object.keys(ownerCounts).length ? Object.keys(ownerCounts) : ['No Data'],
    datasets: [{
      label: 'Tasks Closed',
      data: Object.keys(ownerCounts).length ? Object.values(ownerCounts) : [0],
      backgroundColor: '#8b5cf6',
      borderRadius: 6,
    }],
  }

  const projectChartData = {
    labels: Object.keys(projectCounts).length ? Object.keys(projectCounts) : ['No Data'],
    datasets: [{
      label: 'Tasks Closed',
      data: Object.keys(projectCounts).length ? Object.values(projectCounts) : [0],
      backgroundColor: '#f59e0b',
      borderRadius: 6,
    }],
  }

  const pendingChartData = {
    labels: pendingTasks.length
      ? pendingTasks.map((t) => t.title || t.name || 'Task')
      : ['No Data'],
    datasets: [{
      label: 'Days to Complete',
      data: pendingTasks.length
        ? pendingTasks.map((t) => Number(t.timeToComplete) || 0)
        : [0],
      backgroundColor: '#ef4444',
      borderRadius: 6,
    }],
  }

  if (isLoading) {
    return (
      <section className="page-section">
        <div className="page-header">
          <h1>Reports</h1>
          <p>Loading reports…</p>
        </div>
      </section>
    )
  }

  return (
    <section className="page-section">

      {/* HEADER */}
      <div className="page-header">
        <h1>Reports</h1>
        <p>{error || 'Track workspace productivity and project performance.'}</p>
      </div>

      {/* STATS */}
      <div className="report-stats-grid">
        <article className="report-stat-card">
          <span>Completion Rate</span>
          <strong>{completionRate}%</strong>
          <div className="report-progress-bar">
            <div className="report-progress-fill" style={{ width: `${completionRate}%` }} />
          </div>
        </article>
        <article className="report-stat-card">
          <span>Total Tasks</span>
          <strong>{totalTasks}</strong>
        </article>
        <article className="report-stat-card report-stat-card--green">
          <span>Completed</span>
          <strong>{completedTasks}</strong>
        </article>
        <article className="report-stat-card report-stat-card--purple">
          <span>In Progress</span>
          <strong>{inProgressTasks}</strong>
        </article>
        <article className="report-stat-card report-stat-card--yellow">
          <span>Pending Days</span>
          <strong>{pendingDays}</strong>
        </article>
        <article className="report-stat-card report-stat-card--red">
          <span>Completed This Week</span>
          <strong>{lastWeekCompleted}</strong>
        </article>
      </div>

      {/* CHARTS ROW 1 */}
      <div className="report-charts-grid">
        <div className="dashboard-card report-chart-card">
          <ChartCanvas type="pie" data={statusChartData} options={pieOptions} />
        </div>
        <div className="dashboard-card report-chart-card">
          <ChartCanvas type="bar" data={teamChartData} options={barOptions('Tasks Closed by Team')} />
        </div>
      </div>

      {/* CHARTS ROW 2 */}
      <div className="report-charts-grid">
        <div className="dashboard-card report-chart-card">
          <ChartCanvas type="bar" data={ownerChartData} options={barOptions('Tasks Closed by Owner')} />
        </div>
        <div className="dashboard-card report-chart-card">
          <ChartCanvas type="bar" data={projectChartData} options={barOptions('Tasks Closed by Project')} />
        </div>
      </div>

      {/* PENDING CHART */}
      <div className="dashboard-card report-chart-card report-chart-card--full">
        <ChartCanvas
          type="bar"
          data={pendingChartData}
          options={barOptions('Pending Work (Days per Task)')}
        />
      </div>

    </section>
  )
}

export default Reports
