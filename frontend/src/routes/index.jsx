import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout, AuthLayout } from '../components/layout'
import ProtectedRoute from '../components/ui/ProtectedRoute'
import {
  Dashboard,
  Groups,
  GroupDetail,
  Expenses,
  Imports,
  Settlements,
  Analytics,
  Profile,
  Settings,
  Login,
  Register,
  NotFound,
} from '../pages'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/groups', element: <Groups /> },
      { path: '/groups/:id', element: <GroupDetail /> },
      { path: '/expenses', element: <Expenses /> },
      { path: '/imports', element: <Imports /> },
      { path: '/settlements', element: <Settlements /> },
      { path: '/analytics', element: <Analytics /> },
      { path: '/profile', element: <Profile /> },
      { path: '/settings', element: <Settings /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
    ],
  },
  { path: '*', element: <NotFound /> },
])

export default router
