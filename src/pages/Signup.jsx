import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signupUser } from '../services/authApi'

const Signup = () => {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleSignup = async (event) => {
    event.preventDefault()
    setMessage('')

    try {
      await signupUser({
        name,
        email,
        password,
      })

      setMessage('Signup successful. Please login.')
      navigate('/login')
    } catch (error) {
      console.log(error)
      setMessage(error.response?.data?.message || 'Signup failed')
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <h1>Workasana Signup</h1>
        <p>Create an account to manage projects and tasks</p>

        <form className="login-form" onSubmit={handleSignup}>
          <label>
            Name
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {message ? <p className="form-message">{message}</p> : null}

          <button type="submit">Signup</button>
        </form>

        <Link to="/login" className="auth-switch-link">
          Already have an account? Login
        </Link>
      </section>
    </main>
  )
}

export default Signup
