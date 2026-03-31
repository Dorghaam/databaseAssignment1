import { useState } from 'react';
import { marketPrices as initialPrices, inventoryItems } from '../data/mockData';
import SortableTable from '../components/SortableTable';
import Modal from '../components/Modal';

export default function MarketPrices() {
  const [pricesList, setPricesList] = useState(initialPrices);
  const [showModal, setShowModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [form, setForm] = useState({ itemId: '', condition: 'Good', price: '', dateChecked: '', source: 'Website' });

  const tableData = pricesList.map(p => {
    const item = inventoryItems.find(i => i.id === p.itemId);
    return { ...p, itemTitle: item ? item.title : 'Unknown' };
  });

  const openAdd = () => {
    setForm({ itemId: '', condition: 'Good', price: '', dateChecked: '', source: 'Website' });
    setShowModal(true);
  };

  const handleSave = () => {
    const newId = Math.max(...pricesList.map(p => p.id), 0) + 1;
    setPricesList([...pricesList, {
      id: newId,
      itemId: parseInt(form.itemId),
      condition: form.condition,
      price: parseFloat(form.price) || 0,
      dateChecked: form.dateChecked,
      source: form.source,
    }]);
    setShowModal(false);
  };

  // Price history for selected item
  const priceHistory = selectedItemId
    ? pricesList
        .filter(p => p.itemId === selectedItemId)
        .sort((a, b) => b.dateChecked.localeCompare(a.dateChecked))
    : [];

  const historyByCondition = {};
  priceHistory.forEach(p => {
    if (!historyByCondition[p.condition]) historyByCondition[p.condition] = [];
    historyByCondition[p.condition].push(p);
  });

  const selectedItem = inventoryItems.find(i => i.id === selectedItemId);

  return (
    <div className="page">
      <h1>Market Prices</h1>

      <div className="toolbar">
        <div className="filters"></div>
        <button className="btn btn-primary" onClick={openAdd}>Add Price Entry</button>
      </div>

      <SortableTable
        columns={[
          { key: 'itemTitle', label: 'Item' },
          { key: 'condition', label: 'Condition' },
          { key: 'price', label: 'Price', render: r => `$${r.price.toFixed(2)}` },
          { key: 'dateChecked', label: 'Date Checked' },
          { key: 'source', label: 'Source' },
        ]}
        data={tableData}
        onRowClick={(row) => setSelectedItemId(row.itemId)}
      />

      {selectedItemId && (
        <div className="price-history-section">
          <div className="price-history-header">
            <h3>Price History: {selectedItem?.title || 'Unknown'}</h3>
            <button className="btn btn-sm" onClick={() => setSelectedItemId(null)}>Close</button>
          </div>
          {Object.keys(historyByCondition).length === 0 ? (
            <p>No price history available.</p>
          ) : (
            Object.entries(historyByCondition).map(([condition, entries]) => (
              <div key={condition} className="condition-group">
                <h4>{condition}</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Price</th>
                      <th>Date</th>
                      <th>Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map(e => (
                      <tr key={e.id}>
                        <td>${e.price.toFixed(2)}</td>
                        <td>{e.dateChecked}</td>
                        <td>{e.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      )}

      {showModal && (
        <Modal title="Add Price Entry" onClose={() => setShowModal(false)} onSave={handleSave}>
          <div className="form-grid">
            <label>Item
              <select value={form.itemId} onChange={e => setForm({ ...form, itemId: e.target.value })}>
                <option value="">Select item...</option>
                {inventoryItems.map(item => (
                  <option key={item.id} value={item.id}>{item.title}</option>
                ))}
              </select>
            </label>
            <label>Condition
              <select value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })}>
                <option value="Fine">Fine</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </label>
            <label>Price<input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></label>
            <label>Date Checked<input type="date" value={form.dateChecked} onChange={e => setForm({ ...form, dateChecked: e.target.value })} /></label>
            <label>Source
              <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}>
                <option value="Website">Website</option>
                <option value="Auction House">Auction House</option>
                <option value="Dealer Catalogue">Dealer Catalogue</option>
                <option value="Phone Quote">Phone Quote</option>
              </select>
            </label>
          </div>
        </Modal>
      )}
    </div>
  );
}
