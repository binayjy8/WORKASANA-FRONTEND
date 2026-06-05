import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../services/authApi'

const Login = () => {
  const navigate = useNavigate()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage]   = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (event) => {
    event.preventDefault()
    setMessage('')

    try {
      setIsLoading(true)

      const data = await loginUser({ email, password })

      const token =
        data.token ||
        data.accessToken ||
        data.jwt

      if (!token) {
        setMessage('Login succeeded but no token was returned.')
        return
      }

      localStorage.setItem('token', token)
      navigate('/dashboard')

    } catch (error) {
      console.error(error)
      setMessage(
        error.response?.data?.message || 'Invalid email or password.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-center">
        <div className="auth-card">

          {/* LOGO */}
          <div className="auth-logo">WA</div>

          {/* HEADER */}
          <div className="auth-card-header">
            <h1>WORKASANA</h1>
            <p>Manage projects, tasks, teams and reports in one workspace.</p>
          </div>

          {/* FORM */}
          <form className="auth-form" onSubmit={handleLogin}>

            <label>
              <span>Email Address</span>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </label>

            <label>
              <span>Password</span>
              <div className="auth-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-toggle-password"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </label>

            {message && (
              <p className="form-message">{message}</p>
            )}

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in…' : 'Sign In'}
            </button>

          </form>

          {/* SWITCH */}
          <p className="auth-switch-text">
            New to Workasana?
            <Link to="/signup" className="auth-switch-link">
              Create Account
            </Link>
          </p>

        </div>
      </section>
    </main>
  )
}

export default Login
