import api from './api'
import { toDisplayStatus } from '../utils/taskUtils'

const getCollection = (data, key) => {
  if (Array.isArray(data))              return data
  if (Array.isArray(data?.[key]))       return data[key]
  if (Array.isArray(data?.data))        return data.data
  if (Array.isArray(data?.data?.[key])) return data.data[key]
  return []
}

const getItem = (data) => {
  if (data?.task) return data.task
  if (data?.data?.task) return data.data.task
  if (data?.data) return data.data
  return data
}

const normalizeTags = (tags) => {
  if (Array.isArray(tags)) {
    return tags
      .map((tag) => String(tag).trim())
      .filter(Boolean)
  }

  return String(tags || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

const getTaskDate = (task) => {
  return (
    task?.dueDate ||
    task?.deadline ||
    task?.due_date ||
    task?.due ||
    task?.completionDate ||
    ''
  )
}

const shouldTryFallbackMethod = (error) => {
  const status = error.response?.status
  return status === 404 || status === 405
}

const normalizeTask = (task) => ({
  ...task,
  title:          task?.title          || task?.name || '',
  name:           task?.name           || task?.title || '',
  status:         toDisplayStatus(task?.status),
  priority:       task?.priority       || 'Medium',
  project:        task?.project        ?? null,
  team:           task?.team           ?? null,
  owners:         Array.isArray(task?.owners) ? task.owners : [],
  tags:           normalizeTags(task?.tags),
  dueDate:        getTaskDate(task),
  deadline:       task?.deadline || getTaskDate(task),
  assignee:       task?.assignee       || '',
  timeToComplete: task?.timeToComplete ?? 0,
})

export const getTasks = async () => {
  const response = await api.get('/tasks')
  return getCollection(response.data, 'tasks').map(normalizeTask)
}

export const createTask = async (taskData) => {
  const response = await api.post('/tasks', taskData)
  return normalizeTask(getItem(response.data))
}

export const deleteTask = async (taskId) => {
  const response = await api.delete(`/tasks/${taskId}`)
  return response.data
}

export const updateTask = async (taskId, updatedData) => {
  let response

  try {
    response = await api.put(`/tasks/${taskId}`, updatedData)
  } catch (putError) {
    if (!shouldTryFallbackMethod(putError)) throw putError

    try {
      response = await api.patch(`/tasks/${taskId}`, updatedData)
    } catch (patchError) {
      if (!shouldTryFallbackMethod(patchError)) throw patchError
      response = await api.post(`/tasks/${taskId}`, updatedData)
    }
  }

  const normalized = normalizeTask(getItem(response.data))
  const nextDueDate =
    updatedData.dueDate ??
    updatedData.deadline ??
    normalized.dueDate

  return {
    ...normalized,
    tags: Array.isArray(updatedData.tags) ? updatedData.tags : normalized.tags,
    dueDate: nextDueDate,
    deadline: normalized.deadline || nextDueDate,
  }
}
