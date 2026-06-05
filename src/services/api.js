import axios from 'axios'
import { toDisplayStatus } from '../utils/taskUtils'

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://workasana-backend-iota.vercel.app/api'

const api = axios.create({
  baseURL: API_BASE_URL,
})

// AUTO TOKEN
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// AUTO LOGOUT on 401
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

// ── HELPERS ───────────────────────────────────────────────

const getCollection = (data, key) => {
  if (Array.isArray(data))             return data
  if (Array.isArray(data?.[key]))      return data[key]
  if (Array.isArray(data?.data))       return data.data
  if (Array.isArray(data?.data?.[key]))return data.data[key]
  return []
}

const getText = (value, fallback = '') => {
  if (value === null || value === undefined) return fallback
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  return value.name || value.title || value.email || value.description || fallback
}

// ── NORMALIZERS ───────────────────────────────────────────

const normalizeProject = (project) => ({
  ...project,
  title:    getText(project.title || project.name),
  status:   project.status   || 'Pending',
  priority: project.priority || 'Medium',
  deadline: project.deadline || project.dueDate || '',
  team:     Array.isArray(project.team) ? project.team : [],
})

const normalizeTask = (task) => ({
  ...task,
  title:    getText(task.title || task.name),
  status:   toDisplayStatus(task.status),
  priority: task.priority || 'Medium',
})

const normalizeTeam = (team) => ({
  ...team,
  name: getText(team.name || team.title),
})

const normalizeUser = (user) => ({
  ...user,
  name: getText(
    user.name || user.fullName || user.username || user.email,
  ),
  email:    user.email    || user.username || '',
  role:     user.role     || user.bio || user.companyName || 'Team Member',
  projects: user.projects || 0,
})

// ── PROJECTS ──────────────────────────────────────────────

export const getProjects = async () => {
  const response = await api.get('/projects')
  return getCollection(response.data, 'projects').map(normalizeProject)
}

export const createProject = async (projectData) => {
  const response = await api.post('/projects', projectData)
  return normalizeProject(
    response.data?.project || response.data?.data || response.data,
  )
}

// ── TASKS ─────────────────────────────────────────────────

export const getTasks = async () => {
  const response = await api.get('/tasks')
  return getCollection(response.data, 'tasks').map(normalizeTask)
}

// ── TEAMS ─────────────────────────────────────────────────

export const getTeams = async () => {
  try {
    const response = await api.get('/teams')
    return getCollection(response.data, 'teams').map(normalizeTeam)
  } catch {
    // fallback to users if /teams endpoint doesn't exist
    const response = await api.get('/users')
    return getCollection(response.data, 'users').map(normalizeTeam)
  }
}

// FIX: createTeam was missing — added now
export const createTeam = async (teamData) => {
  const response = await api.post('/teams', teamData)
  return normalizeTeam(
    response.data?.team || response.data?.data || response.data,
  )
}

// ── USERS ─────────────────────────────────────────────────

export const getUsers = async () => {
  const response = await api.get('/users')
  return getCollection(response.data, 'users').map(normalizeUser)
}

export default api