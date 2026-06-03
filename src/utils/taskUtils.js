import { getEntityId, isSameEntityId } from './entity'

export const taskStatusOptions = ['To Do', 'In Progress', 'Completed', 'Blocked']

export const toDisplayStatus = (status) => {
  return status === 'Pending' ? 'To Do' : status || 'To Do'
}

export const toApiStatus = (status) => {
  return status === 'To Do' ? 'Pending' : status
}

export const getTaskProjectName = (task) => {
  return task.project?.title || task.project?.name || task.project || ''
}

export const getTaskTeamName = (task) => {
  return task.team?.title || task.team?.name || task.team || ''
}

export const getTaskTags = (task) => {
  if (Array.isArray(task.tags)) {
    return task.tags
  }

  return String(task.tags || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

export const taskBelongsToProject = (task, project) => {
  const projectId = getEntityId(project)

  return (
    task.project === project?.title ||
    task.project?.title === project?.title ||
    task.project?.name === project?.title ||
    isSameEntityId(task.project, projectId) ||
    isSameEntityId(getEntityId(task.project), projectId) ||
    isSameEntityId(task.projectId, projectId)
  )
}

export const filterTasksByParams = (tasks, params) => {
  const owner = params.get('owner')?.toLowerCase()
  const team = params.get('team')?.toLowerCase()
  const tags = params.get('tags')?.toLowerCase()
  const project = params.get('project')?.toLowerCase()
  const status = params.get('status')?.toLowerCase()

  return tasks.filter((task) => {
    const taskTags = getTaskTags(task).join(',').toLowerCase()

    return (
      (!owner || String(task.assignee || '').toLowerCase().includes(owner)) &&
      (!team || getTaskTeamName(task).toLowerCase().includes(team)) &&
      (!tags || taskTags.includes(tags)) &&
      (!project || getTaskProjectName(task).toLowerCase().includes(project)) &&
      (!status || toDisplayStatus(task.status).toLowerCase() === status)
    )
  })
}

export const sortTasks = (tasks, sortBy) => {
  const nextTasks = [...tasks]

  if (sortBy === 'dueDate') {
    return nextTasks.sort((left, right) =>
      String(left.dueDate || '').localeCompare(String(right.dueDate || '')),
    )
  }

  if (sortBy === 'priority') {
    const priorityOrder = {
      High: 1,
      Medium: 2,
      Low: 3,
    }

    return nextTasks.sort(
      (left, right) =>
        (priorityOrder[left.priority] || 4) - (priorityOrder[right.priority] || 4),
    )
  }

  return nextTasks
}
