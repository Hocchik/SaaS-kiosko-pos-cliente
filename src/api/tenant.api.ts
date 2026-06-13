import apiClient from './client';
import type { TenantConfig } from '../types';

export async function getTenantConfig(): Promise<TenantConfig> {
  const res = await apiClient.get<TenantConfig>('/api/tenant/config');
  return res.data;
}
