import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context'
import { HiOutlineUserPlus } from 'react-icons/hi2'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await register({ name, email, password })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to register')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-sm">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--color-primary-light)]">
              <HiOutlineUserPlus className="h-6 w-6 text-[var(--color-primary)]" />
            </div>
            <h1 className="text-xl font-semibold text-[var(--color-text)]">
              Create an account
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Get started with Shared Expense Manager
            </p>
          </div>
          {error && (
            <div className="mb-4 rounded-lg bg-[var(--color-danger-bg)] p-3 text-xs font-medium text-[var(--color-danger)] text-center">
              {error}
            </div>
          )}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--color-text-secondary)]">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] transition-all duration-150 hover:border-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] focus:outline-none focus:shadow-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--color-text-secondary)]">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] transition-all duration-150 hover:border-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] focus:outline-none focus:shadow-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--color-text-secondary)]">
                Password
              </label>
              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] transition-all duration-150 hover:border-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] focus:outline-none focus:shadow-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="h-10 w-full rounded-[var(--radius-md)] bg-[var(--color-primary)] text-sm font-medium text-white transition-all duration-150 hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary-hover)] disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Registering...' : 'Sign up'}
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-[var(--color-text-muted)]">
            Already have an account?{' '}
            <a href="/login" className="font-medium text-[var(--color-primary)] hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
