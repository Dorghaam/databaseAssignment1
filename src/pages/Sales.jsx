import { useState } from 'react';
import { sales as initialSales, contacts, inventoryItems } from '../data/mockData';
import SortableTable from '../components/SortableTable';
import Modal from '../components/Modal';

const emptyLineItem = { itemId: '', quantity: 1, price: 0 };

export default function Sales() {
  const [salesList, setSalesList] = useState(initialSales);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ contactId: '', date: '', lineItems: [{ ...emptyLineItem }] });

  const tableData = salesList.map(s => {
    const contact = contacts.find(c => c.id === s.contactId);
    const total = s.lineItems.reduce((sum, li) => sum + li.price * li.quantity, 0);
    return {
      id: s.id,
      date: s.date,
      buyer: contact ? `${contact.firstName} ${contact.lastName}` : 'Unknown',
      itemCount: s.lineItems.length,
      total,
    };
  });

  const openAdd = () => {
    setForm({ contactId: '', date: '', lineItems: [{ ...emptyLineItem }] });
    setShowModal(true);
  };

  const handleSave = () => {
    const newId = Math.max(...salesList.map(s => s.id), 0) + 1;
    setSalesList([...salesList, {
      id: newId,
      contactId: parseInt(form.contactId),
      date: form.date,
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
      <h1>Sales</h1>

      <div className="toolbar">
        <div className="filters"></div>
        <button className="btn btn-primary" onClick={openAdd}>Add Sale</button>
      </div>

      <SortableTable
        columns={[
          { key: 'date', label: 'Date' },
          { key: 'buyer', label: 'Buyer' },
          { key: 'itemCount', label: 'Items' },
          { key: 'total', label: 'Total', render: r => `$${r.total.toFixed(2)}` },
        ]}
        data={tableData}
      />

      {showModal && (
        <Modal title="Add Sale" onClose={() => setShowModal(false)} onSave={handleSave}>
          <div className="form-grid">
            <label>Contact
              <select value={form.contactId} onChange={e => setForm({ ...form, contactId: e.target.value })}>
                <option value="">Select contact...</option>
                {contacts.map(c => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                ))}
              </select>
            </label>
            <label>Sale Date<input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></label>
          </div>

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
