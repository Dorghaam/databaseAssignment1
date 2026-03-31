import { NavLink } from 'react-router-dom';

export default function Navbar() {
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
    </nav>
  );
}
