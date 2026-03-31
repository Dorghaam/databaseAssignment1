import { useState } from 'react';
import { purchases as initialPurchases, contacts, inventoryItems } from '../data/mockData';
import SortableTable from '../components/SortableTable';
import Modal from '../components/Modal';

const emptyLineItem = { itemId: '', quantity: 1, price: 0 };

export default function Purchases() {
  const [purchasesList, setPurchasesList] = useState(initialPurchases);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ contactId: '', date: '', acquisitionType: 'Individual', donationNote: '', lineItems: [{ ...emptyLineItem }] });

  const tableData = purchasesList.map(p => {
    const contact = contacts.find(c => c.id === p.contactId);
    const total = p.lineItems.reduce((sum, li) => sum + li.price * li.quantity, 0);
    return {
      id: p.id,
      date: p.date,
      supplier: contact ? `${contact.firstName} ${contact.lastName}` : 'Unknown',
      acquisitionType: p.acquisitionType,
      itemCount: p.lineItems.length,
      total,
    };
  });

  const openAdd = () => {
    setForm({ contactId: '', date: '', acquisitionType: 'Individual', donationNote: '', lineItems: [{ ...emptyLineItem }] });
    setShowModal(true);
  };

  const handleSave = () => {
    const newId = Math.max(...purchasesList.map(p => p.id), 0) + 1;
    setPurchasesList([...purchasesList, {
      id: newId,
      contactId: parseInt(form.contactId),
      date: form.date,
      acquisitionType: form.acquisitionType,
      donationNote: form.donationNote,
      lineItems: form.lineItems.map(li => ({ itemId: parseInt(li.itemId), quantity: parseInt(li.quantity) || 1, price: parseFloat(li.price) || 0 })),
    }]);
    setShowModal(false);
  };

  const updateLineItem = (index, field, value) => {
    setForm(f => {
      const items = [...f.lineItems];
      items[index] = { ...items[index], [field]: value };
      return { ...f, lineItems: items };
    });
  };

  const addLineItem = () => {
    setForm(f => ({ ...f, lineItems: [...f.lineItems, { ...emptyLineItem }] }));
  };

  const removeLineItem = (index) => {
    setForm(f => ({ ...f, lineItems: f.lineItems.filter((_, i) => i !== index) }));
  };

  return (
    <div className="page">
      <h1>Purchases</h1>

      <div className="toolbar">
        <div className="filters"></div>
        <button className="btn btn-primary" onClick={openAdd}>Add Purchase</button>
      </div>

      <SortableTable
        columns={[
          { key: 'date', label: 'Date' },
          { key: 'supplier', label: 'Supplier' },
          { key: 'acquisitionType', label: 'Acquisition Type' },
          { key: 'itemCount', label: 'Items' },
          { key: 'total', label: 'Total Cost', render: r => `$${r.total.toFixed(2)}` },
        ]}
        data={tableData}
      />

      {showModal && (
        <Modal title="Add Purchase" onClose={() => setShowModal(false)} onSave={handleSave}>
          <div className="form-grid">
            <label>Contact
              <select value={form.contactId} onChange={e => setForm({ ...form, contactId: e.target.value })}>
                <option value="">Select contact...</option>
                {contacts.map(c => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                ))}
              </select>
            </label>
            <label>Purchase Date<input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></label>
            <label>Acquisition Type
              <select value={form.acquisitionType} onChange={e => setForm({ ...form, acquisitionType: e.target.value })}>
                <option value="Individual">Individual</option>
                <option value="Dealer">Dealer</option>
                <option value="Estate">Estate</option>
              </select>
            </label>
          </div>

          {form.acquisitionType === 'Estate' && (
            <div className="form-section">
              <label className="full-width">Donation Note<textarea value={form.donationNote} onChange={e => setForm({ ...form, donationNote: e.target.value })} rows={3} placeholder="Notes about items sent to libraries..." /></label>
            </div>
          )}

          <div className="form-section">
            <h4>Line Items</h4>
            {form.lineItems.map((li, i) => (
              <div key={i} className="line-item-row">
                <select value={li.itemId} onChange={e => updateLineItem(i, 'itemId', e.target.value)}>
                  <option value="">Select item...</option>
                  {inventoryItems.map(item => (
                    <option key={item.id} value={item.id}>{item.title}</option>
                  ))}
                </select>
                <input type="number" min="1" placeholder="Qty" value={li.quantity} onChange={e => updateLineItem(i, 'quantity', e.target.value)} />
                <input type="number" min="0" step="0.01" placeholder="Price" value={li.price} onChange={e => updateLineItem(i, 'price', e.target.value)} />
                {form.lineItems.length > 1 && (
                  <button className="btn btn-sm btn-danger" onClick={() => removeLineItem(i)}>Remove</button>
                )}
              </div>
            ))}
            <button className="btn btn-sm" onClick={addLineItem}>Add Another Item</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
