import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Contacts from './pages/Contacts';
import Purchases from './pages/Purchases';
import Sales from './pages/Sales';
import MarketPrices from './pages/MarketPrices';
import SpecialRequests from './pages/SpecialRequests';

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/market-prices" element={<MarketPrices />} />
          <Route path="/special-requests" element={<SpecialRequests />} />
        </Routes>
      </main>
    </div>
  );
}
