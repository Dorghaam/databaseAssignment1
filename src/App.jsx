import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Contacts from './pages/Contacts'
import Purchases from './pages/Purchases'
import Sales from './pages/Sales'
import MarketPrices from './pages/MarketPrices'
import SpecialRequests from './pages/SpecialRequests'
import Login from './pages/Login'

// redirects to login if user is not logged in
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="page"><p>Loading...</p></div>
  if (!user) return <Navigate to="/login" />
  return children
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) return <div className="page"><p>Loading...</p></div>

  return (
    <div className="app">
      {user && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
          <Route path="/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
          <Route path="/purchases" element={<ProtectedRoute><Purchases /></ProtectedRoute>} />
          <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
          <Route path="/market-prices" element={<ProtectedRoute><MarketPrices /></ProtectedRoute>} />
          <Route path="/special-requests" element={<ProtectedRoute><SpecialRequests /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  )
}
