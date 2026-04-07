import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useToast } from '../contexts/ToastContext'
import SortableTable from '../components/SortableTable'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'

const emptyLineItem = { item_id: '', quantity: 1, price: '' }

export default function Purchases() {
  const [purchases, setPurchases] = useState([])
  const [contacts, setContacts] = useState([])
  const [items, setItems] = useState([])
  const [acqTypes, setAcqTypes] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editPurchase, setEditPurchase] = useState(null)
  const [form, setForm] = useState({ contact_id: '', purchase_date: '', acquisition_type_id: '', estate_donation_note: '', lineItems: [{ ...emptyLineItem }] })
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  const fetchPurchases = async () => {
    const { data, error } = await supabase
      .from('reading_purchase')
      .select(`
        *,
        reading_contact(first_name, last_name),
        reading_acquisition_type(type_name),
        reading_purchase_item(*, reading_item(title))
      `)
      .order('purchase_date', { ascending: false })
    if (error) {
      showToast('Failed to load purchases', 'error')
      return
    }
    setPurchases(data || [])
    setLoading(false)
  }

  const fetchLookups = async () => {
    const { data: c } = await supabase.from('reading_contact').select('contact_id, first_name, last_name').order('last_name')
    const { data: i } = await supabase.from('reading_item').select('item_id, title').order('title')
    const { data: a } = await supabase.from('reading_acquisition_type').select('*').order('acquisition_type_id')
    setContacts(c || [])
    setItems(i || [])
    setAcqTypes(a || [])
  }

  useEffect(() => { fetchPurchases(); fetchLookups() }, [])

  const tableData = purchases.map(p => {
    const contact = p.reading_contact
    const lineItems = p.reading_purchase_item || []
    const total = lineItems.reduce((sum, li) => sum + li.purchase_price * li.quantity, 0)
    return {
      ...p,
      id: p.purchase_id,
      supplier: contact ? `${contact.first_name} ${contact.last_name}` : 'Unknown',
      typeName: p.reading_acquisition_type?.type_name || '',
      itemCount: lineItems.length,
      total,
    }
  })

  // checks which acquisition type is estate so we know when to show the donation note field
  const estateType = acqTypes.find(a => a.type_name === 'Estate')

  const openAdd = () => {
    setEditPurchase(null)
    setForm({ contact_id: '', purchase_date: '', acquisition_type_id: '', estate_donation_note: '', lineItems: [{ ...emptyLineItem }] })
    setShowModal(true)
  }

  const openEdit = (purchase) => {
    setEditPurchase(purchase)
    const lineItems = (purchase.reading_purchase_item || []).map(li => ({
      item_id: String(li.item_id),
      quantity: li.quantity,
      price: li.purchase_price,
    }))
    setForm({
      contact_id: String(purchase.contact_id),
      purchase_date: purchase.purchase_date,
      acquisition_type_id: String(purchase.acquisition_type_id),
      estate_donation_note: purchase.estate_donation_note || '',
      lineItems: lineItems.length > 0 ? lineItems : [{ ...emptyLineItem }],
    })
    setShowModal(true)
  }

  // helper to update an items quantity on hand
  const updateQty = async (itemId, change) => {
    const { data: item } = await supabase.from('reading_item').select('quantity_on_hand').eq('item_id', itemId).single()
    if (item) {
      await supabase.from('reading_item').update({ quantity_on_hand: item.quantity_on_hand + change }).eq('item_id', itemId)
    }
  }

  const handleSave = async () => {
    // validate required fields
    if (!form.contact_id) {
      showToast('Please select a contact', 'error')
      return
    }
    if (!form.purchase_date) {
      showToast('Purchase date is required', 'error')
      return
    }
    if (!form.acquisition_type_id) {
      showToast('Please select an acquisition type', 'error')
      return
    }

    // validate line items
    const validLines = form.lineItems.filter(li => li.item_id)
    if (validLines.length === 0) {
      showToast('Please add at least one item', 'error')
      return
    }

    // validate prices and quantities for each line item
    for (let i = 0; i < validLines.length; i++) {
      const li = validLines[i]
      const price = parseFloat(li.price)
      const qty = parseInt(li.quantity)

      // check if price is a valid number
      if (li.price === '' || isNaN(price)) {
        showToast(`Item ${i + 1}: price must be a valid number`, 'error')
        return
      }
      // check for negative price
      if (price < 0) {
        showToast(`Item ${i + 1}: price cannot be negative`, 'error')
        return
      }
      // check for infinite or unreasonable values
      if (!isFinite(price)) {
        showToast(`Item ${i + 1}: price is not a valid number`, 'error')
        return
      }
      // check quantity
      if (isNaN(qty) || qty < 1) {
        showToast(`Item ${i + 1}: quantity must be at least 1`, 'error')
        return
      }
    }

    // round prices to 2 decimal places to avoid floating point issues
    const parsedLines = validLines.map(li => ({
      item_id: parseInt(li.item_id),
      quantity: parseInt(li.quantity) || 1,
      purchase_price: Math.round(parseFloat(li.price) * 100) / 100,
    }))

    if (editPurchase) {
      // reverse old quantities (undo the increases from the original purchase)
      const oldLines = editPurchase.reading_purchase_item || []
      for (const li of oldLines) {
        await updateQty(li.item_id, -li.quantity)
      }

      // delete old line items then update the purchase header
      await supabase.from('reading_purchase_item').delete().eq('purchase_id', editPurchase.purchase_id)
      const { error } = await supabase.from('reading_purchase').update({
        contact_id: parseInt(form.contact_id),
        purchase_date: form.purchase_date,
        acquisition_type_id: parseInt(form.acquisition_type_id),
        estate_donation_note: form.estate_donation_note || null,
      }).eq('purchase_id', editPurchase.purchase_id)

      if (error) {
        showToast('Failed to update purchase', 'error')
        return
      }

      // insert new line items and increase quantities
      for (const li of parsedLines) {
        await supabase.from('reading_purchase_item').insert({ purchase_id: editPurchase.purchase_id, ...li })
        await updateQty(li.item_id, li.quantity)
      }

      showToast('Purchase updated successfully', 'success')
    } else {
      // create the purchase
      const { data: newPurchase, error } = await supabase.from('reading_purchase').insert({
        contact_id: parseInt(form.contact_id),
        purchase_date: form.purchase_date,
        acquisition_type_id: parseInt(form.acquisition_type_id),
        estate_donation_note: form.estate_donation_note || null,
      }).select().single()

      if (error) {
        showToast('Failed to add purchase', 'error')
        return
      }

      // insert line items and increase quantities
      for (const li of parsedLines) {
        await supabase.from('reading_purchase_item').insert({ purchase_id: newPurchase.purchase_id, ...li })
        await updateQty(li.item_id, li.quantity)
      }

      showToast('Purchase added successfully', 'success')
    }

    setShowModal(false)
    fetchPurchases()
  }

  const handleDelete = async () => {
    // reverse quantities before deleting (undo the increases)
    const oldLines = deleteTarget.reading_purchase_item || []
    for (const li of oldLines) {
      await updateQty(li.item_id, -li.quantity)
    }
    const { error } = await supabase.from('reading_purchase').delete().eq('purchase_id', deleteTarget.purchase_id)
    if (error) {
      showToast('Failed to delete purchase', 'error')
      setDeleteTarget(null)
      return
    }
    showToast('Purchase deleted successfully', 'success')
    setDeleteTarget(null)
    fetchPurchases()
  }

  const updateLineItem = (index, field, value) => {
    setForm(f => {
      const items = [...f.lineItems]
      items[index] = { ...items[index], [field]: value }
      return { ...f, lineItems: items }
    })
  }

  const addLineItem = () => {
    setForm(f => ({ ...f, lineItems: [...f.lineItems, { ...emptyLineItem }] }))
  }

  const removeLineItem = (index) => {
    setForm(f => ({ ...f, lineItems: f.lineItems.filter((_, i) => i !== index) }))
  }

  if (loading) return <div className="page"><h1>Purchases</h1><p>Loading...</p></div>

  return (
    <div className="page">
      <h1>Purchases</h1>

      <div className="toolbar">
        <div className="filters"></div>
        <button className="btn btn-primary" onClick={openAdd}>Add Purchase</button>
      </div>

      <SortableTable
        columns={[
          { key: 'purchase_date', label: 'Date' },
          { key: 'supplier', label: 'Supplier' },
          { key: 'typeName', label: 'Acquisition Type' },
          { key: 'itemCount', label: 'Items' },
          { key: 'total', label: 'Total Cost', render: r => `$${r.total.toFixed(2)}` },
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
        <Modal title={editPurchase ? 'Edit Purchase' : 'Add Purchase'} onClose={() => setShowModal(false)} onSave={handleSave}>
          <div className="form-grid">
            <label>Contact
              <select value={form.contact_id} onChange={e => setForm({ ...form, contact_id: e.target.value })}>
                <option value="">Select contact...</option>
                {contacts.map(c => <option key={c.contact_id} value={c.contact_id}>{c.first_name} {c.last_name}</option>)}
              </select>
            </label>
            <label>Purchase Date<input type="date" value={form.purchase_date} onChange={e => setForm({ ...form, purchase_date: e.target.value })} /></label>
            <label>Acquisition Type
              <select value={form.acquisition_type_id} onChange={e => setForm({ ...form, acquisition_type_id: e.target.value })}>
                <option value="">Select...</option>
                {acqTypes.map(a => <option key={a.acquisition_type_id} value={a.acquisition_type_id}>{a.type_name}</option>)}
              </select>
            </label>
          </div>

          {estateType && form.acquisition_type_id === String(estateType.acquisition_type_id) && (
            <div className="form-section">
              <label className="full-width">Donation Note<textarea value={form.estate_donation_note} onChange={e => setForm({ ...form, estate_donation_note: e.target.value })} rows={3} placeholder="Notes about items sent to libraries..." /></label>
            </div>
          )}

          <div className="form-section">
            <h4>Line Items</h4>
            {form.lineItems.map((li, i) => (
              <div key={i} className="line-item-row">
                <select value={li.item_id} onChange={e => updateLineItem(i, 'item_id', e.target.value)}>
                  <option value="">Select item...</option>
                  {items.map(item => <option key={item.item_id} value={item.item_id}>{item.title}</option>)}
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

      {deleteTarget && (
        <ConfirmDialog
          message="Are you sure you want to delete this purchase? Quantity on hand will be reversed."
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
