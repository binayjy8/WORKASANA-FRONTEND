import { useWorkspaceData } from '../hooks/useWorkspaceData'

import {
  getTaskProjectName,
  getTaskTeamName,
  toDisplayStatus,
} from '../utils/taskUtils'

const Reports = () => {

  const {
    filteredTasks,
    isLoading,
    error,
  } = useWorkspaceData()

  const tasks = filteredTasks

  const totalTasks =
    tasks.length

  const completedTasks =
    tasks.filter(
      (task) =>
        toDisplayStatus(task.status) === 'Completed'
    ).length

  const inProgressTasks =
    tasks.filter(
      (task) =>
        toDisplayStatus(task.status) === 'In Progress'
    ).length

  const completionRate =
    totalTasks > 0
      ? Math.round(
          (completedTasks / totalTasks) * 100
        )
      : 0

  const pendingDays =
    tasks
      .filter(
        (task) =>
          toDisplayStatus(task.status) !== 'Completed'
      )
      .reduce(
        (sum, task) =>
          sum + (Number(task.timeToComplete) || 0),
        0
      )

  const closedByTeam =
    new Set(
      tasks
        .filter(
          (task) =>
            toDisplayStatus(task.status) === 'Completed'
        )
        .map(getTaskTeamName)
        .filter(Boolean)
    ).size

  const closedByOwner =
    new Set(
      tasks
        .filter(
          (task) =>
            toDisplayStatus(task.status) === 'Completed'
        )
        .map((task) => task.assignee)
        .filter(Boolean)
    ).size

  const closedByProject =
    new Set(
      tasks
        .filter(
          (task) =>
            toDisplayStatus(task.status) === 'Completed'
        )
        .map(getTaskProjectName)
        .filter(Boolean)
    ).size


  return (

    <section className="page-section">

      <div className="page-header">

        <h1>
          Reports
        </h1>

        <p>
          {isLoading
            ? 'Loading reports...'
            : error ||
              'Track workspace productivity and project performance.'}
        </p>

      </div>


      {/* TOP STATS */}

      <div className="report-grid">

        <article className="dashboard-card report-card">

          <span>
            Completion Rate
          </span>

          <strong>
            {completionRate}%
          </strong>

        </article>


        <article className="dashboard-card report-card">

          <span>
            Total Tasks
          </span>

          <strong>
            {totalTasks}
          </strong>

        </article>


        <article className="dashboard-card report-card">

          <span>
            Pending Days
          </span>

          <strong>
            {pendingDays}
          </strong>

        </article>

      </div>


      {/* ANALYTICS */}

      <div className="report-grid">

        <article className="dashboard-card report-card">

          <span>
            Completed Tasks
          </span>

          <strong>
            {completedTasks}
          </strong>

        </article>


        <article className="dashboard-card report-card">

          <span>
            In Progress
          </span>

          <strong>
            {inProgressTasks}
          </strong>

        </article>


        <article className="dashboard-card report-card">

          <span>
            Closed By Team
          </span>

          <strong>
            {closedByTeam}
          </strong>

        </article>

      </div>


      {/* EXTRA STATS */}

      <div className="report-grid">

        <article className="dashboard-card report-card">

          <span>
            Closed By Owner
          </span>

          <strong>
            {closedByOwner}
          </strong>

        </article>


        <article className="dashboard-card report-card">

          <span>
            Closed By Project
          </span>

          <strong>
            {closedByProject}
          </strong>

        </article>

      </div>

    </section>

  )
}

export default Reports