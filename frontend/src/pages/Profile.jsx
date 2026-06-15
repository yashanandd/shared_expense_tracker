import { useAuth } from '../context'
import { HiOutlineUser, HiOutlineEnvelope, HiOutlineCalendarDays, HiOutlineCheckBadge } from 'react-icons/hi2'
import { Card, PageHeader } from '../components/ui'
import { formatDate } from '../utils/format'

export default function Profile() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="flex h-64 items-center justify-center text-[var(--color-text-muted)]">
        No profile session loaded.
      </div>
    )
  }

  const initial = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="View and manage your account details."
      />

      <div className="max-w-2xl">
        <Card className="p-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-2xl font-bold text-white shadow-sm">
              {initial}
            </div>
            
            <div className="flex-1 space-y-4 text-center sm:text-left">
              <div>
                <h2 className="text-xl font-bold text-[var(--color-text)]">{user.name}</h2>
                <div className="mt-1 flex items-center justify-center gap-1.5 text-xs text-[var(--color-text-muted)] sm:justify-start">
                  <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-success)]" />
                  <span>Active Session</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-4 border-t border-[var(--color-border)] sm:grid-cols-2">
                <div className="flex items-center justify-center gap-3 text-sm text-[var(--color-text-secondary)] sm:justify-start">
                  <HiOutlineEnvelope className="h-5 w-5 text-[var(--color-text-muted)]" />
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">Email Address</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 text-sm text-[var(--color-text-secondary)] sm:justify-start">
                  <HiOutlineCalendarDays className="h-5 w-5 text-[var(--color-text-muted)]" />
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">Member Since</p>
                    <p className="font-medium">
                      {user.created_at ? formatDate(user.created_at) : 'Recently'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="mt-6 border-l-4 border-[var(--color-success)] bg-[var(--color-success-bg)]/30">
          <div className="flex gap-3">
            <HiOutlineCheckBadge className="h-6 w-6 text-[var(--color-success)] shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text)]">
                Secure Connection Established
              </h3>
              <p className="mt-1 text-xs text-[var(--color-text-muted)] leading-relaxed">
                Your frontend is securely authenticated with the FastAPI backend. All API requests are signed using a stateless JWT token stored in your local session.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
