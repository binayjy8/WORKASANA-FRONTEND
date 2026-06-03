import api from './api'

export const loginUser = async (userdata) => {
  const response = await api.post(
    '/auth/login',
    userdata
  )

  return response.data?.data || response.data
}

export const signupUser = async (userdata) => {
  try {
    const response = await api.post(
      '/auth/signup',
      userdata
    )

    return response.data?.data || response.data
  } catch (error) {
    if (error.response?.status !== 404) {
      throw error
    }

    const response = await api.post(
      '/auth/register',
      userdata
    )

    return response.data?.data || response.data
  }
}

export const getCurrentuser = async (token) => {
  const response = await api.get(
    '/auth/me',
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  return response.data?.data || response.data
}
