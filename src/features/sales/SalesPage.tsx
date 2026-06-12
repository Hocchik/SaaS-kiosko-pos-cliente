import { useState } from 'react';
import useSWR from 'swr';
import { useNavigate } from 'react-router-dom';
import { salesApi } from '../../api/sales.api';
import type { SaleResponse } from '../../types';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import SaleDetailModal from './SaleDetailModal';

export default function SalesPage() {
  const [selected, setSelected] = useState<SaleResponse | null>(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState('');
  const navigate = useNavigate();

  const key = appliedFrom && appliedTo
    ? (['sales/date-range', appliedFrom, appliedTo] as const)
    : 'sales';

  const { data: sales = [], isLoading } = useSWR(
    key,
    (k: string | readonly [string, string, string]) => Array.isArray(k) ? salesApi.findByDateRange(k[1], k[2]) : salesApi.findAll()
  );

  const handleFilter = () => {
    if (from && to) {
      setAppliedFrom(from);
      setAppliedTo(to);
    }
  };

  const handleClear = () => {
    setFrom('');
    setTo('');
    setAppliedFrom('');
    setAppliedTo('');
  };

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--fg)' }}>Ventas</h1>
        <Button onClick={() => navigate('/sales/add')}>Agregar Venta</Button>
      </div>

      <div
        className="flex gap-3 mb-8 items-end flex-wrap p-4 rounded-xl"
        style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--fg-muted)' }}>Desde</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="px-4 py-2.5 rounded-lg text-sm"
            style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg)' }}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--fg-muted)' }}>Hasta</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="px-4 py-2.5 rounded-lg text-sm"
            style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg)' }}
          />
        </div>
        <button
          onClick={handleFilter}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
        >
          Filtrar
        </button>
        {(from || to) ? (
          <button
            onClick={handleClear}
            className="px-3 py-2.5 text-sm font-medium"
            style={{ color: 'var(--accent)' }}
          >
            Limpiar
          </button>
        ) : null}
      </div>

      <Table
        columns={[
          { key: 'saleDate', header: 'Fecha' },
          { key: 'clientName', header: 'Cliente' },
          { key: 'totalAmount', header: 'Total', render: (r) => `$${r.totalAmount.toFixed(2)}` },
        ]}
        data={sales}
        onRowClick={setSelected}
        pageSize={10}
      />

      {selected && (
        <SaleDetailModal sale={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
