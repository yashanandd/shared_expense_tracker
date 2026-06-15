import { useState } from 'react'
import { Card, PageHeader, Button } from '../components/ui'
import { HiOutlineSparkles, HiOutlineBell, HiOutlineCurrencyDollar, HiOutlineShieldCheck } from 'react-icons/hi2'

export default function Settings() {
  const [currency, setCurrency] = useState(() => localStorage.getItem('default_currency') || 'USD')
  const [notifications, setNotifications] = useState(() => {
    const val = localStorage.getItem('notifications')
    return val !== null ? val === 'true' : true
  })
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')

  function handleSave() {
    localStorage.setItem('default_currency', currency)
    localStorage.setItem('notifications', String(notifications))
    localStorage.setItem('theme', theme)
    
    // Apply theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    alert('Preferences saved successfully!')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure your expense tracking preferences."
      />

      <div className="max-w-2xl space-y-6">
        <Card>
          <div className="flex gap-4 border-b border-[var(--color-border)] pb-4">
            <HiOutlineSparkles className="h-6 w-6 text-[var(--color-primary)] shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text)]">Appearance</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Customize how the application looks</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-secondary)]">Interface Theme</span>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="h-9 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
            >
              <option value="light">Light Mode</option>
              <option value="dark">Dark Mode</option>
            </select>
          </div>
        </Card>

        <Card>
          <div className="flex gap-4 border-b border-[var(--color-border)] pb-4">
            <HiOutlineCurrencyDollar className="h-6 w-6 text-[var(--color-primary)] shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text)]">Localization</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Set default formats and currency</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-secondary)]">Default Currency</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="h-9 rounded-lg border border(--color-border) bg-[var(--color-bg)] px-3 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="INR">INR (₹)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </Card>

        <Card>
          <div className="flex gap-4 border-b border-[var(--color-border)] pb-4">
            <HiOutlineBell className="h-6 w-6 text-[var(--color-primary)] shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text)]">Notifications</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Control notification triggers</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-secondary)]">Email notifications on new splits</span>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                notifications ? 'bg-[var(--color-primary)]' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  notifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
