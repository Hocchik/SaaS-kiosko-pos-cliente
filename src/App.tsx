import { RouterProvider } from 'react-router-dom';
import { useEffect } from 'react';
import { router } from './router';
import { useThemeStore } from './store/theme.store';
import { useTenantStore } from './store/tenant.store';
import { useAuthStore } from './store/auth.store';

function App() {
  const theme = useThemeStore((s) => s.theme);
  const { config, loading, loadTenantConfig } = useTenantStore();
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (token) loadTenantConfig();
  }, [token]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    if (!config) {
      document.title = 'KioskoPOS';
      return;
    }
    document.documentElement.style.setProperty('--primary', config.primaryColor);
    document.documentElement.style.setProperty('--accent', config.accentColor);
    document.title = config.name ? `KioskoPOS — ${config.name}` : 'KioskoPOS';
  }, [config]);

  if (loading && !config) {
    return (
      <>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: 'var(--bg)' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--primary)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        </div>
      </>
    );
  }

  return <RouterProvider router={router} />;
}

export default App;
