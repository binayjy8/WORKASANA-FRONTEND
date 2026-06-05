import { createElement, createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  getProjects,
  getTasks,
  getTeams,
  getUsers,
} from '../services/api'
import { getEntityId, isSameEntityId } from '../utils/entity'

const WorkspaceDataContext = createContext(null)

const initialState = {
  projects:  [],
  tasks:     [],
  teams:     [],
  users:     [],
  isLoading: true,
  error:     '',
}

const includesText = (value, searchQuery) =>
  String(value || '').toLowerCase().includes(searchQuery.toLowerCase())

const filterTasks = (tasks, searchQuery) => {
  if (!searchQuery) return tasks
  return tasks.filter((task) =>
    [
      task.title,
      task.name,
      task.project?.title || task.project?.name || task.project,
      task.status,
      task.priority,
      task.dueDate,
      task.assignee,
      ...(task.tags || []),
    ].some((value) => includesText(value, searchQuery)),
  )
}

const filterProjects = (projects, searchQuery) => {
  if (!searchQuery) return projects
  return projects.filter((project) =>
    [
      project.title,
      project.name,
      project.description,
      project.status,
      project.priority,
      project.deadline,
      ...(project.team || []),
    ].some((value) => includesText(value, searchQuery)),
  )
}

const filterUsers = (users, searchQuery) => {
  if (!searchQuery) return users
  return users.filter((user) =>
    [user.name, user.email, user.role].some((value) =>
      includesText(value, searchQuery),
    ),
  )
}

const settleCollection = (result) =>
  result.status === 'fulfilled' ? result.value : []

export const WorkspaceDataProvider = ({ children }) => {
  const [state, setState]             = useState(initialState)
  const [searchQuery, setSearchQuery] = useState('')

  // ── Task actions ─────────────────────────────────────
  const addTask = (task) =>
    setState((s) => ({
      ...s,
      tasks: [{ ...task, title: task.title || task.name }, ...s.tasks],
    }))

  const updateTaskInStore = (taskId, taskUpdates) =>
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((task) =>
        isSameEntityId(getEntityId(task), taskId)
          ? { ...task, ...taskUpdates, title: taskUpdates.title || taskUpdates.name || task.title }
          : task,
      ),
    }))

  const removeTask = (taskId) =>
    setState((s) => ({
      ...s,
      tasks: s.tasks.filter(
        (task) => !isSameEntityId(getEntityId(task), taskId),
      ),
    }))

  // ── Project actions ───────────────────────────────────
  const addProject = (project) =>
    setState((s) => ({
      ...s,
      projects: [
        { ...project, title: project.title || project.name },
        ...s.projects,
      ],
    }))

  // ── Team actions ──────────────────────────────────────
  const addTeam = (team) =>
    setState((s) => ({
      ...s,
      teams: [team, ...s.teams],
    }))

  // ── Load all data ─────────────────────────────────────
  useEffect(() => {
    let isMounted = true

    const load = async () => {
      const results = await Promise.allSettled([
        getProjects(),
        getTasks(),
        getTeams(),
        getUsers(),
      ])

      if (!isMounted) return

      const [projectsResult, tasksResult, teamsResult, usersResult] = results
      const hasError = results.some((r) => r.status === 'rejected')

      setState({
        projects:  settleCollection(projectsResult),
        tasks:     settleCollection(tasksResult),
        teams:     settleCollection(teamsResult),
        users:     settleCollection(usersResult),
        isLoading: false,
        error: hasError
          ? 'Some workspace data could not be loaded. Please check the API connection.'
          : '',
      })
    }

    load()
    return () => { isMounted = false }
  }, [])

  const value = useMemo(
    () => ({
      ...state,
      addTask,
      addProject,
      addTeam,
      updateTaskInStore,
      removeTask,
      searchQuery,
      setSearchQuery,
      filteredProjects: filterProjects(state.projects, searchQuery),
      filteredTasks:    filterTasks(state.tasks, searchQuery),
      filteredUsers:    filterUsers(state.users, searchQuery),
    }),
    [searchQuery, state],
  )

  // FIX: use createElement instead of JSX so this works in a .js file
  return createElement(WorkspaceDataContext.Provider, { value }, children)
}

export const useWorkspaceData = () => {
  const context = useContext(WorkspaceDataContext)
  if (!context)
    throw new Error('useWorkspaceData must be used inside WorkspaceDataProvider')
  return context
}