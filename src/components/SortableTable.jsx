import { useState } from 'react';

export default function SortableTable({ columns, data, onRowClick, actions }) {
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (key) => {
    if (sortCol === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(key);
      setSortDir('asc');
    }
  };

  const sorted = [...data].sort((a, b) => {
    if (!sortCol) return 0;
    const aVal = a[sortCol];
    const bVal = b[sortCol];
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    if (typeof aVal === 'number') return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    return sortDir === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} onClick={() => handleSort(col.key)} style={{ cursor: 'pointer' }}>
                {col.label}
                {sortCol === col.key && (
                  <span className="sort-arrow">{sortDir === 'asc' ? ' \u25B2' : ' \u25BC'}</span>
                )}
              </th>
            ))}
            {actions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr><td colSpan={columns.length + (actions ? 1 : 0)} className="empty-row">No records found</td></tr>
          ) : (
            sorted.map((row, i) => (
              <tr key={row.id || i} onClick={() => onRowClick?.(row)} style={onRowClick ? { cursor: 'pointer' } : {}}>
                {columns.map(col => (
                  <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
                ))}
                {actions && <td className="actions-cell">{actions(row)}</td>}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
