import { useState } from 'react';
import { inventoryItems, contacts, purchases, sales, specialRequests } from '../data/mockData';
import SearchBar from '../components/SearchBar';
import SortableTable from '../components/SortableTable';

export default function Dashboard() {
  const [search, setSearch] = useState('');
  const [showReport, setShowReport] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const openRequests = specialRequests.filter(r => r.status === 'Open').length;

  // recent acquisitions (by purchase date, take 5)
  const recentPurchases = [...purchases]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)
    .map(p => {
      const contact = contacts.find(c => c.id === p.contactId);
      const itemNames = p.lineItems.map(li => {
        const item = inventoryItems.find(i => i.id === li.itemId);
        return item ? item.title : 'Unknown';
      }).join(', ');
      const total = p.lineItems.reduce((sum, li) => sum + li.price * li.quantity, 0);
      return { id: p.id, date: p.date, supplier: contact ? `${contact.firstName} ${contact.lastName}` : 'Unknown', items: itemNames, total: `$${total.toFixed(2)}` };
    });

  const recentSales = [...sales]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)
    .map(s => {
      const contact = contacts.find(c => c.id === s.contactId);
      const total = s.lineItems.reduce((sum, li) => sum + li.price * li.quantity, 0);
      return { id: s.id, date: s.date, buyer: contact ? `${contact.firstName} ${contact.lastName}` : 'Unknown', itemCount: s.lineItems.length, total: `$${total.toFixed(2)}` };
    });

  // Global search
  const searchLower = search.toLowerCase();
  const searchResults = search ? {
    inventory: inventoryItems.filter(i => i.title.toLowerCase().includes(searchLower) || i.category.toLowerCase().includes(searchLower) || i.description.toLowerCase().includes(searchLower)),
    contacts: contacts.filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchLower) || c.email.toLowerCase().includes(searchLower)),
    purchases: purchases.filter(p => {
      const contact = contacts.find(c => c.id === p.contactId);
      return contact && `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchLower);
    }),
    sales: sales.filter(s => {
      const contact = contacts.find(c => c.id === s.contactId);
      return contact && `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchLower);
    }),
  } : null;

  // Reports
  const inventoryByCategory = () => {
    const groups = { Book: [], Map: [], Periodical: [] };
    inventoryItems.forEach(item => {
      if (groups[item.category]) groups[item.category].push(item);
    });
    return groups;
  };

  const recentlyAcquiredReport = () => {
    return purchases
      .filter(p => {
        if (dateFrom && p.date < dateFrom) return false;
        if (dateTo && p.date > dateTo) return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(p => {
        const contact = contacts.find(c => c.id === p.contactId);
        return {
          ...p,
          supplierName: contact ? `${contact.firstName} ${contact.lastName}` : 'Unknown',
          itemNames: p.lineItems.map(li => {
            const item = inventoryItems.find(i => i.id === li.itemId);
            return item ? item.title : 'Unknown';
          }).join(', '),
          total: p.lineItems.reduce((sum, li) => sum + li.price * li.quantity, 0),
        };
      });
  };

  return (
    <div className="page">
      <h1>Dashboard</h1>

      <SearchBar value={search} onChange={setSearch} placeholder="Search inventory, contacts, transactions..." />

      {searchResults && (
        <div className="search-results">
          <h3>Search Results for "{search}"</h3>
          {searchResults.inventory.length > 0 && (
            <div className="search-section">
              <h4>Inventory ({searchResults.inventory.length})</h4>
              {searchResults.inventory.map(item => (
                <div key={item.id} className="search-result-item">
                  <strong>{item.title}</strong> — {item.category}, {item.condition}, ${item.price.toFixed(2)}
                </div>
              ))}
            </div>
          )}
          {searchResults.contacts.length > 0 && (
            <div className="search-section">
              <h4>Contacts ({searchResults.contacts.length})</h4>
              {searchResults.contacts.map(c => (
                <div key={c.id} className="search-result-item">
                  <strong>{c.firstName} {c.lastName}</strong> — {c.email}
                </div>
              ))}
            </div>
          )}
          {searchResults.purchases.length > 0 && (
            <div className="search-section">
              <h4>Purchases ({searchResults.purchases.length})</h4>
              {searchResults.purchases.map(p => {
                const contact = contacts.find(c => c.id === p.contactId);
                return (
                  <div key={p.id} className="search-result-item">
                    <strong>{p.date}</strong> — from {contact ? `${contact.firstName} ${contact.lastName}` : 'Unknown'}
                  </div>
                );
              })}
            </div>
          )}
          {searchResults.sales.length > 0 && (
            <div className="search-section">
              <h4>Sales ({searchResults.sales.length})</h4>
              {searchResults.sales.map(s => {
                const contact = contacts.find(c => c.id === s.contactId);
                return (
                  <div key={s.id} className="search-result-item">
                    <strong>{s.date}</strong> — to {contact ? `${contact.firstName} ${contact.lastName}` : 'Unknown'}
                  </div>
                );
              })}
            </div>
          )}
          {searchResults.inventory.length === 0 && searchResults.contacts.length === 0 && searchResults.purchases.length === 0 && searchResults.sales.length === 0 && (
            <p className="no-results">No results found.</p>
          )}
        </div>
      )}

      {!searchResults && (
        <>
          <div className="card-row">
            <div className="card">
              <div className="card-value">{inventoryItems.length}</div>
              <div className="card-label">Total Inventory</div>
            </div>
            <div className="card">
              <div className="card-value">{contacts.length}</div>
              <div className="card-label">Total Contacts</div>
            </div>
            <div className="card">
              <div className="card-value">{openRequests}</div>
              <div className="card-label">Open Requests</div>
            </div>
          </div>

          <div className="report-buttons">
            <button className="btn btn-secondary" onClick={() => setShowReport(showReport === 'category' ? null : 'category')}>
              Inventory by Category
            </button>
            <button className="btn btn-secondary" onClick={() => setShowReport(showReport === 'acquired' ? null : 'acquired')}>
              Recently Acquired
            </button>
          </div>

          {showReport === 'category' && (
            <div className="report-section">
              <h3>Inventory by Category</h3>
              {Object.entries(inventoryByCategory()).map(([cat, items]) => (
                <div key={cat} className="report-group">
                  <h4>{cat} ({items.length} items)</h4>
                  <SortableTable
                    columns={[
                      { key: 'title', label: 'Title' },
                      { key: 'condition', label: 'Condition' },
                      { key: 'quantity', label: 'Qty' },
                      { key: 'price', label: 'Price', render: r => `$${r.price.toFixed(2)}` },
                    ]}
                    data={items}
                  />
                </div>
              ))}
            </div>
          )}

          {showReport === 'acquired' && (
            <div className="report-section">
              <h3>Recently Acquired</h3>
              <div className="date-range-filter">
                <label>From: <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} /></label>
                <label>To: <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} /></label>
              </div>
              <SortableTable
                columns={[
                  { key: 'date', label: 'Date' },
                  { key: 'supplierName', label: 'Supplier' },
                  { key: 'acquisitionType', label: 'Type' },
                  { key: 'itemNames', label: 'Items' },
                  { key: 'total', label: 'Total', render: r => `$${r.total.toFixed(2)}` },
                ]}
                data={recentlyAcquiredReport()}
              />
            </div>
          )}

          <div className="dashboard-tables">
            <div className="dashboard-table-section">
              <h3>Recently Acquired</h3>
              <SortableTable
                columns={[
                  { key: 'date', label: 'Date' },
                  { key: 'supplier', label: 'Supplier' },
                  { key: 'items', label: 'Items' },
                  { key: 'total', label: 'Total' },
                ]}
                data={recentPurchases}
              />
            </div>
            <div className="dashboard-table-section">
              <h3>Recent Sales</h3>
              <SortableTable
                columns={[
                  { key: 'date', label: 'Date' },
                  { key: 'buyer', label: 'Buyer' },
                  { key: 'itemCount', label: 'Items' },
                  { key: 'total', label: 'Total' },
                ]}
                data={recentSales}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
