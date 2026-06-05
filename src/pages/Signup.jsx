import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signupUser } from '../services/authApi'

const Signup = () => {
  const navigate                        = useNavigate()
  const [name, setName]                 = useState('')
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage]           = useState('')
  const [isSuccess, setIsSuccess]       = useState(false)
  const [isLoading, setIsLoading]       = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSignup = async (e) => {
    e.preventDefault()
    setMessage('')

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    try {
      setIsLoading(true)
      await signupUser({ name, email, password })
      setIsSuccess(true)
      setMessage('Account created! Redirecting to login…')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      console.error(err)
      setIsSuccess(false)
      setMessage(err.response?.data?.message || 'Signup failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-center">
        <div className="auth-card">

          <div className="auth-logo">WA</div>

          <div className="auth-card-header">
            <h1>Create Account</h1>
            <p>Join Workasana to manage your projects and tasks.</p>
          </div>

          <form className="auth-form" onSubmit={handleSignup}>

            <label>
              <span>Full Name</span>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </label>

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
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="auth-toggle-password"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </label>

            <label>
              <span>Confirm Password</span>
              <input
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </label>

            {message && (
              <p className={`form-message ${isSuccess ? 'form-message--success' : ''}`}>
                {message}
              </p>
            )}

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? 'Creating Account…' : 'Create Account'}
            </button>

          </form>

          <p className="auth-switch-text">
            Already have an account?
            <Link to="/login" className="auth-switch-link">Sign In</Link>
          </p>

        </div>
      </section>
    </main>
  )
}

export default Signup
