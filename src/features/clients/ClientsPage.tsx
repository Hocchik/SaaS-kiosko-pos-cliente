import { useState } from 'react';
import useSWR from 'swr';
import { useNavigate } from 'react-router-dom';
import { clientsApi } from '../../api/clients.api';
import type { ClientResponse } from '../../types';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import ClientFormModal from './ClientFormModal';
import BulkUploadModal from '../../components/shared/BulkUploadModal';
import { useToastStore } from '../../store/toast.store';

export default function ClientsPage() {
  const { data: clients = [], isLoading, mutate } = useSWR('clients', clientsApi.findAll);
  const [editing, setEditing] = useState<ClientResponse | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [search, setSearch] = useState('');
  const push = useToastStore((s) => s.push);
  const navigate = useNavigate();

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return `${c.name} ${c.lastname}`.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q);
  });

  const handleDelete = async (id: number) => {
    try {
      await clientsApi.delete(id);
      push('Cliente eliminado', 'success');
      mutate();
    } catch {
      push('Error al eliminar', 'error');
    }
  };

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--fg)' }}>Clientes</h1>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowBulk(true)}>Carga Masiva</Button>
          <Button onClick={() => { setEditing(null); setShowForm(true); }}>Nuevo Cliente</Button>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre, email o teléfono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm px-4 py-2.5 rounded-lg text-sm outline-none transition-colors"
          style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg)' }}
        />
      </div>

      <Table
        columns={[
          { key: 'name', header: 'Nombre', render: (r) => `${r.name} ${r.lastname}` },
          { key: 'type', header: 'Tipo', render: (r) => r.type === 'student' ? 'Estudiante' : r.type === 'teacher' ? 'Profesor' : 'Cliente' },
          { key: 'email', header: 'Email' },
          { key: 'phone', header: 'Teléfono' },
          {
            key: 'actions', header: '', render: (r) => (
              <div className="flex gap-3">
                <button onClick={(e) => { e.stopPropagation(); setEditing(r); setShowForm(true); }} className="text-sm font-medium" style={{ color: 'var(--accent)' }}>Editar</button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }} className="text-sm font-medium" style={{ color: 'var(--danger)' }}>Eliminar</button>
              </div>
            ),
          },
        ]}
        data={filtered}
        onRowClick={(r) => navigate(`/clients/${r.id}`)}
        pageSize={10}
      />

      {showForm && (
        <ClientFormModal
          client={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => mutate()}
        />
      )}

      {showBulk && (
        <BulkUploadModal
          type="clients"
          onClose={() => setShowBulk(false)}
          onSuccess={() => mutate()}
        />
      )}
    </div>
  );
}
