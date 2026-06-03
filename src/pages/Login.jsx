import { useState } from 'react'

import {
  Link,
  useNavigate,
} from 'react-router-dom'

import { loginUser } from '../services/authApi'

const Login = () => {

  const navigate =
    useNavigate()

  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [message, setMessage] =
    useState('')

  const [isLoading, setIsLoading] =
    useState(false)

  const handleLogin = async (
    event
  ) => {

    event.preventDefault()

    setMessage('')

    try {

      setIsLoading(true)

      const data =
        await loginUser({
          email,
          password,
        })

      const token =
        data.token ||
        data.accessToken ||
        data.jwt

      if (!token) {

        alert(
          'Login succeeded, but no token was returned'
        )

        return
      }

      localStorage.setItem(
        'token',
        token
      )

      navigate('/dashboard')

    } catch (error) {

      console.log(error)

      setMessage(
        'Invalid email or password'
      )

    } finally {

      setIsLoading(false)

    }
  }

  return (

    <main className="auth-page">

      <section className="auth-center">

        <div className="auth-card">

          <div className="auth-logo">
            WA
          </div>


          <div className="auth-card-header">

            <h1>
              WORKASANA
            </h1>

            <p>
              Manage projects, tasks,
              teams and reports in one workspace.
            </p>

          </div>


          <form
            className="auth-form"
            onSubmit={handleLogin}
          >

            <label>

              <span>
                Email Address
              </span>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                required
              />

            </label>


            <label>

              <span>
                Password
              </span>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                required
              />

            </label>


            {message ? (

              <p className="form-message">
                {message}
              </p>

            ) : null}


            <button
              type="submit"
              className="auth-submit-btn"
              disabled={isLoading}
            >

              {isLoading
                ? 'Logging in...'
                : 'Login'}

            </button>

          </form>


          <p className="auth-switch-text">

            New user?

            <Link
              to="/signup"
              className="auth-switch-link"
            >
              Create Account
            </Link>

          </p>

        </div>

      </section>

    </main>

  )
}

export default Login