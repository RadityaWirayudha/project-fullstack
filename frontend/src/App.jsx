import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Residents from './pages/Residents'
import Houses from './pages/Houses'
import HouseDetail from './pages/HouseDetail'
import Payments from './pages/Payments'
import Expenses from './pages/Expenses'

function RequireAuth({ children }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="residents" element={<Residents />} />
        <Route path="houses" element={<Houses />} />
        <Route path="houses/:id" element={<HouseDetail />} />
        <Route path="payments" element={<Payments />} />
        <Route path="expenses" element={<Expenses />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
