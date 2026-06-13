import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import * as tenantApi from '../api/tenant.api';
import type { TenantConfig } from '../types';

const MOCK_CONFIG: TenantConfig = {
  name: 'Test Tenant',
  primaryColor: '#ff0000',
  accentColor: '#00ff00',
  logoUrl: null,
  currency: 'USD',
  duesLabel: 'Crédito',
  features: { dues: true, bulk_upload: false, reports: true },
};

describe('useTenantStore', () => {
  beforeEach(async () => {
    const { useTenantStore } = await import('./tenant.store');
    useTenantStore.setState({ config: null, loading: false, error: null });
  });

  it('loads config successfully', async () => {
    vi.spyOn(tenantApi, 'getTenantConfig').mockResolvedValueOnce(MOCK_CONFIG);
    const { useTenantStore } = await import('./tenant.store');
    await act(async () => {
      await useTenantStore.getState().loadTenantConfig();
    });
    const state = useTenantStore.getState();
    expect(state.config?.name).toBe('Test Tenant');
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('sets default config on error', async () => {
    vi.spyOn(tenantApi, 'getTenantConfig').mockRejectedValueOnce(new Error('network'));
    const { useTenantStore } = await import('./tenant.store');
    await act(async () => {
      await useTenantStore.getState().loadTenantConfig();
    });
    const state = useTenantStore.getState();
    expect(state.error).toBe('Tenant no disponible');
    expect(state.config?.name).toBe('POS');
  });

  it('isFeatureEnabled returns correct values', async () => {
    vi.spyOn(tenantApi, 'getTenantConfig').mockResolvedValueOnce(MOCK_CONFIG);
    const { useTenantStore } = await import('./tenant.store');
    await act(async () => {
      await useTenantStore.getState().loadTenantConfig();
    });
    const { isFeatureEnabled } = useTenantStore.getState();
    expect(isFeatureEnabled('dues')).toBe(true);
    expect(isFeatureEnabled('bulk_upload')).toBe(false);
    expect(isFeatureEnabled('nonexistent')).toBe(false);
  });
});
