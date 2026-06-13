import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/auth.store';
import { useTenantStore } from '../../store/tenant.store';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login({ username, password });
      setAuth(res.token, res.username, res.role);
      useTenantStore.getState().loadTenantConfig();
      navigate('/pos');
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      const message = axiosErr.response?.data?.message || 'Error al conectar con el servidor';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg)' }}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm p-8 rounded-2xl"
        style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}
      >
        <h1 className="text-3xl font-bold text-center mb-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary)' }}>
          KioskoPOS
        </h1>
        <p className="text-center mb-8 text-sm" style={{ color: 'var(--fg-muted)' }}>Inicia sesión para continuar</p>

        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-lg text-sm font-medium"
            style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid var(--danger)', color: 'var(--danger)' }}
          >
            {error}
          </div>
        )}

        <Input label="Usuario" value={username} onChange={setUsername} placeholder="Tu usuario" />
        <Input label="Contraseña" value={password} onChange={setPassword} type="password" placeholder="••••••••" />

        <Button type="submit" loading={loading} className="w-full mt-4">
          Ingresar
        </Button>

        <p className="text-center mt-4 text-sm" style={{ color: 'var(--fg-muted)' }}>
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="underline" style={{ color: 'var(--accent)' }}>
            Regístrate
          </Link>
        </p>
      </form>
    </div>
  );
}
