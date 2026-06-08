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
  projects: [],
  tasks: [],
  teams: [],
  users: [],
  isLoading: true,
  error: '',
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
      task.team?.name || task.team?.title || task.team,
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

const normalizeTeamForStore = (team) => ({
  ...team,
  name: team.name || team.title || '',
  title: team.title || team.name || '',
  description: team.description || '',
})

export const WorkspaceDataProvider = ({ children }) => {
  const [state, setState] = useState(initialState)
  const [searchQuery, setSearchQuery] = useState('')

  const addTask = (task) =>
    setState((current) => ({
      ...current,
      tasks: [{ ...task, title: task.title || task.name }, ...current.tasks],
    }))

  const updateTaskInStore = (taskId, taskUpdates) =>
    setState((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        isSameEntityId(getEntityId(task), taskId)
          ? {
              ...task,
              ...taskUpdates,
              title: taskUpdates.title || taskUpdates.name || task.title,
            }
          : task,
      ),
    }))

  const removeTask = (taskId) =>
    setState((current) => ({
      ...current,
      tasks: current.tasks.filter(
        (task) => !isSameEntityId(getEntityId(task), taskId),
      ),
    }))

  const addProject = (project) =>
    setState((current) => ({
      ...current,
      projects: [
        { ...project, title: project.title || project.name },
        ...current.projects,
      ],
    }))

  const addTeam = (team) =>
    setState((current) => {
      const normalizedTeam = normalizeTeamForStore(team)
      const teamId = getEntityId(normalizedTeam)

      if (teamId && current.teams.some((item) => isSameEntityId(getEntityId(item), teamId))) {
        return {
          ...current,
          teams: current.teams.map((item) =>
            isSameEntityId(getEntityId(item), teamId)
              ? { ...item, ...normalizedTeam }
              : item,
          ),
        }
      }

      return {
        ...current,
        teams: [normalizedTeam, ...current.teams],
      }
    })

  const updateTeamInStore = (teamId, teamUpdates) =>
    setState((current) => {
      const normalizedUpdates = normalizeTeamForStore(teamUpdates)

      return {
        ...current,
        teams: current.teams.map((team) =>
          isSameEntityId(getEntityId(team), teamId)
            ? { ...team, ...normalizedUpdates }
            : team,
        ),
        tasks: current.tasks.map((task) => {
          const taskTeamId = getEntityId(task.team) || task.team

          if (!isSameEntityId(taskTeamId, teamId) || typeof task.team !== 'object') {
            return task
          }

          return {
            ...task,
            team: { ...task.team, ...normalizedUpdates },
          }
        }),
      }
    })

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
      const hasError = results.some((result) => result.status === 'rejected')

      setState({
        projects: settleCollection(projectsResult),
        tasks: settleCollection(tasksResult),
        teams: settleCollection(teamsResult),
        users: settleCollection(usersResult),
        isLoading: false,
        error: hasError
          ? 'Some workspace data could not be loaded. Please check the API connection.'
          : '',
      })
    }

    load()

    return () => {
      isMounted = false
    }
  }, [])

  const value = useMemo(
    () => ({
      ...state,
      addTask,
      addProject,
      addTeam,
      updateTaskInStore,
      updateTeamInStore,
      removeTask,
      searchQuery,
      setSearchQuery,
      filteredProjects: filterProjects(state.projects, searchQuery),
      filteredTasks: filterTasks(state.tasks, searchQuery),
      filteredUsers: filterUsers(state.users, searchQuery),
    }),
    [searchQuery, state],
  )

  return createElement(WorkspaceDataContext.Provider, { value }, children)
}

export const useWorkspaceData = () => {
  const context = useContext(WorkspaceDataContext)

  if (!context) {
    throw new Error('useWorkspaceData must be used inside WorkspaceDataProvider')
  }

  return context
}
