import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import SearchBar from '../components/SearchBar'
import SortableTable from '../components/SortableTable'

export default function Dashboard() {
  const [search, setSearch] = useState('')
  const [showReport, setShowReport] = useState(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedContactId, setSelectedContactId] = useState('')
  const [loading, setLoading] = useState(true)

  // all the data we need for the dashboard and reports
  const [items, setItems] = useState([])
  const [contacts, setContacts] = useState([])
  const [purchases, setPurchases] = useState([])
  const [sales, setSales] = useState([])
  const [marketPrices, setMarketPrices] = useState([])
  const [specialRequests, setSpecialRequests] = useState([])

  const fetchAll = async () => {
    const [itemRes, contactRes, purchaseRes, saleRes, priceRes, requestRes] = await Promise.all([
      supabase.from('reading_item').select('*, reading_category(category_name), reading_condition(condition_name)').order('item_id'),
      supabase.from('reading_contact').select('*').order('last_name'),
      supabase.from('reading_purchase').select('*, reading_contact(first_name, last_name), reading_acquisition_type(type_name), reading_purchase_item(*, reading_item(title))').order('purchase_date', { ascending: false }),
      supabase.from('reading_sale').select('*, reading_contact(first_name, last_name), reading_sale_item(*, reading_item(title))').order('sale_date', { ascending: false }),
      supabase.from('reading_market_price').select('*, reading_item(title), reading_condition(condition_name)').order('date_checked', { ascending: false }),
      supabase.from('reading_special_request').select('*, reading_contact(first_name, last_name)').order('date_requested', { ascending: false }),
    ])
    setItems(itemRes.data || [])
    setContacts(contactRes.data || [])
    setPurchases(purchaseRes.data || [])
    setSales(saleRes.data || [])
    setMarketPrices(priceRes.data || [])
    setSpecialRequests(requestRes.data || [])
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  // summary counts
  const openRequests = specialRequests.filter(r => r.status === 'Open').length

  // recent purchases (top 5)
  const recentPurchases = purchases.slice(0, 5).map(p => {
    const contact = p.reading_contact
    const lineItems = p.reading_purchase_item || []
    const itemNames = lineItems.map(li => li.reading_item?.title || 'Unknown').join(', ')
    const total = lineItems.reduce((sum, li) => sum + li.purchase_price * li.quantity, 0)
    return { id: p.purchase_id, date: p.purchase_date, supplier: contact ? `${contact.first_name} ${contact.last_name}` : 'Unknown', items: itemNames, total: `$${total.toFixed(2)}` }
  })

  // recent sales (top 5)
  const recentSales = sales.slice(0, 5).map(s => {
    const contact = s.reading_contact
    const lineItems = s.reading_sale_item || []
    const total = lineItems.reduce((sum, li) => sum + li.sale_price * li.quantity, 0)
    return { id: s.sale_id, date: s.sale_date, buyer: contact ? `${contact.first_name} ${contact.last_name}` : 'Unknown', itemCount: lineItems.length, total: `$${total.toFixed(2)}` }
  })

  // global search across items and contacts
  const searchLower = search.toLowerCase()
  const searchResults = search ? {
    inventory: items.filter(i => i.title.toLowerCase().includes(searchLower) || (i.description || '').toLowerCase().includes(searchLower)),
    contacts: contacts.filter(c => `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchLower) || (c.email || '').toLowerCase().includes(searchLower)),
  } : null

  // report 1: inventory count and value by category
  const inventoryByCategory = () => {
    const groups = {}
    items.forEach(item => {
      const catName = item.reading_category?.category_name || 'Unknown'
      if (!groups[catName]) groups[catName] = { count: 0, totalQty: 0, items: [] }
      groups[catName].count++
      groups[catName].totalQty += item.quantity_on_hand
      groups[catName].items.push(item)
    })
    return groups
  }

  // report 2: purchase history filtered by date range
  const purchaseReport = () => {
    return purchases.filter(p => {
      if (dateFrom && p.purchase_date < dateFrom) return false
      if (dateTo && p.purchase_date > dateTo) return false
      return true
    }).map(p => {
      const contact = p.reading_contact
      const lineItems = p.reading_purchase_item || []
      return {
        id: p.purchase_id,
        date: p.purchase_date,
        supplier: contact ? `${contact.first_name} ${contact.last_name}` : 'Unknown',
        type: p.reading_acquisition_type?.type_name || '',
        items: lineItems.map(li => li.reading_item?.title || 'Unknown').join(', '),
        total: lineItems.reduce((sum, li) => sum + li.purchase_price * li.quantity, 0),
      }
    })
  }

  // report 3: sales history filtered by date range
  const salesReport = () => {
    return sales.filter(s => {
      if (dateFrom && s.sale_date < dateFrom) return false
      if (dateTo && s.sale_date > dateTo) return false
      return true
    }).map(s => {
      const contact = s.reading_contact
      const lineItems = s.reading_sale_item || []
      return {
        id: s.sale_id,
        date: s.sale_date,
        buyer: contact ? `${contact.first_name} ${contact.last_name}` : 'Unknown',
        items: lineItems.map(li => li.reading_item?.title || 'Unknown').join(', '),
        total: lineItems.reduce((sum, li) => sum + li.sale_price * li.quantity, 0),
      }
    })
  }

  // report 4: top 5 most valuable items by their highest market price
  const topValueItems = () => {
    const itemPrices = {}
    marketPrices.forEach(mp => {
      if (!itemPrices[mp.item_id] || mp.price > itemPrices[mp.item_id].price) {
        itemPrices[mp.item_id] = mp
      }
    })
    return Object.values(itemPrices)
      .sort((a, b) => b.price - a.price)
      .slice(0, 5)
      .map(mp => ({
        id: mp.market_price_id,
        title: mp.reading_item?.title || 'Unknown',
        condition: mp.reading_condition?.condition_name || '',
        price: mp.price,
        date: mp.date_checked,
        source: mp.source,
      }))
  }

  // report 5: open special requests with contact info
  const openRequestsReport = () => {
    return specialRequests.filter(r => r.status === 'Open').map(r => ({
      id: r.request_id,
      contact: r.reading_contact ? `${r.reading_contact.first_name} ${r.reading_contact.last_name}` : 'Unknown',
      description: r.description,
      date: r.date_requested,
    }))
  }

  // report 6: all purchases and sales for a selected contact
  const contactHistory = () => {
    const cid = parseInt(selectedContactId)
    if (!cid) return { purchases: [], sales: [] }
    const cPurchases = purchases.filter(p => p.contact_id === cid).map(p => {
      const lineItems = p.reading_purchase_item || []
      return {
        id: p.purchase_id,
        date: p.purchase_date,
        type: 'Purchase',
        items: lineItems.map(li => li.reading_item?.title || 'Unknown').join(', '),
        total: lineItems.reduce((sum, li) => sum + li.purchase_price * li.quantity, 0),
      }
    })
    const cSales = sales.filter(s => s.contact_id === cid).map(s => {
      const lineItems = s.reading_sale_item || []
      return {
        id: s.sale_id,
        date: s.sale_date,
        type: 'Sale',
        items: lineItems.map(li => li.reading_item?.title || 'Unknown').join(', '),
        total: lineItems.reduce((sum, li) => sum + li.sale_price * li.quantity, 0),
      }
    })
    return { purchases: cPurchases, sales: cSales }
  }

  // toggles a report on and off, resets filters when switching
  const toggleReport = (name) => {
    setShowReport(showReport === name ? null : name)
    setDateFrom('')
    setDateTo('')
    setSelectedContactId('')
  }

  if (loading) return <div className="page"><h1>Dashboard</h1><p>Loading...</p></div>

  return (
    <div className="page">
      <h1>Dashboard</h1>

      <SearchBar value={search} onChange={setSearch} placeholder="Search inventory, contacts..." />

      {searchResults && (
        <div className="search-results">
          <h3>Search Results for "{search}"</h3>
          {searchResults.inventory.length > 0 && (
            <div className="search-section">
              <h4>Inventory ({searchResults.inventory.length})</h4>
              {searchResults.inventory.map(item => (
                <div key={item.item_id} className="search-result-item">
                  <strong>{item.title}</strong> — {item.reading_category?.category_name}, {item.reading_condition?.condition_name}, Qty: {item.quantity_on_hand}
                </div>
              ))}
            </div>
          )}
          {searchResults.contacts.length > 0 && (
            <div className="search-section">
              <h4>Contacts ({searchResults.contacts.length})</h4>
              {searchResults.contacts.map(c => (
                <div key={c.contact_id} className="search-result-item">
                  <strong>{c.first_name} {c.last_name}</strong> — {c.email}
                </div>
              ))}
            </div>
          )}
          {searchResults.inventory.length === 0 && searchResults.contacts.length === 0 && (
            <p className="no-results">No results found.</p>
          )}
        </div>
      )}

      {!searchResults && (
        <>
          <div className="card-row">
            <div className="card">
              <div className="card-value">{items.length}</div>
              <div className="card-label">Total Inventory</div>
            </div>
            <div className="card">
              <div className="card-value">{contacts.length}</div>
              <div className="card-label">Total Contacts</div>
            </div>
            <div className="card">
              <div className="card-value">{openRequests}</div>
              <div className="card-label">Open Requests</div>
            </div>
          </div>

          <div className="report-buttons">
            <button className={`btn ${showReport === 'category' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => toggleReport('category')}>Inventory by Category</button>
            <button className={`btn ${showReport === 'purchases' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => toggleReport('purchases')}>Purchase History</button>
            <button className={`btn ${showReport === 'sales' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => toggleReport('sales')}>Sales History</button>
            <button className={`btn ${showReport === 'topvalue' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => toggleReport('topvalue')}>Top 5 Valuable Items</button>
            <button className={`btn ${showReport === 'openreqs' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => toggleReport('openreqs')}>Open Requests</button>
            <button className={`btn ${showReport === 'contacthist' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => toggleReport('contacthist')}>Contact History</button>
          </div>

          {showReport === 'category' && (
            <div className="report-section">
              <h3>Inventory by Category</h3>
              {Object.entries(inventoryByCategory()).map(([cat, data]) => (
                <div key={cat} className="report-group">
                  <h4>{cat} ({data.count} items, {data.totalQty} total qty)</h4>
                  <SortableTable
                    columns={[
                      { key: 'title', label: 'Title' },
                      { key: 'conditionName', label: 'Condition' },
                      { key: 'quantity_on_hand', label: 'Qty' },
                    ]}
                    data={data.items.map(i => ({ ...i, id: i.item_id, conditionName: i.reading_condition?.condition_name || '' }))}
                  />
                </div>
              ))}
            </div>
          )}

          {showReport === 'purchases' && (
            <div className="report-section">
              <h3>Purchase History</h3>
              <div className="date-range-filter">
                <label>From: <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} /></label>
                <label>To: <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} /></label>
              </div>
              <SortableTable
                columns={[
                  { key: 'date', label: 'Date' },
                  { key: 'supplier', label: 'Supplier' },
                  { key: 'type', label: 'Type' },
                  { key: 'items', label: 'Items' },
                  { key: 'total', label: 'Total', render: r => `$${r.total.toFixed(2)}` },
                ]}
                data={purchaseReport()}
              />
            </div>
          )}

          {showReport === 'sales' && (
            <div className="report-section">
              <h3>Sales History</h3>
              <div className="date-range-filter">
                <label>From: <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} /></label>
                <label>To: <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} /></label>
              </div>
              <SortableTable
                columns={[
                  { key: 'date', label: 'Date' },
                  { key: 'buyer', label: 'Buyer' },
                  { key: 'items', label: 'Items' },
                  { key: 'total', label: 'Total', render: r => `$${r.total.toFixed(2)}` },
                ]}
                data={salesReport()}
              />
            </div>
          )}

          {showReport === 'topvalue' && (
            <div className="report-section">
              <h3>Top 5 Most Valuable Items</h3>
              <SortableTable
                columns={[
                  { key: 'title', label: 'Item' },
                  { key: 'condition', label: 'Condition' },
                  { key: 'price', label: 'Highest Price', render: r => `$${r.price.toFixed(2)}` },
                  { key: 'date', label: 'Date Checked' },
                  { key: 'source', label: 'Source' },
                ]}
                data={topValueItems()}
              />
            </div>
          )}

          {showReport === 'openreqs' && (
            <div className="report-section">
              <h3>Open Special Requests</h3>
              <SortableTable
                columns={[
                  { key: 'contact', label: 'Contact' },
                  { key: 'description', label: 'Description' },
                  { key: 'date', label: 'Date Requested' },
                ]}
                data={openRequestsReport()}
              />
            </div>
          )}

          {showReport === 'contacthist' && (
            <div className="report-section">
              <h3>Contact Transaction History</h3>
              <div className="date-range-filter">
                <label>Contact:
                  <select value={selectedContactId} onChange={e => setSelectedContactId(e.target.value)}>
                    <option value="">Select a contact...</option>
                    {contacts.map(c => <option key={c.contact_id} value={c.contact_id}>{c.first_name} {c.last_name}</option>)}
                  </select>
                </label>
              </div>
              {selectedContactId && (
                <>
                  <div className="report-group">
                    <h4>Purchases</h4>
                    <SortableTable
                      columns={[
                        { key: 'date', label: 'Date' },
                        { key: 'items', label: 'Items' },
                        { key: 'total', label: 'Total', render: r => `$${r.total.toFixed(2)}` },
                      ]}
                      data={contactHistory().purchases}
                    />
                  </div>
                  <div className="report-group">
                    <h4>Sales</h4>
                    <SortableTable
                      columns={[
                        { key: 'date', label: 'Date' },
                        { key: 'items', label: 'Items' },
                        { key: 'total', label: 'Total', render: r => `$${r.total.toFixed(2)}` },
                      ]}
                      data={contactHistory().sales}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <div className="dashboard-tables">
            <div className="dashboard-table-section">
              <h3>Recently Acquired</h3>
              <SortableTable
                columns={[
                  { key: 'date', label: 'Date' },
                  { key: 'supplier', label: 'Supplier' },
                  { key: 'items', label: 'Items' },
                  { key: 'total', label: 'Total' },
                ]}
                data={recentPurchases}
              />
            </div>
            <div className="dashboard-table-section">
              <h3>Recent Sales</h3>
              <SortableTable
                columns={[
                  { key: 'date', label: 'Date' },
                  { key: 'buyer', label: 'Buyer' },
                  { key: 'itemCount', label: 'Items' },
                  { key: 'total', label: 'Total' },
                ]}
                data={recentSales}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
