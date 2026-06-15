import { NavLink } from 'react-router-dom'
import {
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineCurrencyDollar,
  HiOutlineArrowUpOnSquareStack,
  HiOutlineScale,
  HiOutlineChartBarSquare,
  HiOutlineCog6Tooth,
} from 'react-icons/hi2'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: HiOutlineHome },
  { to: '/groups', label: 'Groups', icon: HiOutlineUserGroup },
  { to: '/expenses', label: 'Expenses', icon: HiOutlineCurrencyDollar },
  { to: '/imports', label: 'Imports', icon: HiOutlineArrowUpOnSquareStack },
  { to: '/settlements', label: 'Settlements', icon: HiOutlineScale },
  { to: '/analytics', label: 'Analytics', icon: HiOutlineChartBarSquare },
  { to: '/settings', label: 'Settings', icon: HiOutlineCog6Tooth },
]

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col bg-[#0f172a] transition-all duration-200 ease-in-out ${
        collapsed ? 'w-16' : 'w-[280px]'
      }`}
    >
      <div className="flex h-16 items-center border-b border-white/5 px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)]">
            <span className="text-sm font-bold text-white">S</span>
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold tracking-tight text-white">
              SplitEase
            </span>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              } ${collapsed ? 'justify-center px-0' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/5 p-3">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/40 hover:bg-white/5 hover:text-white/80 transition-all duration-150"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
              collapsed ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5"
            />
          </svg>
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
