import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getTenantConfig } from '../api/tenant.api';
import type { TenantConfig } from '../types';

interface TenantState {
  config: TenantConfig | null;
  loading: boolean;
  error: string | null;
  loadTenantConfig: () => Promise<void>;
  isFeatureEnabled: (feature: string) => boolean;
}

const DEFAULT_CONFIG: TenantConfig = {
  name: 'POS',
  primaryColor: '#6366f1',
  accentColor: '#22c55e',
  logoUrl: null,
  currency: 'PEN',
  duesLabel: 'Fiar',
  features: { dues: true, bulk_upload: true, reports: false },
};

export const useTenantStore = create<TenantState>()(
  persist(
    (set, get) => ({
      config: null,
      loading: false,
      error: null,
      loadTenantConfig: async () => {
        set({ loading: true, error: null });
        try {
          const config = await getTenantConfig();
          set({ config, loading: false });
        } catch {
          set({ error: 'Tenant no disponible', loading: false, config: DEFAULT_CONFIG });
        }
      },
      isFeatureEnabled: (feature: string) => {
        const config = get().config ?? DEFAULT_CONFIG;
        return config.features[feature] ?? false;
      },
    }),
    { name: 'tenant-config' }
  )
);
