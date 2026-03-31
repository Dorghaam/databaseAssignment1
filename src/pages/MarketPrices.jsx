import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import SortableTable from '../components/SortableTable'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'

export default function MarketPrices() {
  const [prices, setPrices] = useState([])
  const [items, setItems] = useState([])
  const [conditions, setConditions] = useState([])
  const [selectedItemId, setSelectedItemId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editPrice, setEditPrice] = useState(null)
  const [form, setForm] = useState({ item_id: '', condition_id: '', price: '', date_checked: '', source: 'Website' })
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchPrices = async () => {
    const { data } = await supabase
      .from('reading_market_price')
      .select('*, reading_item(title), reading_condition(condition_name)')
      .order('date_checked', { ascending: false })
    setPrices(data || [])
    setLoading(false)
  }

  const fetchLookups = async () => {
    const { data: itemData } = await supabase.from('reading_item').select('item_id, title').order('title')
    const { data: condData } = await supabase.from('reading_condition').select('*').order('condition_id')
    setItems(itemData || [])
    setConditions(condData || [])
  }

  useEffect(() => { fetchPrices(); fetchLookups() }, [])

  const tableData = prices.map(p => ({
    ...p,
    id: p.market_price_id,
    itemTitle: p.reading_item?.title || 'Unknown',
    conditionName: p.reading_condition?.condition_name || '',
  }))

  const openAdd = () => {
    setEditPrice(null)
    setForm({ item_id: '', condition_id: '', price: '', date_checked: '', source: 'Website' })
    setShowModal(true)
  }

  const openEdit = (row) => {
    setEditPrice(row)
    setForm({
      item_id: String(row.item_id),
      condition_id: String(row.condition_id),
      price: String(row.price),
      date_checked: row.date_checked,
      source: row.source,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    const payload = {
      item_id: parseInt(form.item_id),
      condition_id: parseInt(form.condition_id),
      price: parseFloat(form.price) || 0,
      date_checked: form.date_checked,
      source: form.source,
    }
    if (editPrice) {
      await supabase.from('reading_market_price').update(payload).eq('market_price_id', editPrice.market_price_id)
    } else {
      await supabase.from('reading_market_price').insert(payload)
    }
    setShowModal(false)
    fetchPrices()
  }

  const handleDelete = async () => {
    await supabase.from('reading_market_price').delete().eq('market_price_id', deleteTarget.market_price_id)
    setDeleteTarget(null)
    fetchPrices()
  }

  // price history for the selected item grouped by condition
  const priceHistory = selectedItemId
    ? prices.filter(p => p.item_id === selectedItemId).sort((a, b) => b.date_checked.localeCompare(a.date_checked))
    : []

  const historyByCondition = {}
  priceHistory.forEach(p => {
    const name = p.reading_condition?.condition_name || 'Unknown'
    if (!historyByCondition[name]) historyByCondition[name] = []
    historyByCondition[name].push(p)
  })

  const selectedItem = items.find(i => i.item_id === selectedItemId)

  if (loading) return <div className="page"><h1>Market Prices</h1><p>Loading...</p></div>

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
          { key: 'conditionName', label: 'Condition' },
          { key: 'price', label: 'Price', render: r => `$${r.price.toFixed(2)}` },
          { key: 'date_checked', label: 'Date Checked' },
          { key: 'source', label: 'Source' },
        ]}
        data={tableData}
        onRowClick={(row) => setSelectedItemId(row.item_id)}
        actions={(row) => (
          <>
            <button className="btn btn-sm" onClick={(e) => { e.stopPropagation(); openEdit(row) }}>Edit</button>
            <button className="btn btn-sm btn-danger" onClick={(e) => { e.stopPropagation(); setDeleteTarget(row) }}>Delete</button>
          </>
        )}
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
                    <tr><th>Price</th><th>Date</th><th>Source</th></tr>
                  </thead>
                  <tbody>
                    {entries.map(e => (
                      <tr key={e.market_price_id}>
                        <td>${e.price.toFixed(2)}</td>
                        <td>{e.date_checked}</td>
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
        <Modal title={editPrice ? 'Edit Price Entry' : 'Add Price Entry'} onClose={() => setShowModal(false)} onSave={handleSave}>
          <div className="form-grid">
            <label>Item
              <select value={form.item_id} onChange={e => setForm({ ...form, item_id: e.target.value })}>
                <option value="">Select item...</option>
                {items.map(item => <option key={item.item_id} value={item.item_id}>{item.title}</option>)}
              </select>
            </label>
            <label>Condition
              <select value={form.condition_id} onChange={e => setForm({ ...form, condition_id: e.target.value })}>
                <option value="">Select...</option>
                {conditions.map(c => <option key={c.condition_id} value={c.condition_id}>{c.condition_name}</option>)}
              </select>
            </label>
            <label>Price<input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></label>
            <label>Date Checked<input type="date" value={form.date_checked} onChange={e => setForm({ ...form, date_checked: e.target.value })} /></label>
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

      {deleteTarget && (
        <ConfirmDialog
          message="Are you sure you want to delete this price entry?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
