import { useState } from 'react';
import { useCartStore } from '../../../store/cart.store';
import { useToastStore } from '../../../store/toast.store';
import { useTenantStore } from '../../../store/tenant.store';
import { posApi } from '../../../api/pos.api';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';

interface Props {
  clientId: number;
  onClose: () => void;
}

export default function CheckoutModal({ clientId, onClose }: Props) {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total);
  const clear = useCartStore((s) => s.clear);
  const push = useToastStore((s) => s.push);
  const [notes, setNotes] = useState('');
  const [isDebt, setIsDebt] = useState(false);
  const [hasPartial, setHasPartial] = useState(false);
  const [amountPaid, setAmountPaid] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  const duesEnabled = useTenantStore((s) => s.isFeatureEnabled('dues'));

  const totalAmount = total();
  const parsedPaid = parseFloat(amountPaid);
  const pendingAmount = isDebt
    ? hasPartial && !isNaN(parsedPaid)
      ? totalAmount - parsedPaid
      : totalAmount
    : 0;

  const handleDebtToggle = (checked: boolean) => {
    setIsDebt(checked);
    if (!checked) {
      setHasPartial(false);
      setAmountPaid('');
      setDueDate('');
    }
  };

  const handleConfirm = async () => {
    if (isDebt && hasPartial) {
      if (isNaN(parsedPaid) || parsedPaid < 0 || parsedPaid >= totalAmount) {
        push('El abono debe ser mayor a 0 y menor al total', 'error');
        return;
      }
    }

    setLoading(true);
    try {
      await posApi.checkout({
        clientId,
        notes: notes || undefined,
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        amountPaid: isDebt ? (hasPartial ? parsedPaid : 0) : undefined,
        dueDate: isDebt && dueDate ? dueDate : undefined,
      });
      clear();
      push('Venta registrada exitosamente', 'success');
      onClose();
    } catch {
      push('Error al procesar la venta', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Confirmar Venta">
      <div className="space-y-3 mb-4">
        {items.map((item) => (
          <div key={item.product.id} className="flex justify-between text-sm" style={{ color: 'var(--fg)' }}>
            <span>{item.product.name} × {item.quantity}</span>
            <span>${(item.product.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold pt-2 border-t" style={{ borderColor: 'var(--border)', color: 'var(--fg)' }}>
          <span>Total</span>
          <span>${totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--fg)' }}>Notas (opcional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
          style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg)' }}
        />
      </div>

      {duesEnabled ? (
        <div
          className="mb-4 p-3 rounded-lg"
          style={{ backgroundColor: isDebt ? 'color-mix(in srgb, var(--danger) 8%, var(--bg))' : 'var(--bg)', border: `1px solid ${isDebt ? 'var(--danger)' : 'var(--border)'}`, transition: 'all 0.15s' }}
        >
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isDebt}
              onChange={(e) => handleDebtToggle(e.target.checked)}
              className="w-4 h-4 rounded"
              style={{ accentColor: 'var(--danger)' }}
            />
            <span className="text-sm font-semibold" style={{ color: isDebt ? 'var(--danger)' : 'var(--fg)' }}>
              Registrar como deuda
            </span>
            {isDebt ? (
              <span className="ml-auto text-sm font-bold" style={{ color: 'var(--danger)' }}>
                Debe: ${pendingAmount.toFixed(2)}
              </span>
            ) : null}
          </label>

          {isDebt ? (
            <div className="mt-3 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasPartial}
                  onChange={(e) => { setHasPartial(e.target.checked); setAmountPaid(''); }}
                  className="w-3.5 h-3.5 rounded"
                  style={{ accentColor: 'var(--accent)' }}
                />
                <span className="text-xs font-medium" style={{ color: 'var(--fg-muted)' }}>El cliente abona algo ahora</span>
              </label>

              {hasPartial ? (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--fg-muted)' }}>Monto abonado</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={totalAmount - 0.01}
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder={`Máx: $${(totalAmount - 0.01).toFixed(2)}`}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--fg)' }}
                    autoFocus
                  />
                </div>
              ) : null}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--fg-muted)' }}>Fecha límite de pago (opcional)</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--fg)' }}
                />
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
        <Button onClick={handleConfirm} loading={loading} className="flex-1">
          Confirmar
        </Button>
      </div>
    </Modal>
  );
}
