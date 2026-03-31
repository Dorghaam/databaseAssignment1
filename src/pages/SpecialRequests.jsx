import { useState } from 'react';
import { specialRequests as initialRequests, contacts } from '../data/mockData';
import SortableTable from '../components/SortableTable';
import SearchBar from '../components/SearchBar';
import Modal from '../components/Modal';

export default function SpecialRequests() {
  const [requestsList, setRequestsList] = useState(initialRequests);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editRequest, setEditRequest] = useState(null);
  const [form, setForm] = useState({ contactId: '', description: '', dateRequested: '', status: 'Open' });

  const filtered = requestsList.filter(r => {
    if (statusFilter && r.status !== statusFilter) return false;
    return true;
  });

  const tableData = filtered.map(r => {
    const contact = contacts.find(c => c.id === r.contactId);
    return { ...r, contactName: contact ? `${contact.firstName} ${contact.lastName}` : 'Unknown' };
  });

  const openAdd = () => {
    setEditRequest(null);
    setForm({ contactId: '', description: '', dateRequested: '', status: 'Open' });
    setShowModal(true);
  };

  const openEdit = (request) => {
    setEditRequest(request);
    setForm({ contactId: String(request.contactId), description: request.description, dateRequested: request.dateRequested, status: request.status });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editRequest) {
      setRequestsList(requestsList.map(r => r.id === editRequest.id ? {
        ...r,
        contactId: parseInt(form.contactId),
        description: form.description,
        dateRequested: form.dateRequested,
        status: form.status,
      } : r));
    } else {
      const newId = Math.max(...requestsList.map(r => r.id), 0) + 1;
      setRequestsList([...requestsList, {
        id: newId,
        contactId: parseInt(form.contactId),
        description: form.description,
        dateRequested: form.dateRequested,
        status: form.status,
      }]);
    }
    setShowModal(false);
  };

  return (
    <div className="page">
      <h1>Special Requests</h1>

      <div className="toolbar">
        <div className="filters">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Fulfilled">Fulfilled</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>Add Request</button>
      </div>

      <SortableTable
        columns={[
          { key: 'contactName', label: 'Contact' },
          { key: 'description', label: 'Description' },
          { key: 'dateRequested', label: 'Date Requested' },
          { key: 'status', label: 'Status', render: r => (
            <span className={`status-badge status-${r.status.toLowerCase()}`}>{r.status}</span>
          )},
        ]}
        data={tableData}
        actions={(row) => (
          <button className="btn btn-sm" onClick={(e) => { e.stopPropagation(); openEdit(row); }}>Edit</button>
        )}
      />

      {showModal && (
        <Modal title={editRequest ? 'Edit Request' : 'Add Request'} onClose={() => setShowModal(false)} onSave={handleSave}>
          <div className="form-grid">
            <label>Contact
              <select value={form.contactId} onChange={e => setForm({ ...form, contactId: e.target.value })}>
                <option value="">Select contact...</option>
                {contacts.map(c => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                ))}
              </select>
            </label>
            <label>Date Requested<input type="date" value={form.dateRequested} onChange={e => setForm({ ...form, dateRequested: e.target.value })} /></label>
            <label className="full-width">Description<textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></label>
            <label>Status
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="Open">Open</option>
                <option value="Fulfilled">Fulfilled</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </label>
          </div>
        </Modal>
      )}
    </div>
  );
}
