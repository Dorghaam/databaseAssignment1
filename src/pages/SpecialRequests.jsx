import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import SortableTable from '../components/SortableTable'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'

export default function SpecialRequests() {
  const [requests, setRequests] = useState([])
  const [contacts, setContacts] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editRequest, setEditRequest] = useState(null)
  const [form, setForm] = useState({ contact_id: '', description: '', date_requested: '', status: 'Open' })
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('reading_special_request')
      .select('*, reading_contact(first_name, last_name)')
      .order('date_requested', { ascending: false })
    setRequests(data || [])
    setLoading(false)
  }

  const fetchContacts = async () => {
    const { data } = await supabase.from('reading_contact').select('contact_id, first_name, last_name').order('last_name')
    setContacts(data || [])
  }

  useEffect(() => { fetchRequests(); fetchContacts() }, [])

  const tableData = (requests).filter(r => {
    if (statusFilter && r.status !== statusFilter) return false
    return true
  }).map(r => ({
    ...r,
    id: r.request_id,
    contactName: r.reading_contact ? `${r.reading_contact.first_name} ${r.reading_contact.last_name}` : 'Unknown',
  }))

  const openAdd = () => {
    setEditRequest(null)
    setForm({ contact_id: '', description: '', date_requested: '', status: 'Open' })
    setShowModal(true)
  }

  const openEdit = (row) => {
    setEditRequest(row)
    setForm({
      contact_id: String(row.contact_id),
      description: row.description,
      date_requested: row.date_requested,
      status: row.status,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    const payload = {
      contact_id: parseInt(form.contact_id),
      description: form.description,
      date_requested: form.date_requested,
      status: form.status,
    }
    if (editRequest) {
      await supabase.from('reading_special_request').update(payload).eq('request_id', editRequest.request_id)
    } else {
      await supabase.from('reading_special_request').insert(payload)
    }
    setShowModal(false)
    fetchRequests()
  }

  const handleDelete = async () => {
    await supabase.from('reading_special_request').delete().eq('request_id', deleteTarget.request_id)
    setDeleteTarget(null)
    fetchRequests()
  }

  if (loading) return <div className="page"><h1>Special Requests</h1><p>Loading...</p></div>

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
          { key: 'date_requested', label: 'Date Requested' },
          { key: 'status', label: 'Status', render: r => (
            <span className={`status-badge status-${r.status.toLowerCase()}`}>{r.status}</span>
          )},
        ]}
        data={tableData}
        actions={(row) => (
          <>
            <button className="btn btn-sm" onClick={(e) => { e.stopPropagation(); openEdit(row) }}>Edit</button>
            <button className="btn btn-sm btn-danger" onClick={(e) => { e.stopPropagation(); setDeleteTarget(row) }}>Delete</button>
          </>
        )}
      />

      {showModal && (
        <Modal title={editRequest ? 'Edit Request' : 'Add Request'} onClose={() => setShowModal(false)} onSave={handleSave}>
          <div className="form-grid">
            <label>Contact
              <select value={form.contact_id} onChange={e => setForm({ ...form, contact_id: e.target.value })}>
                <option value="">Select contact...</option>
                {contacts.map(c => <option key={c.contact_id} value={c.contact_id}>{c.first_name} {c.last_name}</option>)}
              </select>
            </label>
            <label>Date Requested<input type="date" value={form.date_requested} onChange={e => setForm({ ...form, date_requested: e.target.value })} /></label>
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

      {deleteTarget && (
        <ConfirmDialog
          message={`Are you sure you want to delete this request?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
