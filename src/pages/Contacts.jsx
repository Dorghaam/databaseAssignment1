import { useState } from 'react';
import { contacts as initialContacts } from '../data/mockData';
import SortableTable from '../components/SortableTable';
import SearchBar from '../components/SearchBar';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const emptyContact = {
  firstName: '', lastName: '', phone: '', email: '',
  street: '', city: '', province: '', postalCode: '',
  roles: [], dealerType: '', specialties: [],
};

const emptySpecialty = { category: 'Book', era: '', region: '', format: '' };

export default function Contacts() {
  const [contactsList, setContactsList] = useState(initialContacts);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [form, setForm] = useState(emptyContact);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = contactsList.filter(c => {
    if (roleFilter && !c.roles.includes(roleFilter)) return false;
    if (search) {
      const s = search.toLowerCase();
      const name = `${c.firstName} ${c.lastName}`.toLowerCase();
      if (!name.includes(s) && !c.email.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const openAdd = () => {
    setEditContact(null);
    setForm({ ...emptyContact, roles: [], specialties: [] });
    setShowModal(true);
  };

  const openEdit = (contact) => {
    setEditContact(contact);
    setForm({
      firstName: contact.firstName, lastName: contact.lastName,
      phone: contact.phone, email: contact.email,
      street: contact.street, city: contact.city,
      province: contact.province, postalCode: contact.postalCode,
      roles: [...contact.roles], dealerType: contact.dealerType || '',
      specialties: contact.specialties ? contact.specialties.map(s => ({ ...s })) : [],
    });
    setShowModal(true);
  };

  const handleSave = () => {
    const data = {
      ...form,
      dealerType: form.roles.includes('Dealer') ? form.dealerType : null,
      specialties: form.roles.includes('Dealer') ? form.specialties : [],
    };
    if (editContact) {
      setContactsList(contactsList.map(c => c.id === editContact.id ? { ...c, ...data } : c));
    } else {
      const newId = Math.max(...contactsList.map(c => c.id), 0) + 1;
      setContactsList([...contactsList, { ...data, id: newId }]);
    }
    setShowModal(false);
  };

  const handleDelete = () => {
    setContactsList(contactsList.filter(c => c.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const toggleRole = (role) => {
    setForm(f => ({
      ...f,
      roles: f.roles.includes(role) ? f.roles.filter(r => r !== role) : [...f.roles, role],
    }));
  };

  const updateSpecialty = (index, field, value) => {
    setForm(f => {
      const specs = [...f.specialties];
      specs[index] = { ...specs[index], [field]: value };
      return { ...f, specialties: specs };
    });
  };

  const addSpecialty = () => {
    setForm(f => ({ ...f, specialties: [...f.specialties, { ...emptySpecialty }] }));
  };

  const removeSpecialty = (index) => {
    setForm(f => ({ ...f, specialties: f.specialties.filter((_, i) => i !== index) }));
  };

  return (
    <div className="page">
      <h1>Contacts</h1>

      <div className="toolbar">
        <div className="filters">
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="Customer">Customer</option>
            <option value="Collector">Collector</option>
            <option value="Dealer">Dealer</option>
            <option value="Estate Contact">Estate Contact</option>
          </select>
          <SearchBar value={search} onChange={setSearch} placeholder="Search name or email..." />
        </div>
        <button className="btn btn-primary" onClick={openAdd}>Add Contact</button>
      </div>

      <SortableTable
        columns={[
          { key: 'name', label: 'Name', render: r => `${r.firstName} ${r.lastName}` },
          { key: 'phone', label: 'Phone' },
          { key: 'email', label: 'Email' },
          { key: 'roles', label: 'Roles', render: r => (
            <div className="role-tags">
              {r.roles.map(role => <span key={role} className="tag">{role}</span>)}
            </div>
          )},
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
        <Modal title={editContact ? 'Edit Contact' : 'Add Contact'} onClose={() => setShowModal(false)} onSave={handleSave}>
          <div className="form-grid">
            <label>First Name<input type="text" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} /></label>
            <label>Last Name<input type="text" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} /></label>
            <label>Phone<input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></label>
            <label>Email<input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label>
            <label>Street Address<input type="text" value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} /></label>
            <label>City<input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></label>
            <label>Province<input type="text" value={form.province} onChange={e => setForm({ ...form, province: e.target.value })} /></label>
            <label>Postal Code<input type="text" value={form.postalCode} onChange={e => setForm({ ...form, postalCode: e.target.value })} /></label>
          </div>

          <div className="form-section">
            <h4>Roles</h4>
            <div className="checkbox-group">
              {['Customer', 'Collector', 'Dealer', 'Estate Contact'].map(role => (
                <label key={role} className="checkbox-label">
                  <input type="checkbox" checked={form.roles.includes(role)} onChange={() => toggleRole(role)} />
                  {role}
                </label>
              ))}
            </div>
          </div>

          {form.roles.includes('Dealer') && (
            <div className="form-section">
              <h4>Dealer Information</h4>
              <label>Dealer Type
                <select value={form.dealerType} onChange={e => setForm({ ...form, dealerType: e.target.value })}>
                  <option value="">Select...</option>
                  <option value="Auction House">Auction House</option>
                  <option value="Brokerage">Brokerage</option>
                  <option value="Emporium">Emporium</option>
                  <option value="Individual">Individual</option>
                </select>
              </label>

              <h4>Specialties</h4>
              {form.specialties.map((spec, i) => (
                <div key={i} className="specialty-row">
                  <select value={spec.category} onChange={e => updateSpecialty(i, 'category', e.target.value)}>
                    <option value="Book">Book</option>
                    <option value="Map">Map</option>
                    <option value="Periodical">Periodical</option>
                  </select>
                  <input type="text" placeholder="Era" value={spec.era} onChange={e => updateSpecialty(i, 'era', e.target.value)} />
                  <input type="text" placeholder="Region" value={spec.region} onChange={e => updateSpecialty(i, 'region', e.target.value)} />
                  <input type="text" placeholder="Format" value={spec.format} onChange={e => updateSpecialty(i, 'format', e.target.value)} />
                  <button className="btn btn-sm btn-danger" onClick={() => removeSpecialty(i)}>Remove</button>
                </div>
              ))}
              <button className="btn btn-sm" onClick={addSpecialty}>Add Specialty</button>
            </div>
          )}
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Are you sure you want to delete "${deleteTarget.firstName} ${deleteTarget.lastName}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
