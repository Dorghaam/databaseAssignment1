import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

export default function Navbar() {
  const { signOut } = useAuth()
  const { showToast } = useToast()

  const handleLogout = async () => {
    const { error } = await signOut()
    if (error) {
      showToast('Failed to sign out', 'error')
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">Britannicus Reading Room</div>
      <div className="navbar-links">
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/inventory">Inventory</NavLink>
        <NavLink to="/contacts">Contacts</NavLink>
        <NavLink to="/purchases">Purchases</NavLink>
        <NavLink to="/sales">Sales</NavLink>
        <NavLink to="/market-prices">Market Prices</NavLink>
        <NavLink to="/special-requests">Special Requests</NavLink>
      </div>
      <button className="btn btn-sm" onClick={handleLogout}>Sign Out</button>
    </nav>
  )
}
