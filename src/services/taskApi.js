import api from './api'
import { toDisplayStatus } from '../utils/taskUtils'


const getCollection = (data, key) => {
  if (Array.isArray(data)) {
    return data
  }

  if (Array.isArray(data?.[key])) {
    return data[key]
  }

  if (Array.isArray(data?.data)) {
    return data.data
  }

  if (Array.isArray(data?.data?.[key])) {
    return data.data[key]
  }

  return []
}


const getItem = (data, key) => {
  return data?.[key] || data?.data?.[key] || data?.data || data
}


const normalizeTask = (task) => ({
  ...task,
  title: task?.title || task?.name || '',
  status:
    toDisplayStatus(task?.status),
  priority: task?.priority || 'Medium',
})


// GET TASKS
export const getTasks = async () => {

  const response =
    await api.get('/tasks')

  return getCollection(
    response.data,
    'tasks'
  ).map(normalizeTask)
}


// CREATE TASK
export const createTask = async (
  taskData
) => {

  const response =
    await api.post(
      '/tasks',
      taskData
    )

  return normalizeTask(
    getItem(response.data, 'task')
  )
}


// DELETE TASK
export const deleteTask = async (
  taskId
) => {

  const response =
    await api.delete(
      `/tasks/${taskId}`
    )

  return getItem(response.data, 'task')
}


// UPDATE TASK
export const updateTask = async (
  taskId,
  updatedData
) => {

  const response =
    await api.put(
      `/tasks/${taskId}`,
      updatedData
    )

  return normalizeTask(
    getItem(response.data, 'task')
  )
}
