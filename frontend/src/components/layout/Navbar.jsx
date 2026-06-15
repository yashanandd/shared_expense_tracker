import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiOutlineMagnifyingGlass, HiOutlineBell, HiOutlineBars3, HiOutlineChevronDown, HiOutlineUser, HiOutlineCog6Tooth, HiOutlineArrowRightOnRectangle } from 'react-icons/hi2'
import { useAuth } from '../../context'

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClick)
    }
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showDropdown])

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 lg:px-6">
      <div className="flex items-center gap-3 lg:gap-4">
        <button
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] transition-all duration-150"
        >
          <HiOutlineBars3 className="h-5 w-5" />
        </button>
      </div>

      <div className="mx-4 flex-1 lg:mx-8">
        <div className="relative max-w-md">
          <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search expenses, groups..."
            className="h-9 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] pl-10 pr-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] transition-all duration-150 hover:border-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] focus:outline-none focus:shadow-sm"
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] transition-all duration-150">
          <HiOutlineBell className="h-5 w-5" />
          <span className="absolute right-2.5 top-2 h-2 w-2 rounded-full bg-[var(--color-danger)]" />
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[var(--color-surface-hover)] transition-all duration-150"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-medium text-white">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="hidden text-sm font-medium text-[var(--color-text)] md:block">
              {user?.name || 'User'}
            </span>
            <HiOutlineChevronDown className="hidden h-3.5 w-3.5 text-[var(--color-text-muted)] md:block" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl py-1.5 animate-in">
              <div className="border-b border-[var(--color-border)] px-4 py-3">
                <p className="text-sm font-medium text-[var(--color-text)]">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { navigate('/profile'); setShowDropdown(false) }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-all duration-150"
                >
                  <HiOutlineUser className="h-4 w-4" />
                  Profile
                </button>
                <button
                  onClick={() => { navigate('/settings'); setShowDropdown(false) }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-all duration-150"
                >
                  <HiOutlineCog6Tooth className="h-4 w-4" />
                  Settings
                </button>
              </div>
              <div className="border-t border-[var(--color-border)] py-1">
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-all duration-150"
                >
                  <HiOutlineArrowRightOnRectangle className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
