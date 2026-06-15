import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div
        className={`flex min-h-screen flex-1 flex-col transition-all duration-200 ${
          collapsed ? 'lg:ml-16' : 'lg:ml-[280px]'
        }`}
      >
        <Navbar onToggleSidebar={() => setCollapsed(!collapsed)} />
        <main className="flex-1 p-6 lg:p-8 xl:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
