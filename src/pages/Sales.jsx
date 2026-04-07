import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useToast } from '../contexts/ToastContext'
import SortableTable from '../components/SortableTable'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'

const emptyLineItem = { item_id: '', quantity: 1, price: '' }

export default function Sales() {
  const [sales, setSales] = useState([])
  const [contacts, setContacts] = useState([])
  const [items, setItems] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editSale, setEditSale] = useState(null)
  const [form, setForm] = useState({ contact_id: '', sale_date: '', lineItems: [{ ...emptyLineItem }] })
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  const fetchSales = async () => {
    const { data, error } = await supabase
      .from('reading_sale')
      .select(`
        *,
        reading_contact(first_name, last_name),
        reading_sale_item(*, reading_item(title))
      `)
      .order('sale_date', { ascending: false })
    if (error) {
      showToast('Failed to load sales', 'error')
      return
    }
    setSales(data || [])
    setLoading(false)
  }

  const fetchLookups = async () => {
    const { data: c } = await supabase.from('reading_contact').select('contact_id, first_name, last_name').order('last_name')
    const { data: i } = await supabase.from('reading_item').select('item_id, title').order('title')
    setContacts(c || [])
    setItems(i || [])
  }

  useEffect(() => { fetchSales(); fetchLookups() }, [])

  const tableData = sales.map(s => {
    const contact = s.reading_contact
    const lineItems = s.reading_sale_item || []
    const total = lineItems.reduce((sum, li) => sum + li.sale_price * li.quantity, 0)
    return {
      ...s,
      id: s.sale_id,
      buyer: contact ? `${contact.first_name} ${contact.last_name}` : 'Unknown',
      itemCount: lineItems.length,
      total,
    }
  })

  const openAdd = () => {
    setEditSale(null)
    setForm({ contact_id: '', sale_date: '', lineItems: [{ ...emptyLineItem }] })
    setShowModal(true)
  }

  const openEdit = (sale) => {
    setEditSale(sale)
    const lineItems = (sale.reading_sale_item || []).map(li => ({
      item_id: String(li.item_id),
      quantity: li.quantity,
      price: li.sale_price,
    }))
    setForm({
      contact_id: String(sale.contact_id),
      sale_date: sale.sale_date,
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
    if (!form.sale_date) {
      showToast('Sale date is required', 'error')
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
      sale_price: Math.round(parseFloat(li.price) * 100) / 100,
    }))

    if (editSale) {
      // reverse old quantities (undo the decreases from the original sale)
      const oldLines = editSale.reading_sale_item || []
      for (const li of oldLines) {
        await updateQty(li.item_id, li.quantity)
      }

      // delete old line items then update the sale header
      await supabase.from('reading_sale_item').delete().eq('sale_id', editSale.sale_id)
      const { error } = await supabase.from('reading_sale').update({
        contact_id: parseInt(form.contact_id),
        sale_date: form.sale_date,
      }).eq('sale_id', editSale.sale_id)

      if (error) {
        showToast('Failed to update sale', 'error')
        return
      }

      // insert new line items and decrease quantities
      for (const li of parsedLines) {
        await supabase.from('reading_sale_item').insert({ sale_id: editSale.sale_id, ...li })
        await updateQty(li.item_id, -li.quantity)
      }

      showToast('Sale updated successfully', 'success')
    } else {
      // create the sale
      const { data: newSale, error } = await supabase.from('reading_sale').insert({
        contact_id: parseInt(form.contact_id),
        sale_date: form.sale_date,
      }).select().single()

      if (error) {
        showToast('Failed to add sale', 'error')
        return
      }

      // insert line items and decrease quantities
      for (const li of parsedLines) {
        await supabase.from('reading_sale_item').insert({ sale_id: newSale.sale_id, ...li })
        await updateQty(li.item_id, -li.quantity)
      }

      showToast('Sale added successfully', 'success')
    }

    setShowModal(false)
    fetchSales()
  }

  const handleDelete = async () => {
    // reverse quantities before deleting (undo the decreases)
    const oldLines = deleteTarget.reading_sale_item || []
    for (const li of oldLines) {
      await updateQty(li.item_id, li.quantity)
    }
    const { error } = await supabase.from('reading_sale').delete().eq('sale_id', deleteTarget.sale_id)
    if (error) {
      showToast('Failed to delete sale', 'error')
      setDeleteTarget(null)
      return
    }
    showToast('Sale deleted successfully', 'success')
    setDeleteTarget(null)
    fetchSales()
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

  if (loading) return <div className="page"><h1>Sales</h1><p>Loading...</p></div>

  return (
    <div className="page">
      <h1>Sales</h1>

      <div className="toolbar">
        <div className="filters"></div>
        <button className="btn btn-primary" onClick={openAdd}>Add Sale</button>
      </div>

      <SortableTable
        columns={[
          { key: 'sale_date', label: 'Date' },
          { key: 'buyer', label: 'Buyer' },
          { key: 'itemCount', label: 'Items' },
          { key: 'total', label: 'Total', render: r => `$${r.total.toFixed(2)}` },
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
        <Modal title={editSale ? 'Edit Sale' : 'Add Sale'} onClose={() => setShowModal(false)} onSave={handleSave}>
          <div className="form-grid">
            <label>Contact
              <select value={form.contact_id} onChange={e => setForm({ ...form, contact_id: e.target.value })}>
                <option value="">Select contact...</option>
                {contacts.map(c => <option key={c.contact_id} value={c.contact_id}>{c.first_name} {c.last_name}</option>)}
              </select>
            </label>
            <label>Sale Date<input type="date" value={form.sale_date} onChange={e => setForm({ ...form, sale_date: e.target.value })} /></label>
          </div>

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
          message="Are you sure you want to delete this sale? Quantity on hand will be reversed."
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
