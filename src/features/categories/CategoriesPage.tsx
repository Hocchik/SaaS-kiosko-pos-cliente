import { useState } from 'react';
import useSWR from 'swr';
import { categoriesApi } from '../../api/categories.api';
import type { CategoryResponse } from '../../types';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import CategoryFormModal from './CategoryFormModal';
import { useToastStore } from '../../store/toast.store';

export default function CategoriesPage() {
  const { data: categories = [], isLoading, mutate } = useSWR('categories', categoriesApi.findAll);
  const [editing, setEditing] = useState<CategoryResponse | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<CategoryResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const push = useToastStore((s) => s.push);

  const confirmDelete = async () => {
    if (!deletingCategory) return;
    setDeleting(true);
    try {
      await categoriesApi.delete(deletingCategory.id);
      push('Categoría eliminada', 'success');
      mutate();
    } catch {
      push('Error al eliminar', 'error');
    } finally {
      setDeleting(false);
      setDeletingCategory(null);
    }
  };

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--fg)' }}>Categorías</h1>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>Nueva Categoría</Button>
      </div>

      <Table
        columns={[
          { key: 'name', header: 'Nombre' },
          { key: 'description', header: 'Descripción' },
          {
            key: 'actions', header: '', render: (r) => (
              <div className="flex gap-3">
                <button onClick={() => { setEditing(r); setShowForm(true); }} className="text-sm font-medium" style={{ color: 'var(--accent)' }}>Editar</button>
                <button onClick={() => setDeletingCategory(r)} className="text-sm font-medium" style={{ color: 'var(--danger)' }}>Eliminar</button>
              </div>
            ),
          },
        ]}
        data={categories}
        pageSize={10}
      />

      {showForm && (
        <CategoryFormModal
          category={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => mutate()}
        />
      )}

      <Modal open={!!deletingCategory} onClose={() => setDeletingCategory(null)} title="Confirmar eliminación">
        <div className="space-y-4">
          <p style={{ color: 'var(--fg-muted)' }}>
            ¿Estás seguro de que deseas eliminar la categoría <strong style={{ color: 'var(--fg)' }}>{deletingCategory?.name}</strong>?
          </p>
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--danger-bg, rgba(239,68,68,0.1))', border: '1px solid var(--danger)' }}>
            <p className="text-sm font-medium" style={{ color: 'var(--danger)' }}>
              ⚠️ Esta acción eliminará permanentemente:
            </p>
            <ul className="mt-2 text-sm list-disc list-inside" style={{ color: 'var(--danger)' }}>
              <li>Todos los productos vinculados a esta categoría</li>
              <li>Todas las ventas asociadas a esos productos</li>
            </ul>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setDeletingCategory(null)}>Cancelar</Button>
            <Button variant="danger" loading={deleting} onClick={confirmDelete}>Eliminar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
