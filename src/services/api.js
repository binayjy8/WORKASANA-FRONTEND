import axios from 'axios'
import { toDisplayStatus } from '../utils/taskUtils'

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://workasana-backend-iota.vercel.app/api'

const api = axios.create({ baseURL: API_BASE_URL })

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

const getCollection = (data, key) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.[key])) return data[key]
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.data?.[key])) return data.data[key]
  return []
}

const getItem = (data, key) => {
  if (data?.[key]) return data[key]
  if (data?.data?.[key]) return data.data[key]
  if (data?.data) return data.data
  return data
}

const getText = (value, fallback = '') => {
  if (value === null || value === undefined) return fallback
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  return value.name || value.title || value.email || value.description || fallback
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

const normalizeProject = (project = {}) => ({
  ...project,
  title: getText(project.title || project.name),
  name: getText(project.name || project.title),
  status: project.status || 'Pending',
  priority: project.priority || 'Medium',
  deadline: project.deadline || project.dueDate || '',
  team: Array.isArray(project.team) ? project.team : [],
})

const normalizeTask = (task = {}) => ({
  ...task,
  title: getText(task.title || task.name),
  name: getText(task.name || task.title),
  status: toDisplayStatus(task.status),
  priority: task.priority || 'Medium',
  project: task.project,
  team: task.team,
  owners: Array.isArray(task.owners) ? task.owners : [],
  tags: normalizeTags(task.tags),
  dueDate: getTaskDate(task),
  deadline: task.deadline || getTaskDate(task),
  assignee: task.assignee || '',
  timeToComplete: task.timeToComplete ?? 0,
})

const normalizeTeam = (team = {}) => ({
  ...team,
  name: getText(team.name || team.title),
  title: getText(team.title || team.name),
  description: getText(team.description, ''),
})

const normalizeUser = (user = {}) => ({
  ...user,
  name: getText(user.name || user.fullName || user.username || user.email),
  email: user.email || user.username || '',
  role: user.role || user.bio || user.companyName || 'Team Member',
  projects: user.projects || 0,
})

export const getProjects = async () => {
  const response = await api.get('/projects')
  return getCollection(response.data, 'projects').map(normalizeProject)
}

export const createProject = async (projectData) => {
  const response = await api.post('/projects', projectData)
  return normalizeProject(getItem(response.data, 'project'))
}

export const getTasks = async () => {
  const response = await api.get('/tasks')
  return getCollection(response.data, 'tasks').map(normalizeTask)
}

export const getTeams = async () => {
  const response = await api.get('/teams')
  return getCollection(response.data, 'teams').map(normalizeTeam)
}

export const createTeam = async (teamData) => {
  const response = await api.post('/teams', teamData)
  return normalizeTeam(getItem(response.data, 'team'))
}

export const updateTeam = async (teamId, teamData) => {
  try {
    const response = await api.put(`/teams/${teamId}`, teamData)
    return normalizeTeam(getItem(response.data, 'team'))
  } catch (putError) {
    if (!shouldTryFallbackMethod(putError)) throw putError

    try {
      const response = await api.patch(`/teams/${teamId}`, teamData)
      return normalizeTeam(getItem(response.data, 'team'))
    } catch (patchError) {
      if (!shouldTryFallbackMethod(patchError)) throw patchError

      const response = await api.post(`/teams/${teamId}`, teamData)
      return normalizeTeam(getItem(response.data, 'team'))
    }
  }
}

export const getUsers = async () => {
  const response = await api.get('/users')
  return getCollection(response.data, 'users').map(normalizeUser)
}

export default api
