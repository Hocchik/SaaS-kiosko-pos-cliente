import { NavLink } from 'react-router-dom';
import {
  ShoppingCart,
  LayoutDashboard,
  Receipt,
  Users,
  Package,
  Tag,
  ChevronLeft,
  ChevronRight,
  Upload,
  FileText,
  Landmark,
} from 'lucide-react';
import { useSidebarStore } from '../../store/sidebar.store';
import { useTenantStore } from '../../store/tenant.store';

const ALL_LINKS = [
  { to: '/pos',        label: 'POS',        Icon: ShoppingCart },
  { to: '/dashboard',  label: 'Dashboard',  Icon: LayoutDashboard },
  { to: '/sales',      label: 'Ventas',     Icon: Receipt },
  { to: '/clients',    label: 'Clientes',   Icon: Users,     feature: 'dues' },
  { to: '/products',   label: 'Productos',  Icon: Package },
  { to: '/categories', label: 'Categorías', Icon: Tag },
  { to: '/bulk',       label: 'Importar',   Icon: Upload,    feature: 'bulk_upload' },
  { to: '/cash-close', label: 'Caja',        Icon: Landmark },
  { to: '/reports',    label: 'Reportes',   Icon: FileText,  feature: 'reports' },
];

export default function Sidebar() {
  const collapsed        = useSidebarStore((s) => s.collapsed);
  const toggle           = useSidebarStore((s) => s.toggle);
  const tenantName       = useTenantStore((s) => s.config?.name ?? 'POS');
  const logoUrl          = useTenantStore((s) => s.config?.logoUrl ?? null);
  const isFeatureEnabled = useTenantStore((s) => s.isFeatureEnabled);

  const links = ALL_LINKS.filter(
    (link) => !('feature' in link) || isFeatureEnabled(link.feature as string),
  );

  return (
    <aside
      className="flex shrink-0 flex-col overflow-hidden transition-all duration-300"
      style={{
        width: collapsed ? '4.5rem' : '15rem',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
      }}
    >
      <div
        className="flex items-center border-b px-3"
        style={{
          borderColor: 'var(--border)',
          minHeight: '4rem',
          justifyContent: collapsed ? 'center' : 'space-between',
        }}
      >
        {collapsed ? (
          <button
            onClick={toggle}
            className="flex items-center justify-center w-9 h-9 rounded-lg transition-opacity hover:opacity-70"
            style={{
              color: 'var(--fg-muted)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg)',
            }}
            title="Expandir menú"
          >
            <ChevronRight size={16} />
          </button>
        ) : (
          <>
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: logoUrl ? '#fff' : 'var(--primary)', padding: logoUrl ? '2px' : '0' }}
              >
                {logoUrl ? (
                  <img src={logoUrl} alt={tenantName} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-base font-bold" style={{ color: '#fff' }}>
                    {tenantName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <h2
                  className="text-base font-bold tracking-tight leading-tight truncate"
                  style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary)' }}
                >
                  {tenantName}
                </h2>
                <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                  Sistema de gestión
                </p>
              </div>
            </div>
            <button
              onClick={toggle}
              className="ml-2 flex shrink-0 items-center justify-center w-7 h-7 rounded-md transition-opacity hover:opacity-70"
              style={{ color: 'var(--fg-muted)' }}
              title="Colapsar menú"
            >
              <ChevronLeft size={16} />
            </button>
          </>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {links.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 ${
                collapsed ? 'justify-center px-2' : 'px-3'
              } ${!isActive ? 'hover:opacity-80' : ''}`
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? 'var(--primary)' : 'transparent',
              color: isActive ? '#fff' : 'var(--fg-muted)',
            })}
            title={collapsed ? label : undefined}
          >
            <Icon size={18} strokeWidth={1.75} className="shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {!collapsed && (
        <div className="border-t px-3 py-3" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs text-center" style={{ color: 'var(--fg-muted)', opacity: 0.5 }}>
            v1.0
          </p>
        </div>
      )}
    </aside>
  );
}
