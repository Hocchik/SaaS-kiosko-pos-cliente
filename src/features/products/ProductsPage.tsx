import { useState } from 'react';
import useSWR from 'swr';
import { useNavigate } from 'react-router-dom';
import { productsApi } from '../../api/products.api';
import { categoriesApi } from '../../api/categories.api';
import type { ProductResponse } from '../../types';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import ProductFormModal from './ProductFormModal';
import BulkUploadModal from '../../components/shared/BulkUploadModal';
import { useToastStore } from '../../store/toast.store';

export default function ProductsPage() {
  const { data: products = [], isLoading, mutate } = useSWR('products', productsApi.findAll);
  const { data: categories = [] } = useSWR('categories', categoriesApi.findAll);
  const [editing, setEditing] = useState<ProductResponse | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [search, setSearch] = useState('');
  const push = useToastStore((s) => s.push);
  const navigate = useNavigate();

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q);
  });

  const handleDelete = async (id: number) => {
    try {
      await productsApi.delete(id);
      push('Producto eliminado', 'success');
      mutate();
    } catch {
      push('Error al eliminar', 'error');
    }
  };

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--fg)' }}>Productos</h1>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowBulk(true)}>Carga Masiva</Button>
          <Button onClick={() => { setEditing(null); setShowForm(true); }}>Nuevo Producto</Button>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre o descripción..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm px-4 py-2.5 rounded-lg text-sm outline-none transition-colors"
          style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg)' }}
        />
      </div>

      <Table
        columns={[
          { key: 'name', header: 'Nombre' },
          { key: 'price', header: 'Precio', render: (r) => `$${r.price.toFixed(2)}` },
          { key: 'stock', header: 'Stock' },
          { key: 'active', header: 'Estado', render: (r) => <Badge variant={r.active ? 'success' : 'danger'}>{r.active ? 'Activo' : 'Inactivo'}</Badge> },
          {
            key: 'actions', header: '', render: (r) => (
              <div className="flex gap-3">
                <button onClick={(e) => { e.stopPropagation(); setEditing(r); setShowForm(true); }} className="text-sm font-medium transition-colors" style={{ color: 'var(--accent)' }}>Editar</button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }} className="text-sm font-medium transition-colors" style={{ color: 'var(--danger)' }}>Eliminar</button>
              </div>
            ),
          },
        ]}
        data={filtered}
        onRowClick={(r) => navigate(`/products/${r.id}`)}
        pageSize={10}
      />

      {showForm && (
        <ProductFormModal
          product={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => mutate()}
        />
      )}

      {showBulk && (
        <BulkUploadModal
          type="products"
          categories={categories}
          onClose={() => setShowBulk(false)}
          onSuccess={() => mutate()}
        />
      )}
    </div>
  );
}
