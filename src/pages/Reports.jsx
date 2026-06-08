import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa6'
import { Chart, registerables } from 'chart.js'
import { useWorkspaceData } from '../hooks/useWorkspaceData'
import { toDisplayStatus, getTaskProjectName, getTaskTeamName } from '../utils/taskUtils'

Chart.register(...registerables)

const ChartCanvas = ({ type, data, options }) => {
  const canvasRef = useRef(null)
  const chartRef  = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null }
    const timer = setTimeout(() => {
      if (!canvasRef.current) return
      try { chartRef.current = new Chart(canvasRef.current, { type, data, options }) }
      catch (e) { console.error(e) }
    }, 0)
    return () => {
      clearTimeout(timer)
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(data)])

  return <canvas ref={canvasRef} />
}

const COLORS = ['#534ab7','#10b981','#f59e0b','#ef4444','#8b5cf6','#3b82f6','#ec4899','#14b8a6']

const barOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#888' } },
    y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0, font: { size: 11 }, color: '#888' }, grid: { color: 'rgba(0,0,0,0.05)' } },
  },
  elements: { bar: { borderRadius: 5 } },
}

const Reports = () => {
  const navigate = useNavigate()
  const { tasks, isLoading } = useWorkspaceData()

  const completed  = tasks.filter((t) => toDisplayStatus(t.status) === 'Completed')
  const pending    = tasks.filter((t) => toDisplayStatus(t.status) !== 'Completed')
  const inProgress = tasks.filter((t) => toDisplayStatus(t.status) === 'In Progress')
  const blocked    = tasks.filter((t) => toDisplayStatus(t.status) === 'Blocked')
  const total      = tasks.length
  const rate       = total > 0 ? Math.round((completed.length / total) * 100) : 0
  const pendingDays = pending.reduce((s, t) => s + (Number(t.timeToComplete) || 0), 0)

  const teamCounts = {}
  completed.forEach((t) => {
    const name = getTaskTeamName(t) || 'Unknown'
    teamCounts[name] = (teamCounts[name] || 0) + 1
  })

  const ownerCounts = {}
  completed.forEach((t) => {
    const name = t.assignee || 'Unassigned'
    ownerCounts[name] = (ownerCounts[name] || 0) + 1
  })

  const pendingTasks = pending.slice(0, 8)

  const workDoneData = {
    labels: Object.keys(teamCounts).length ? Object.keys(teamCounts) : ['No data'],
    datasets: [{ data: Object.keys(teamCounts).length ? Object.values(teamCounts) : [0],
      backgroundColor: COLORS, borderRadius: 5 }],
  }

  const pendingData = {
    labels: pendingTasks.length ? pendingTasks.map((t) => (t.title || t.name || 'Task').slice(0, 20)) : ['No data'],
    datasets: [{ data: pendingTasks.length ? pendingTasks.map((t) => Number(t.timeToComplete) || 0) : [0],
      backgroundColor: '#f59e0b', borderRadius: 5 }],
  }

  const teamData = {
    labels: Object.keys(teamCounts).length ? Object.keys(teamCounts) : ['No data'],
    datasets: [{ data: Object.keys(teamCounts).length ? Object.values(teamCounts) : [0],
      backgroundColor: COLORS, borderRadius: 5 }],
  }

  const ownerData = {
    labels: Object.keys(ownerCounts).length ? Object.keys(ownerCounts) : ['No data'],
    datasets: [{ data: Object.keys(ownerCounts).length ? Object.values(ownerCounts) : [0],
      backgroundColor: '#8b5cf6', borderRadius: 5 }],
  }

  if (isLoading) return <div className="rp__empty">Loading reports…</div>

  return (
    <div className="rp">

      <button type="button" className="rp__back" onClick={() => navigate('/dashboard')}>
        <FaArrowLeft /><span>Back to Dashboard</span>
      </button>

      <div className="rp__page-header">
        <h1 className="rp__title">Workasana Reports</h1>
        <p className="rp__subtitle">Track workspace productivity and project performance.</p>
      </div>

      <div className="rp__overview">

        <div className="rp__overview-stats">
          <div className="rp__stat">
            <span className="rp__stat-label">Completion Rate</span>
            <strong className="rp__stat-value">{rate}%</strong>
            <div className="rp__progress"><div className="rp__progress-fill" style={{ width: `${rate}%` }} /></div>
          </div>
          <div className="rp__stat">
            <span className="rp__stat-label">Total Tasks</span>
            <strong className="rp__stat-value">{total}</strong>
          </div>
          <div className="rp__stat rp__stat--green">
            <span className="rp__stat-label">Completed</span>
            <strong className="rp__stat-value">{completed.length}</strong>
          </div>
          <div className="rp__stat rp__stat--purple">
            <span className="rp__stat-label">In Progress</span>
            <strong className="rp__stat-value">{inProgress.length}</strong>
          </div>
          <div className="rp__stat rp__stat--yellow">
            <span className="rp__stat-label">Pending Days</span>
            <strong className="rp__stat-value">{pendingDays}</strong>
          </div>
          <div className="rp__stat rp__stat--red">
            <span className="rp__stat-label">Blocked</span>
            <strong className="rp__stat-value">{blocked.length}</strong>
          </div>
        </div>

        <div className="rp__charts">

          <div className="rp__chart-section">
            <p className="rp__chart-label">Total Work Done Last Week</p>
            <div className="rp__chart-wrap">
              <ChartCanvas type="bar" data={workDoneData} options={barOpts} />
            </div>
          </div>

          <div className="rp__divider" />

          <div className="rp__chart-section">
            <p className="rp__chart-label">Total Days of Work Pending</p>
            <div className="rp__chart-wrap">
              <ChartCanvas type="bar" data={pendingData} options={barOpts} />
            </div>
          </div>

          <div className="rp__divider" />

          <div className="rp__chart-section">
            <p className="rp__chart-label">Tasks Closed by Team</p>
            <div className="rp__chart-wrap">
              <ChartCanvas type="bar" data={teamData} options={barOpts} />
            </div>
          </div>

          <div className="rp__divider" />

          <div className="rp__chart-section">
            <p className="rp__chart-label">Tasks Closed by Owner</p>
            <div className="rp__chart-wrap">
              <ChartCanvas type="bar" data={ownerData} options={barOpts} />
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}

export default Reports
