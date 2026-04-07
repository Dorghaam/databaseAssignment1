import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useToast } from '../contexts/ToastContext'
import SortableTable from '../components/SortableTable'
import SearchBar from '../components/SearchBar'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'

const emptyForm = {
  first_name: '', last_name: '', phone: '', email: '',
  street_address: '', city: '', province: '', postal_code: '',
  roles: [], dealer_type_id: '', specialties: [],
}

const emptySpecialty = { category_id: '', era: '', region: '', format: '' }

export default function Contacts() {
  const [contacts, setContacts] = useState([])
  const [roles, setRoles] = useState([])
  const [dealerTypes, setDealerTypes] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editContact, setEditContact] = useState(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  // fetches contacts with all their related data (roles, dealer info, specialties)
  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from('reading_contact')
      .select(`
        *,
        reading_contact_role(role_id, reading_role(role_name)),
        reading_dealer_info(dealer_type_id, reading_dealer_type(type_name)),
        reading_dealer_specialty(specialty_id, reading_specialty(*, reading_category(category_name)))
      `)
      .order('contact_id')
    if (error) {
      showToast('Failed to load contacts', 'error')
      return
    }
    setContacts(data || [])
    setLoading(false)
  }

  // fetches lookup tables for the form dropdowns
  const fetchLookups = async () => {
    const { data: roleData } = await supabase.from('reading_role').select('*').order('role_id')
    const { data: dtData } = await supabase.from('reading_dealer_type').select('*').order('dealer_type_id')
    const { data: catData } = await supabase.from('reading_category').select('*').order('category_id')
    setRoles(roleData || [])
    setDealerTypes(dtData || [])
    setCategories(catData || [])
  }

  useEffect(() => { fetchContacts(); fetchLookups() }, [])

  // flatten the data so sortable table can work with it
  const tableData = contacts.map(c => {
    const roleNames = (c.reading_contact_role || []).map(cr => cr.reading_role?.role_name).filter(Boolean)
    return {
      ...c,
      id: c.contact_id,
      fullName: `${c.first_name} ${c.last_name}`,
      roleNames,
    }
  })

  const filtered = tableData.filter(c => {
    if (roleFilter && !c.roleNames.includes(roleFilter)) return false
    if (search) {
      const s = search.toLowerCase()
      if (!c.fullName.toLowerCase().includes(s) && !c.email?.toLowerCase().includes(s)) return false
    }
    return true
  })

  const openAdd = () => {
    setEditContact(null)
    setForm({ ...emptyForm, roles: [], specialties: [] })
    setShowModal(true)
  }

  const openEdit = (contact) => {
    setEditContact(contact)
    const roleIds = (contact.reading_contact_role || []).map(cr => cr.role_id)
    const dealerInfo = contact.reading_dealer_info?.[0]
    const specs = (contact.reading_dealer_specialty || []).map(ds => {
      const s = ds.reading_specialty
      return { category_id: s?.category_id || '', era: s?.era || '', region: s?.region || '', format: s?.format || '' }
    })
    setForm({
      first_name: contact.first_name,
      last_name: contact.last_name,
      phone: contact.phone || '',
      email: contact.email || '',
      street_address: contact.street_address || '',
      city: contact.city || '',
      province: contact.province || '',
      postal_code: contact.postal_code || '',
      roles: roleIds,
      dealer_type_id: dealerInfo ? String(dealerInfo.dealer_type_id) : '',
      specialties: specs.length > 0 ? specs : [],
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    // validate required fields
    if (!form.first_name.trim()) {
      showToast('First name is required', 'error')
      return
    }
    if (!form.last_name.trim()) {
      showToast('Last name is required', 'error')
      return
    }

    // figure out which role_id means dealer so we can check if this contact is a dealer
    const dealerRole = roles.find(r => r.role_name === 'Dealer')
    const isDealer = dealerRole && form.roles.includes(dealerRole.role_id)

    if (editContact) {
      // update the contact fields
      const { error } = await supabase.from('reading_contact').update({
        first_name: form.first_name.trim(), last_name: form.last_name.trim(),
        phone: form.phone, email: form.email,
        street_address: form.street_address, city: form.city,
        province: form.province, postal_code: form.postal_code,
      }).eq('contact_id', editContact.contact_id)

      if (error) {
        showToast('Failed to update contact', 'error')
        return
      }

      // wipe old roles and reinsert the new ones
      await supabase.from('reading_contact_role').delete().eq('contact_id', editContact.contact_id)
      if (form.roles.length > 0) {
        await supabase.from('reading_contact_role').insert(
          form.roles.map(rid => ({ contact_id: editContact.contact_id, role_id: rid }))
        )
      }

      // wipe old dealer info and specialties
      await supabase.from('reading_dealer_specialty').delete().eq('contact_id', editContact.contact_id)
      await supabase.from('reading_dealer_info').delete().eq('contact_id', editContact.contact_id)

      // reinsert dealer info if they are a dealer
      if (isDealer) {
        if (form.dealer_type_id) {
          await supabase.from('reading_dealer_info').insert({
            contact_id: editContact.contact_id,
            dealer_type_id: parseInt(form.dealer_type_id),
          })
        }
        for (const spec of form.specialties) {
          if (!spec.category_id) continue
          const { data: newSpec } = await supabase.from('reading_specialty').insert({
            category_id: parseInt(spec.category_id), era: spec.era, region: spec.region, format: spec.format,
          }).select().single()
          await supabase.from('reading_dealer_specialty').insert({
            contact_id: editContact.contact_id, specialty_id: newSpec.specialty_id,
          })
        }
      }

      showToast('Contact updated successfully', 'success')
    } else {
      // create the contact first
      const { data: newContact, error } = await supabase.from('reading_contact').insert({
        first_name: form.first_name.trim(), last_name: form.last_name.trim(),
        phone: form.phone, email: form.email,
        street_address: form.street_address, city: form.city,
        province: form.province, postal_code: form.postal_code,
      }).select().single()

      if (error) {
        showToast('Failed to add contact', 'error')
        return
      }

      // insert roles
      if (form.roles.length > 0) {
        await supabase.from('reading_contact_role').insert(
          form.roles.map(rid => ({ contact_id: newContact.contact_id, role_id: rid }))
        )
      }

      // insert dealer info and specialties if they are a dealer
      if (isDealer) {
        if (form.dealer_type_id) {
          await supabase.from('reading_dealer_info').insert({
            contact_id: newContact.contact_id,
            dealer_type_id: parseInt(form.dealer_type_id),
          })
        }
        for (const spec of form.specialties) {
          if (!spec.category_id) continue
          const { data: newSpec } = await supabase.from('reading_specialty').insert({
            category_id: parseInt(spec.category_id), era: spec.era, region: spec.region, format: spec.format,
          }).select().single()
          await supabase.from('reading_dealer_specialty').insert({
            contact_id: newContact.contact_id, specialty_id: newSpec.specialty_id,
          })
        }
      }

      showToast('Contact added successfully', 'success')
    }

    setShowModal(false)
    fetchContacts()
  }

  const handleDelete = async () => {
    const { error } = await supabase.from('reading_contact').delete().eq('contact_id', deleteTarget.contact_id)
    if (error) {
      showToast('Failed to delete contact. They may be referenced by purchases or sales.', 'error')
      setDeleteTarget(null)
      return
    }
    showToast('Contact deleted successfully', 'success')
    setDeleteTarget(null)
    fetchContacts()
  }

  const toggleRole = (roleId) => {
    setForm(f => ({
      ...f,
      roles: f.roles.includes(roleId) ? f.roles.filter(r => r !== roleId) : [...f.roles, roleId],
    }))
  }

  const updateSpecialty = (index, field, value) => {
    setForm(f => {
      const specs = [...f.specialties]
      specs[index] = { ...specs[index], [field]: value }
      return { ...f, specialties: specs }
    })
  }

  const addSpecialty = () => {
    setForm(f => ({ ...f, specialties: [...f.specialties, { ...emptySpecialty }] }))
  }

  const removeSpecialty = (index) => {
    setForm(f => ({ ...f, specialties: f.specialties.filter((_, i) => i !== index) }))
  }

  // check if the dealer role is currently selected in the form
  const dealerRole = roles.find(r => r.role_name === 'Dealer')
  const formIsDealer = dealerRole && form.roles.includes(dealerRole.role_id)

  if (loading) return <div className="page"><h1>Contacts</h1><p>Loading...</p></div>

  return (
    <div className="page">
      <h1>Contacts</h1>

      <div className="toolbar">
        <div className="filters">
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            {roles.map(r => <option key={r.role_id} value={r.role_name}>{r.role_name}</option>)}
          </select>
          <SearchBar value={search} onChange={setSearch} placeholder="Search name or email..." />
        </div>
        <button className="btn btn-primary" onClick={openAdd}>Add Contact</button>
      </div>

      <SortableTable
        columns={[
          { key: 'fullName', label: 'Name' },
          { key: 'phone', label: 'Phone' },
          { key: 'email', label: 'Email' },
          { key: 'roleNames', label: 'Roles', render: r => (
            <div className="role-tags">
              {r.roleNames.map(role => <span key={role} className="tag">{role}</span>)}
            </div>
          )},
        ]}
        data={filtered}
        actions={(row) => (
          <>
            <button className="btn btn-sm" onClick={(e) => { e.stopPropagation(); openEdit(row) }}>Edit</button>
            <button className="btn btn-sm btn-danger" onClick={(e) => { e.stopPropagation(); setDeleteTarget(row) }}>Delete</button>
          </>
        )}
      />

      {showModal && (
        <Modal title={editContact ? 'Edit Contact' : 'Add Contact'} onClose={() => setShowModal(false)} onSave={handleSave}>
          <div className="form-grid">
            <label>First Name<input type="text" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} /></label>
            <label>Last Name<input type="text" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} /></label>
            <label>Phone<input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></label>
            <label>Email<input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label>
            <label>Street Address<input type="text" value={form.street_address} onChange={e => setForm({ ...form, street_address: e.target.value })} /></label>
            <label>City<input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></label>
            <label>Province<input type="text" value={form.province} onChange={e => setForm({ ...form, province: e.target.value })} /></label>
            <label>Postal Code<input type="text" value={form.postal_code} onChange={e => setForm({ ...form, postal_code: e.target.value })} /></label>
          </div>

          <div className="form-section">
            <h4>Roles</h4>
            <div className="checkbox-group">
              {roles.map(role => (
                <label key={role.role_id} className="checkbox-label">
                  <input type="checkbox" checked={form.roles.includes(role.role_id)} onChange={() => toggleRole(role.role_id)} />
                  {role.role_name}
                </label>
              ))}
            </div>
          </div>

          {formIsDealer && (
            <div className="form-section">
              <h4>Dealer Information</h4>
              <label>Dealer Type
                <select value={form.dealer_type_id} onChange={e => setForm({ ...form, dealer_type_id: e.target.value })}>
                  <option value="">Select...</option>
                  {dealerTypes.map(dt => <option key={dt.dealer_type_id} value={dt.dealer_type_id}>{dt.type_name}</option>)}
                </select>
              </label>

              <h4>Specialties</h4>
              {form.specialties.map((spec, i) => (
                <div key={i} className="specialty-row">
                  <select value={spec.category_id} onChange={e => updateSpecialty(i, 'category_id', e.target.value)}>
                    <option value="">Category...</option>
                    {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
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
          message={`Are you sure you want to delete "${deleteTarget.first_name} ${deleteTarget.last_name}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
