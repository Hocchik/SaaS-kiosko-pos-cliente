import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  pageSize?: number;
}

export default function Table<T extends { id?: number }>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'Sin datos',
  pageSize,
}: TableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => { setCurrentPage(1); }, [data]);

  if (data.length === 0) {
    return (
      <div
        className="py-16 text-center"
        style={{
          color: 'var(--fg-muted)',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-surface)',
          paddingInline: '0.75rem',
        }}
      >
        <p className="text-lg opacity-60">∅</p>
        <p className="mt-2 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  const totalPages    = pageSize ? Math.ceil(data.length / pageSize) : 1;
  const paginatedData = pageSize
    ? data.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : data;
  const showPagination = !!pageSize && totalPages > 1;
  const from = pageSize ? (currentPage - 1) * pageSize + 1 : 1;
  const to   = pageSize ? Math.min(currentPage * pageSize, data.length) : data.length;

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        borderRadius: 'var(--radius-surface)',
        overflow: 'hidden',
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-surface-alt)' }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left px-5 py-4 font-semibold text-xs uppercase tracking-wider"
                  style={{ color: 'var(--fg-muted)', borderBottom: '1px solid var(--border)' }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, idx) => (
              <tr
                key={row.id ?? idx}
                onClick={() => onRowClick?.(row)}
                className={`transition-colors duration-150 ${onRowClick ? 'cursor-pointer' : ''}`}
                style={{
                  borderBottom:
                    idx < paginatedData.length - 1 ? '1px solid var(--border)' : 'none',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-alt)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-5 py-4 align-middle" style={{ color: 'var(--fg)' }}>
                    {col.render
                      ? col.render(row)
                      : (row as Record<string, unknown>)[col.key] as React.ReactNode}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPagination && (
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}
        >
          <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
            Mostrando {from}–{to} de {data.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-opacity disabled:opacity-40"
              style={{
                border: '1px solid var(--border)',
                color: 'var(--fg-muted)',
                backgroundColor: 'var(--bg)',
              }}
            >
              <ChevronLeft size={15} />
            </button>
            <span
              className="text-sm font-medium text-center"
              style={{ color: 'var(--fg)', minWidth: '5rem' }}
            >
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-opacity disabled:opacity-40"
              style={{
                border: '1px solid var(--border)',
                color: 'var(--fg-muted)',
                backgroundColor: 'var(--bg)',
              }}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
