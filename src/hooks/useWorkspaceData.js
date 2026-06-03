import { createContext, createElement, useContext, useEffect, useMemo, useState } from 'react'
import {
  getProjects,
  getTasks,
  getTeams,
  getUsers,
  createProject,
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

const includesText = (value, searchQuery) => {
  return String(value || '').toLowerCase().includes(searchQuery.toLowerCase())
}

const filterProjects = (projects, searchQuery) => {
  if (!searchQuery) {
    return projects
  }

  return projects.filter((project) =>
    [
      project.title,
      project.description,
      project.status,
      project.priority,
      project.deadline,
      ...(project.team || []),
    ].some((value) => includesText(value, searchQuery)),
  )
}

const filterTasks = (tasks, searchQuery) => {
  if (!searchQuery) {
    return tasks
  }

  return tasks.filter((task) =>
    [
      task.title,
      task.project?.title || task.project?.name || task.project,
      task.status,
      task.priority,
      task.dueDate,
      task.assignee,
    ].some((value) => includesText(value, searchQuery)),
  )
}

const filterUsers = (users, searchQuery) => {
  if (!searchQuery) {
    return users
  }

  return users.filter((user) =>
    [user.name, user.email, user.role].some((value) => includesText(value, searchQuery)),
  )
}

const settleCollection = (result) => {
  return result.status === 'fulfilled' ? result.value : []
}

export const WorkspaceDataProvider = ({ children }) => {
  const [state, setState] = useState(initialState)
  const [searchQuery, setSearchQuery] = useState('')

  const addTask = (task) => {
    setState((currentState) => ({
      ...currentState,
      tasks: [
        {
          ...task,
          title: task.title || task.name,
        },
        ...currentState.tasks,
      ],
    }))
  }

  const addProject = (project) => {

  setState((currentState) => ({
    ...currentState,

    projects: [
      {
        ...project,
        title:
          project.title ||
          project.name,
      },

      ...currentState.projects,
    ],
  }))
}

  const updateTaskInStore = (taskId, taskUpdates) => {
    setState((currentState) => ({
      ...currentState,
      tasks: currentState.tasks.map((task) =>
        isSameEntityId(getEntityId(task), taskId)
          ? {
              ...task,
              ...taskUpdates,
              title: taskUpdates.title || taskUpdates.name || task.title,
            }
          : task,
      ),
    }))
  }

  const removeTask = (taskId) => {
    setState((currentState) => ({
      ...currentState,
      tasks: currentState.tasks.filter(
        (task) => !isSameEntityId(getEntityId(task), taskId),
      ),
    }))
  }

  useEffect(() => {
    let isMounted = true

    const loadWorkspaceData = async () => {
      const results = await Promise.allSettled([
          getProjects(),
          getTasks(),
          getTeams(),
          getUsers(),
        ])

      if (!isMounted) {
        return
      }

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

    loadWorkspaceData()

    return () => {
      isMounted = false
    }
  }, [])

  const value = useMemo(() => {
    return {
      ...state,
      addTask,
      addProject,
      updateTaskInStore,
      removeTask,
      searchQuery,
      setSearchQuery,
      filteredProjects: filterProjects(state.projects, searchQuery),
      filteredTasks: filterTasks(state.tasks, searchQuery),
      filteredUsers: filterUsers(state.users, searchQuery),
    }
  }, [searchQuery, state])

  return createElement(WorkspaceDataContext.Provider, { value }, children)
}

export const useWorkspaceData = () => {
  const context = useContext(WorkspaceDataContext)

  if (!context) {
    throw new Error('useWorkspaceData must be used inside WorkspaceDataProvider')
  }

  return context
}
