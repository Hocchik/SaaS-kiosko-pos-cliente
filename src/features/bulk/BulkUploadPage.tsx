import { useState, useRef } from 'react';
import useSWR from 'swr';
import { bulkApi, type BulkUploadResponse } from '../../api/bulk.api';
import { categoriesApi } from '../../api/categories.api';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

type UploadType = 'clients' | 'products';

export default function BulkUploadPage() {
  const [activeTab, setActiveTab] = useState<UploadType>('clients');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<BulkUploadResponse | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: categories = [] } = useSWR('categories', categoriesApi.findAll);

  const handleDownloadTemplate = async () => {
    try {
      const blob = activeTab === 'clients'
        ? await bulkApi.downloadClientTemplate()
        : await bulkApi.downloadProductTemplate();

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = activeTab === 'clients' ? 'plantilla_clientes.xlsx' : 'plantilla_productos.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al descargar la plantilla';
      setResult({ totalRows: 0, successCount: 0, errorCount: 1, errors: [{ row: 0, message: msg }] });
    }
  };

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    setResult(null);
    try {
      const response = activeTab === 'clients'
        ? await bulkApi.uploadClients(file)
        : await bulkApi.uploadProducts(file);
      setResult(response);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al subir el archivo';
      setResult({ totalRows: 0, successCount: 0, errorCount: 1, errors: [{ row: 0, message: msg }] });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: 'var(--font-heading)', color: 'var(--fg)' }}>
        Carga Masiva
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['clients', 'products'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setResult(null); }}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              backgroundColor: activeTab === tab ? 'var(--primary)' : 'var(--bg-surface)',
              color: activeTab === tab ? '#fff' : 'var(--fg-muted)',
              border: activeTab === tab ? 'none' : '1px solid var(--border)',
            }}
          >
            {tab === 'clients' ? 'Clientes' : 'Productos'}
          </button>
        ))}
      </div>

      {/* Info panel for products - show categories */}
      {activeTab === 'products' && categories.length > 0 && (
        <div
          className="mb-6 p-4 rounded-xl"
          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
          <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--fg)' }}>
            Categorías disponibles (usar el ID en la plantilla)
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span
                key={cat.id}
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg)' }}
              >
                <strong>{cat.id}</strong> — {cat.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Upload section */}
      <div
        className="p-6 rounded-xl space-y-4"
        style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-4 flex-wrap">
          <Button onClick={handleDownloadTemplate} variant="secondary">
            Descargar Plantilla
          </Button>
          <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
            Descarga la plantilla, llénala con los datos y súbela aquí
          </span>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx"
            className="text-sm file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:font-semibold file:text-sm file:cursor-pointer"
            style={{ color: 'var(--fg)' }}
          />
          <Button onClick={handleUpload} disabled={uploading}>
            {uploading ? <Spinner size="sm" /> : 'Subir Archivo'}
          </Button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="mt-6 p-4 rounded-xl" style={{
          backgroundColor: result.errorCount > 0 ? '#FEF2F2' : '#F0FDF4',
          border: `1px solid ${result.errorCount > 0 ? '#FECACA' : '#BBF7D0'}`,
        }}>
          <div className="flex gap-6 mb-3">
            <span className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>
              Total: {result.totalRows}
            </span>
            <span className="text-sm font-semibold" style={{ color: '#16A34A' }}>
              Exitosos: {result.successCount}
            </span>
            {result.errorCount > 0 && (
              <span className="text-sm font-semibold" style={{ color: '#DC2626' }}>
                Errores: {result.errorCount}
              </span>
            )}
          </div>

          {result.errors.length > 0 && (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {result.errors.map((err, i) => (
                <p key={i} className="text-xs" style={{ color: '#DC2626' }}>
                  {err.row > 0 ? `Fila ${err.row}: ` : ''}{err.message}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
