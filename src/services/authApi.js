import api from './api'


export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials)
  return response.data
}

export const signupUser = async (userData) => {
  const response = await api.post('/auth/register', userData) 
  return response.data
}


export const getMe = async () => {
  try {
    const response = await api.get('/auth/me')
    return response.data?.user || response.data?.data || response.data
  } catch {
    // Backend doesn't have /auth/me — return null silently
    return null
  }
}

// Profile update — not in backend, returns null gracefully
export const updateProfile = async () => {
  return null
}

// Password change — not in backend, returns null gracefully
export const changePassword = async () => {
  return null
}
