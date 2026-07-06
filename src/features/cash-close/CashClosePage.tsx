import { useState, useRef } from 'react';
import useSWR from 'swr';
import { cashCloseApi, CashCloseResponse, DaySummaryResponse } from '../../api/cash-close.api';
import { useToastStore } from '../../store/toast.store';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { Printer, CheckCircle, AlertCircle } from 'lucide-react';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n);

const fmtDate = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

export default function CashClosePage() {
  const today = new Date().toISOString().split('T')[0];
  const push = useToastStore((s) => s.push);
  const [actualCash, setActualCash] = useState('');
  const [notes, setNotes] = useState('');
  const [closing, setClosing] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const { data: summary, isLoading, mutate } = useSWR<DaySummaryResponse>(
    'cash-close-today',
    () => cashCloseApi.getSummary(today),
  );

  const { data: history = [] } = useSWR<CashCloseResponse[]>('cash-close-history', cashCloseApi.findAll);

  const handleClose = async () => {
    const val = parseFloat(actualCash);
    if (isNaN(val) || val < 0) { push('Ingresa un monto válido', 'error'); return; }
    setClosing(true);
    try {
      await cashCloseApi.close({ closeDate: today, actualCash: val, notes: notes || undefined });
      push('Caja cerrada correctamente', 'success');
      mutate();
    } catch (e: any) {
      push(e?.response?.data?.message || 'Error al cerrar caja', 'error');
    } finally {
      setClosing(false);
    }
  };

  const handlePrint = () => window.print();

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  if (!summary) return null;

  const closure = summary.closure;
  const diff = closure ? closure.difference : null;
  const diffPositive = diff !== null && diff >= 0;

  return (
    <>
      {/* Estilos solo para impresión */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #print-summary { display: block !important; position: fixed; top: 0; left: 0; width: 100%; }
          #print-summary * { color: #000 !important; background: #fff !important; }
        }
        #print-summary { display: none; }
      `}</style>

      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--fg)' }}>
          Cierre de Caja
        </h1>

        {/* Resumen del día */}
        <div className="rounded-2xl p-6 space-y-4" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--fg-muted)' }}>Hoy — {fmtDate(today)}</p>
              <p className="text-3xl font-bold mt-1" style={{ color: 'var(--fg)' }}>{fmt(summary.totalAmount)}</p>
              <p className="text-sm mt-0.5" style={{ color: 'var(--fg-muted)' }}>{summary.salesCount} ventas registradas</p>
            </div>
            {summary.isClosed && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                <CheckCircle size={14} /> Cerrado
              </span>
            )}
          </div>

          {summary.topProducts.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--fg-muted)' }}>
                Top productos hoy
              </p>
              <div className="space-y-1">
                {summary.topProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span style={{ color: 'var(--fg)' }}>{p.name}</span>
                    <span style={{ color: 'var(--fg-muted)' }}>{p.quantity} uds · {fmt(p.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cierre o resultado */}
        {summary.isClosed && closure ? (
          <div className="rounded-2xl p-6 space-y-3" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <p className="font-semibold" style={{ color: 'var(--fg)' }}>Resultado del cierre</p>
            <Row label="Efectivo esperado (sistema)" value={fmt(closure.expectedCash)} />
            <Row label="Efectivo contado" value={fmt(closure.actualCash)} />
            <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <span className="font-semibold" style={{ color: 'var(--fg)' }}>Diferencia</span>
              <span className="font-bold text-lg flex items-center gap-1.5"
                style={{ color: diffPositive ? '#22c55e' : 'var(--danger)' }}>
                {!diffPositive && <AlertCircle size={16} />}
                {fmt(closure.difference)}
              </span>
            </div>
            {closure.notes && (
              <p className="text-sm italic" style={{ color: 'var(--fg-muted)' }}>Nota: {closure.notes}</p>
            )}
            <Button onClick={handlePrint} className="w-full mt-2" style={{ backgroundColor: 'var(--bg)' }}>
              <Printer size={15} className="mr-2" /> Imprimir resumen
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl p-6 space-y-4" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <p className="font-semibold" style={{ color: 'var(--fg)' }}>Registrar cierre</p>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--fg-muted)' }}>
                Efectivo contado en caja (S/)
              </label>
              <input
                type="number"
                min="0"
                step="0.10"
                value={actualCash}
                onChange={(e) => setActualCash(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-xl text-lg font-mono"
                style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg)', outline: 'none' }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--fg-muted)' }}>
                Nota opcional
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: faltaron monedas de vuelto"
                className="w-full px-4 py-2.5 rounded-xl text-sm"
                style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg)', outline: 'none' }}
              />
            </div>
            <Button onClick={handleClose} loading={closing} className="w-full">
              Cerrar caja del día
            </Button>
          </div>
        )}

        {/* Historial */}
        {history.length > 0 && (
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>Historial de cierres</p>
            </div>
            <div className="divide-y" style={{ divideColor: 'var(--border)' }}>
              {history.slice(0, 10).map((c) => (
                <div key={c.id} className="flex items-center justify-between px-5 py-3"
                  style={{ backgroundColor: 'var(--bg-surface)' }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--fg)' }}>{fmtDate(c.closeDate)}</p>
                    <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>{c.salesCount} ventas · esperado {fmt(c.expectedCash)}</p>
                  </div>
                  <span className="text-sm font-semibold"
                    style={{ color: c.difference >= 0 ? '#22c55e' : 'var(--danger)' }}>
                    {c.difference >= 0 ? '+' : ''}{fmt(c.difference)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hoja de impresión */}
      <div id="print-summary" ref={printRef}>
        <PrintSummary summary={summary} closure={closure} />
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span style={{ color: 'var(--fg-muted)' }}>{label}</span>
      <span style={{ color: 'var(--fg)' }}>{value}</span>
    </div>
  );
}

function PrintSummary({ summary, closure }: { summary: DaySummaryResponse; closure: CashCloseResponse | null }) {
  const fmt = (n: number) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n);

  return (
    <div style={{ fontFamily: 'monospace', padding: '24px', maxWidth: '320px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 4 }}>RESUMEN DE CAJA</h2>
      <p style={{ textAlign: 'center', fontSize: 12, marginBottom: 16 }}>{fmtDate(summary.date)}</p>
      <hr />
      <table style={{ width: '100%', marginTop: 12, fontSize: 13 }}>
        <tbody>
          <tr><td>Total ventas</td><td style={{ textAlign: 'right' }}>{fmt(summary.totalAmount)}</td></tr>
          <tr><td>N° de ventas</td><td style={{ textAlign: 'right' }}>{summary.salesCount}</td></tr>
        </tbody>
      </table>
      {summary.topProducts.length > 0 && (
        <>
          <hr style={{ margin: '12px 0' }} />
          <p style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 6 }}>PRODUCTOS MÁS VENDIDOS</p>
          {summary.topProducts.map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span>{p.name}</span>
              <span>{p.quantity} uds</span>
            </div>
          ))}
        </>
      )}
      {closure && (
        <>
          <hr style={{ margin: '12px 0' }} />
          <p style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 6 }}>CIERRE DE CAJA</p>
          <table style={{ width: '100%', fontSize: 13 }}>
            <tbody>
              <tr><td>Esperado</td><td style={{ textAlign: 'right' }}>{fmt(closure.expectedCash)}</td></tr>
              <tr><td>Contado</td><td style={{ textAlign: 'right' }}>{fmt(closure.actualCash)}</td></tr>
              <tr style={{ fontWeight: 'bold' }}>
                <td>Diferencia</td>
                <td style={{ textAlign: 'right' }}>{fmt(closure.difference)}</td>
              </tr>
            </tbody>
          </table>
          {closure.notes && <p style={{ fontSize: 11, marginTop: 8 }}>Nota: {closure.notes}</p>}
        </>
      )}
      <hr style={{ margin: '12px 0' }} />
      <p style={{ textAlign: 'center', fontSize: 10 }}>KioskoPOS — {new Date().toLocaleString('es-PE')}</p>
    </div>
  );
}

function fmtDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('es-PE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}
