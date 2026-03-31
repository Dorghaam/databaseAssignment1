import { useState } from 'react';
import { inventoryItems as initialItems } from '../data/mockData';
import SortableTable from '../components/SortableTable';
import SearchBar from '../components/SearchBar';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const emptyItem = { title: '', category: 'Book', description: '', era: '', region: '', format: '', condition: 'Good', quantity: 1 };

export default function Inventory() {
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyItem);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = items.filter(item => {
    if (categoryFilter && item.category !== categoryFilter) return false;
    if (conditionFilter && item.condition !== conditionFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!item.title.toLowerCase().includes(s) && !item.description.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const openAdd = () => {
    setEditItem(null);
    setForm(emptyItem);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ title: item.title, category: item.category, description: item.description, era: item.era, region: item.region, format: item.format, condition: item.condition, quantity: item.quantity });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editItem) {
      setItems(items.map(i => i.id === editItem.id ? { ...i, ...form } : i));
    } else {
      const newId = Math.max(...items.map(i => i.id), 0) + 1;
      setItems([...items, { ...form, id: newId, price: 0, dateAcquired: new Date().toISOString().split('T')[0] }]);
    }
    setShowModal(false);
  };

  const handleDelete = () => {
    setItems(items.filter(i => i.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const updateForm = (field, value) => setForm({ ...form, [field]: value });

  return (
    <div className="page">
      <h1>Inventory</h1>

      <div className="toolbar">
        <div className="filters">
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            <option value="Book">Book</option>
            <option value="Map">Map</option>
            <option value="Periodical">Periodical</option>
          </select>
          <select value={conditionFilter} onChange={e => setConditionFilter(e.target.value)}>
            <option value="">All Conditions</option>
            <option value="Fine">Fine</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
          </select>
          <SearchBar value={search} onChange={setSearch} placeholder="Search title or keyword..." />
        </div>
        <button className="btn btn-primary" onClick={openAdd}>Add Item</button>
      </div>

      <SortableTable
        columns={[
          { key: 'title', label: 'Title' },
          { key: 'category', label: 'Category' },
          { key: 'condition', label: 'Condition' },
          { key: 'quantity', label: 'Qty' },
          { key: 'price', label: 'Market Price', render: r => `$${r.price.toFixed(2)}` },
        ]}
        data={filtered}
        actions={(row) => (
          <>
            <button className="btn btn-sm" onClick={(e) => { e.stopPropagation(); openEdit(row); }}>Edit</button>
            <button className="btn btn-sm btn-danger" onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }}>Delete</button>
          </>
        )}
      />

      {showModal && (
        <Modal title={editItem ? 'Edit Item' : 'Add Item'} onClose={() => setShowModal(false)} onSave={handleSave}>
          <div className="form-grid">
            <label>Title<input type="text" value={form.title} onChange={e => updateForm('title', e.target.value)} /></label>
            <label>Category
              <select value={form.category} onChange={e => updateForm('category', e.target.value)}>
                <option value="Book">Book</option>
                <option value="Map">Map</option>
                <option value="Periodical">Periodical</option>
              </select>
            </label>
            <label className="full-width">Description<textarea value={form.description} onChange={e => updateForm('description', e.target.value)} rows={3} /></label>
            <label>Era<input type="text" value={form.era} onChange={e => updateForm('era', e.target.value)} /></label>
            <label>Region<input type="text" value={form.region} onChange={e => updateForm('region', e.target.value)} /></label>
            <label>Format<input type="text" value={form.format} onChange={e => updateForm('format', e.target.value)} /></label>
            <label>Condition
              <select value={form.condition} onChange={e => updateForm('condition', e.target.value)}>
                <option value="Fine">Fine</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </label>
            <label>Quantity<input type="number" min="0" value={form.quantity} onChange={e => updateForm('quantity', parseInt(e.target.value) || 0)} /></label>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Are you sure you want to delete "${deleteTarget.title}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
