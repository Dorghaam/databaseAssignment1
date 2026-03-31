import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import SortableTable from '../components/SortableTable'
import SearchBar from '../components/SearchBar'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'

const emptyForm = { title: '', category_id: '', description: '', era: '', region: '', format: '', condition_id: '', quantity_on_hand: 1 }

export default function Inventory() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [conditions, setConditions] = useState([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [conditionFilter, setConditionFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [loading, setLoading] = useState(true)

  // pulls items with their category and condition names from supabase
  const fetchItems = async () => {
    const { data } = await supabase
      .from('reading_item')
      .select('*, reading_category(category_name), reading_condition(condition_name)')
      .order('item_id')
    setItems(data || [])
    setLoading(false)
  }

  // pulls the lookup tables so we can fill the dropdowns in the form
  const fetchLookups = async () => {
    const { data: cats } = await supabase.from('reading_category').select('*').order('category_id')
    const { data: conds } = await supabase.from('reading_condition').select('*').order('condition_id')
    setCategories(cats || [])
    setConditions(conds || [])
  }

  useEffect(() => { fetchItems(); fetchLookups() }, [])

  // flatten the joined data so sortable table can sort by these columns
  const tableData = items.map(item => ({
    ...item,
    id: item.item_id,
    categoryName: item.reading_category?.category_name || '',
    conditionName: item.reading_condition?.condition_name || '',
  }))

  const filtered = tableData.filter(item => {
    if (categoryFilter && item.category_id !== parseInt(categoryFilter)) return false
    if (conditionFilter && item.condition_id !== parseInt(conditionFilter)) return false
    if (search) {
      const s = search.toLowerCase()
      if (!item.title.toLowerCase().includes(s) && !(item.description || '').toLowerCase().includes(s)) return false
    }
    return true
  })

  const openAdd = () => {
    setEditItem(null)
    setForm({ ...emptyForm })
    setShowModal(true)
  }

  const openEdit = (item) => {
    setEditItem(item)
    setForm({
      title: item.title,
      category_id: item.category_id || '',
      description: item.description || '',
      era: item.era || '',
      region: item.region || '',
      format: item.format || '',
      condition_id: item.condition_id || '',
      quantity_on_hand: item.quantity_on_hand,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    const payload = {
      title: form.title,
      category_id: parseInt(form.category_id) || null,
      description: form.description,
      era: form.era,
      region: form.region,
      format: form.format,
      condition_id: parseInt(form.condition_id) || null,
      quantity_on_hand: parseInt(form.quantity_on_hand) || 0,
    }
    if (editItem) {
      await supabase.from('reading_item').update(payload).eq('item_id', editItem.item_id)
    } else {
      await supabase.from('reading_item').insert(payload)
    }
    setShowModal(false)
    fetchItems()
  }

  const handleDelete = async () => {
    await supabase.from('reading_item').delete().eq('item_id', deleteTarget.item_id)
    setDeleteTarget(null)
    fetchItems()
  }

  const updateForm = (field, value) => setForm({ ...form, [field]: value })

  if (loading) return <div className="page"><h1>Inventory</h1><p>Loading...</p></div>

  return (
    <div className="page">
      <h1>Inventory</h1>

      <div className="toolbar">
        <div className="filters">
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
          </select>
          <select value={conditionFilter} onChange={e => setConditionFilter(e.target.value)}>
            <option value="">All Conditions</option>
            {conditions.map(c => <option key={c.condition_id} value={c.condition_id}>{c.condition_name}</option>)}
          </select>
          <SearchBar value={search} onChange={setSearch} placeholder="Search title or keyword..." />
        </div>
        <button className="btn btn-primary" onClick={openAdd}>Add Item</button>
      </div>

      <SortableTable
        columns={[
          { key: 'title', label: 'Title' },
          { key: 'categoryName', label: 'Category' },
          { key: 'conditionName', label: 'Condition' },
          { key: 'quantity_on_hand', label: 'Qty' },
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
        <Modal title={editItem ? 'Edit Item' : 'Add Item'} onClose={() => setShowModal(false)} onSave={handleSave}>
          <div className="form-grid">
            <label>Title<input type="text" value={form.title} onChange={e => updateForm('title', e.target.value)} /></label>
            <label>Category
              <select value={form.category_id} onChange={e => updateForm('category_id', e.target.value)}>
                <option value="">Select...</option>
                {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
              </select>
            </label>
            <label className="full-width">Description<textarea value={form.description} onChange={e => updateForm('description', e.target.value)} rows={3} /></label>
            <label>Era<input type="text" value={form.era} onChange={e => updateForm('era', e.target.value)} /></label>
            <label>Region<input type="text" value={form.region} onChange={e => updateForm('region', e.target.value)} /></label>
            <label>Format<input type="text" value={form.format} onChange={e => updateForm('format', e.target.value)} /></label>
            <label>Condition
              <select value={form.condition_id} onChange={e => updateForm('condition_id', e.target.value)}>
                <option value="">Select...</option>
                {conditions.map(c => <option key={c.condition_id} value={c.condition_id}>{c.condition_name}</option>)}
              </select>
            </label>
            <label>Quantity<input type="number" min="0" value={form.quantity_on_hand} onChange={e => updateForm('quantity_on_hand', e.target.value)} /></label>
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
  )
}
